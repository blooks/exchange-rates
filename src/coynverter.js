//15.01.2015 LFG Working under testing purposes//Now heavy development on this file, full of crap, many thinks to improve
var request = require('request'),
    moment = require('moment'),
    _ = require('underscore'),
    log = require('tracer').colorConsole(),
    uuid = require('node-uuid'),
    mongoUtil = require('./mongoUtil');

var currencies = ["EUR", "USD"];

/**
 * [_getOneDateNotInDatabase description]
 * @param  {[type]}   date     [description]
 * @param  {[type]}   currency [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var _getOneDateNotInDatabase = function (date, currency, callback) {
  "use strict";
  var url = 'https://api.coindesk.com/v1/bpi/historical/close.json?start='+date+'&end='+date+'&currency='+currency;
  request.get({uri: url}, function (err, response, body) {
    if(err){
      log.error(err);
    }
    if(response){
      //console.log(response);
    }
    if(body){
      try {
        var ratesValues = JSON.parse(body);
        var currencyDataForDate = {};
        currencyDataForDate[currency] = ratesValues.bpi[date];
        currencyDataForDate.date = date;
        return callback(null, currencyDataForDate);
      } catch (error) {
        return callback(error, null);
      }
    }
  });
};
/**
 * [getExchangeRateForDate description]
 * @param  {[type]} date            [description]
 * @param  {[type]} currency      [description]
 * @return {[type]}                 [description]
 */
var _getExchangeRateForOneDate = function (date, currency, collectionToWriteName, collection, callback) {
  //Variables
  "use strict";
  var exchangeRate,
      queryParams = {},
      db = mongoUtil.getDb();
  queryParams.date = new Date(date);
  queryParams[currency] = {$exists: true};
  db.collection(collectionToWriteName).findOne(queryParams, function (err, document) {
    if(err){
      log.error(err);
    }
    if(document){
      log.info(document);
      return callback(null, document);
    }else{
      queryParams.date = new Date(date);
      queryParams[currency] = {$exists: false};
      db.collection(collectionToWriteName).findOne(queryParams, function (err, document) {
        if(err){
          log.error(err);
        }
        if(document){
          //log.info(document);
          _getOneDateNotInDatabase(date, currency, function (err, result) {
            if(result){
              var exchangeRateForDate = {};
              exchangeRateForDate[currency] = result[currency];
              db.collection(collectionToWriteName).update({_id: document._id}, {$set: exchangeRateForDate}, {w:1}, function (err, result) {
                if(result){
                  log.info(result);
                }
                if(err){
                  log.error(err);
                }
              });
            }
            if(err){
              log.error(err);
            }
          });
          return callback(null, document);
        }else{
          _getOneDateNotInDatabase(date, currency, function (err, result) {
            if(result){
              var exchangeRateForDate = {};
              exchangeRateForDate._id = uuid.v1();
              exchangeRateForDate[currency] = result[currency];
              exchangeRateForDate.date = new Date(result.date);
              db.collection(collectionToWriteName).insert(exchangeRateForDate, {w:1}, function  (err, result) {
                if(result){
                  log.info(result);
                }
                if(err){
                  log.error(err);
                }
              });
            }
            if(err){
              log.error(err);
            }
          });
        }
      });
    }
  });
};

function Coynverter() {
  
}

/**
 * [update description]
 * @param  {[type]}   databaseName       [description]
 * @param  {[type]}   collectionToUpdate [description]
 * @param  {[type]}   currency           [description]
 * @param  {Function} callback           [description]
 * @return {[type]}                      [description]
 */
Coynverter.prototype.update = function (databaseName, collectionToUpdate, currency, callback) {
  "use strict";
  mongoUtil.connectToServer(databaseName, function ( err ) {
    var db = mongoUtil.getDb();
    db.collection(collectionToUpdate, function (error, collection) {
      if(collection){
        try {
          var todayUpdate = moment(new Date()).subtract(1, 'days').format("YYYY-MM-DD");
          _getExchangeRateForOneDate(todayUpdate, currency, collectionToUpdate, collection, function (err, result) {
            if(result){
              return callback(null, result);
            }
          });
        } catch (err) {
          log.error(err);
          return callback(err, null);
        }
      }
      if(error){
        log.error(error);
      }
    });
  });
};
/**
 * [convert description]
 * @param  {[type]}   databaseName     [description]
 * @param  {[type]}   date             [description]
 * @param  {[type]}   currency         [description]
 * @param  {[type]}   amountToConvert  [description]
 * @param  {[type]}   collectionToRead [description]
 * @param  {Function} callback         [description]
 * @return {[type]}                    [description]
 */
Coynverter.prototype.convert = function (databaseName, date, currency,  amountToConvert, collectionToRead, callback) {
  "use strict";
  mongoUtil.connectToServer(databaseName, function ( err ) {
    var db = mongoUtil.getDb();
    var queryParams = {};
    queryParams.date = new Date(date);
    queryParams[currency] = {$exists: true};
    db.collection(collectionToRead).findOne(queryParams, function (err, document) {
      if(err){
        log.error(err);
      }
      if(document){
        var conversion = document[currency] * amountToConvert;
        return callback(null, conversion);
      }else{
        var todayUpdate = moment(new Date()).subtract(1, 'days').format("YYYY-MM-DD");
        _getExchangeRateForOneDate(todayUpdate, currency, collectionToRead, collection, function (err, result) {
          return callback(null, result);
        });
      }
    });
  });
};

/**
 * [getExchangeRatesForNewCurrency description]
 * @param  {[type]}   databaseName          [description]
 * @param  {[type]}   currency              [description]
 * @param  {[type]}   collectionToWriteName [description]
 * @param  {Function} callback              [description]
 * @return {[type]}                         [description]
 */
Coynverter.prototype.getExchangeRatesForNewCurrency = function (databaseName, currency, collectionToWriteName, callback) {
  "use strict";
  var today = moment(new Date()).subtract(1, 'days').format("YYYY-MM-DD");
  var url = 'https://api.coindesk.com/v1/bpi/historical/close.json?start=2010-07-17&end='+today+'&currency='+currency;
  return request.get({uri: url}, function (err, response, body) {
    if(err){
      log.error(err);
    }
    if(response){
      //log.info(response);
    }
    if(body){
      var ratesValues = JSON.parse(body),
          exchangeRatesCurrency = ratesValues.bpi,
          arrayValuesForDatabase = [],
          db = mongoUtil.getDb();
      //Format information for storage new currency data in database
      _.each(exchangeRatesCurrency, function (value, prop) {
        var datesAndExchangeRates = {};
        datesAndExchangeRates._id = uuid.v1();
        datesAndExchangeRates[currency] = value;
        datesAndExchangeRates.date = new Date(prop);
        arrayValuesForDatabase.push(datesAndExchangeRates);
      });
      mongoUtil.connectToServer(databaseName, function ( err ) {
        var db = mongoUtil.getDb();
        arrayValuesForDatabase.forEach(function (exchangeRate) {
          var queryParams = {};
          queryParams.date = exchangeRate.date;
          db.collection(collectionToWriteName).findOne(queryParams, function (err, document) {
            if(err){
              log.error(err);
            }
            if(document){
              var paramsToUpdate = {};
              paramsToUpdate[currency] = exchangeRate[currency];
              db.collection(collectionToWriteName).update({_id: document._id}, {$set: paramsToUpdate}, {w:1}, function (err, result) {
                if(result){
                  log.info(result);
                }
                if(err){
                  log.error(err);
                }
              });
            }
            else{
              db.collection(collectionToWriteName).insert(exchangeRate, {w:1}, function  (err, result) {
                if(result){
                  return callback(null, result);
                }
                if(err){
                  return callback(err, null);
                }
              });
            }
          });
        });
      });
    }
  });
};

module.exports = Coynverter;