//15.01.2015 LFG Working under testing purposes//Now heavy development on this file, full of crap, many thinks to improve
var request = require('request'),
    moment = require('moment'),
    _ = require('underscore'),
    //Production
    //log = require('tracer').colorConsole({level: 'error'}),
    //Development
    log = require('tracer').colorConsole(),
    uuid = require('node-uuid'),
    mongoUtil = require('./mongoUtil');

var currencies = ["EUR", "USD"];

// var start = new Date("02/05/2013");
// var end = new Date("02/10/2013");

// while(start < end){
//    alert(start);           

//    var newDate = start.setDate(start.getDate() + 1);
//    start = new Date(newDate);
// }
/**
 * _getOneDateNotInDatabase looks for one date not available in the database for the currency at the day specified in the method call (Internal method)
 * @param  {String}   date     date to look for for the exchange rate
 * @param  {String}   currency Currency to ook for exchange rate
 * @param  {Function} callback return two possible objects, error and result of the operation
 * @return {undefined}         not value returned
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
 * _getExchangeRateForOneDate looks for the currency value for specific day (Internal method)
 * @param  {String}   date                  the day to look for in the database, if no data in database request to coinbase API
 * @param  {String}   currency              the currency to find the conversion rate
 * @param  {String}   collectionToWriteName collection in the database where the exchange rate would be stored
 * @param  {Function} callback              return two possible objects, error and result of the operation
 * @return {undefined}                      description
 */
var _getExchangeRateForOneDate = function (date, currency, collectionToWriteName, callback) {
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
      //log.info(document);
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
                  return callback(null, result);
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

/**
 * Coynverter constructor for Coynverter package
 */
function Coynverter (mongourl) {
  this.mongo = mongourl;
}

/**
 * update the information available on the database
 * @param  {String}   collectionToUpdate Collection in the mongodb to store the information
 * @param  {String}   currency           the currency to find the conversion rate
 * @param  {Function} callback           return two possible objects, error and result of the operation
 * @return {undefined}                   not return value
 */
Coynverter.prototype.update = function (collectionToUpdate, currency, callback) {
  "use strict";
  mongoUtil.connectToServer(this.mongo, function ( err ) {
    var db = mongoUtil.getDb();
    db.collection(collectionToUpdate, function (error, collection) {
      if(collection){
        try {
          var todayUpdate = moment(new Date()).subtract(1, 'days').format("YYYY-MM-DD");
          _getExchangeRateForOneDate(todayUpdate, currency, collectionToUpdate, function (err, result) {
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
 * convert convert a specified amount of BTC to a specified currency for one date
 * @param  {String}   date             the day to look for in the database, if no data in database request to coinbase API
 * @param  {String}   currency         the currency to find the conversion rate
 * @param  {Number}   amountToConvert  the amount of bitcoins to convert to the currency specified
 * @param  {String}   collectionToRead collection where to check if the information is already available
 * @param  {Function} callback         return two possible objects, error and result of the operation
 * @return {undefined}                 not return value
 */
Coynverter.prototype.convert = function (date, currency,  amountToConvert, collectionToRead, callback) {
  "use strict";
  mongoUtil.connectToServer(this.mongo, function ( err ) {
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
        _getExchangeRateForOneDate(todayUpdate, currency, collectionToRead, function (err, result) {
          return callback(null, result[currency]*amountToConvert);
        });
      }
    });
  });
};

/**
 * getExchangeRatesForNewCurrency description
 * @param  {String}   currency              the currency to find the conversion rate
 * @param  {String}   collectionToWriteName collection where to check if the information is already available
 * @param  {Function} callback              return two possible objects, error and result of the operation
 * @return {undefined}                      not return value
 */
Coynverter.prototype.getExchangeRatesForNewCurrency = function (currency, collectionToWriteName, callback) {
  "use strict";
  var mongo = this.mongo;
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
      mongoUtil.connectToServer(mongo, function ( err ) {
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
                  //log.info(result);
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