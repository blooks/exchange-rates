//15.01.2015 LFG Working under testing purposes//Now heavy development on this file, full of crap, many thinks to improve
var request = require('request'),
    moment = require('moment'),
    _ = require('underscore'),
    //Production
    //log = require('tracer').colorConsole({level: 'error'}),
    //Development
    log = require('tracer').colorConsole(),
    uuid = require('node-uuid'),
    mongoUtil = require('./mongo_util');

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
      return callback(err, null);
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
      return callback(err, null);
    }
    if(document){
      return callback(null, document);
    }else{
      queryParams.date = new Date(date);
      queryParams[currency] = {$exists: false};
      db.collection(collectionToWriteName).findOne(queryParams, function (err, document) {
        if(err){
          return callback(err, null);
        }
        if(document){
          return callback(null, document);
        }else{
          _getOneDateNotInDatabase(moment(date).format("YYYY-MM-DD"), currency, function (err, result) {
            if(result){
              var exchangeRateForDate = {};
              exchangeRateForDate._id = uuid.v1();
              exchangeRateForDate[currency] = result[currency];
              exchangeRateForDate.date = new Date(result.date);
              db.collection(collectionToWriteName).insert(exchangeRateForDate, {w:1}, function  (err, result) {
                if(result){
                  return callback(null, result);
                }
                if(err){
                  return callback(err, null);                  
                }
              });
            }
            if(err){
              return callback(err, null);
            }
          });
        }
      });
    }
  });
};

/**
 * getExchangeRatesForNewCurrency description
 * @param  {String}   currency              the currency to find the conversion rate
 * @param  {String}   collectionToWriteName collection where to check if the information is already available
 * @param  {String}   mongourl              address of the mongourl
 * @param  {Function} callback              return two possible objects, error and result of the operation
 * @return {undefined}                      not return value
 */
var _getExchangeRatesForCurrencies = function (currency, collectionToWriteName, mongourl, callback) {
  "use strict";
  var mongo = mongourl;
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
              return callback(err, null);
            }
            if(document){
              var paramsToUpdate = {};
              paramsToUpdate[currency] = exchangeRate[currency];
              db.collection(collectionToWriteName).update({_id: document._id}, {$set: paramsToUpdate}, {w:1}, function (err, result) {
                if(result){
                  return callback(null, result);
                }
                if(err){
                  return callback(err, null);
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
/**
 * Coynverter constructor for Coynverter package
 */
function Coynverter (mongourl, collection) {
  this.collectionToQueryData = collection;
  this.mongo = mongourl;
}

/**
 * update the information available on the database for a provided currency
 * @param  {String}   currency           the currency to find the conversion rate
 * @param  {Function} callback           return two possible objects, error and result of the operation
 * @return {undefined}                   not return value
 */
Coynverter.prototype.update = function (currency, callback) {
  "use strict";
  var mongourl = this.mongo,
      collectionToQueryData = this.collectionToQueryData;
  try{
    mongoUtil.connectToServer(mongourl, function ( err ) {
      var db = mongoUtil.getDb();
      db.collection(collectionToQueryData, function (error, collection) {
        if(collection){
          try {
            _getExchangeRatesForCurrencies(currency, collectionToQueryData, mongourl, function (err, result) {
              if(result){
                return callback(null, result);
              }
            });
          } catch (err) {
            return callback(err, null);
          }
        }
        if(error){
          return callback(err, null);
        }
      });
    });
  }catch(err){
    return callback(err, null);
  }
};

/**
 * convert convert a specified amount of BTC to a specified currency for one date
 * @param  {String}   fromCurrency     the currency to find the conversion rate
 * @param  {String}   toCurrency       the currency to find the conversion rate
 * @param  {Number}   amountToConvert  the amount of bitcoins to convert to the currency specified
 * @param  {String}   date             the day to look for in the database, if no data in database request to coinbase API
 * @param  {Function} callback         return two possible objects, error and result of the operation
 * @return {undefined}                 not return value
 */
Coynverter.prototype.convert = function (fromCurrency, toCurrency, amountToConvert, date, callback) {
  "use strict";
  if(toCurrency==='BTC'){
    return callback("Sorry, at the moment we do not support conversion to Bitcoin", null);
  }
  var mongourl = this.mongo,
      collectionToQueryData = this.collectionToQueryData;
  try{
    mongoUtil.connectToServer(mongourl, function ( err ) {
      var db = mongoUtil.getDb();
      var queryParams = {};
      queryParams.date = new Date(date);
      queryParams[toCurrency] = {$exists: true};
      db.collection(collectionToQueryData).findOne(queryParams, function (err, document) {
        if(err){
          return callback(err, null);
        }
        if(document){
          var conversion = document[toCurrency] * amountToConvert;
          return callback(null, conversion);
        }else{
          var todayUpdate = moment(new Date()).subtract(1, 'days').format("YYYY-MM-DD");
          _getExchangeRateForOneDate(todayUpdate, toCurrency, collectionToQueryData, function (err, result) {
            return callback(null, result[toCurrency]*amountToConvert);
          });
        }
      });
    });
  }catch(err){
    return callback(err, null);
  }
};

module.exports = Coynverter;