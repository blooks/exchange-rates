//15.01.2015 LFG Working under testing purposes//Now heavy development on this file, full of crap, many thinks to improve
var request = require('request'),
    moment = require('moment'),
    _ = require('underscore'),
    //Production
    //log = require('tracer').colorConsole({level: 'error'}),
    //Development
    log = require('tracer').colorConsole(),
    uuid = require('node-uuid'),

    coindeskapi = require('coindesk-api');
    mongoUtil = require('./mongoUtil');

var toCurrencies = ["USD", "EUR"];

var fromCurrencies = ["BTC"];

/**
 * Coynverter constructor for Coynverter package
 */
function Coynverter (mongourl) {
  this.mongo = mongourl;
  this.toCurrencies = toCurrencies;
  this.fromCurrencies = fromCurrencies;
}

/**
 * update the information available on the database
 * @param  {String}   collectionToUpdate Collection in the mongodb to store the information
 * @param  {String}   currency           the currency to find the conversion rate
 * @param  {Function} callback           return two possible objects, error and result of the operation
 * @return {undefined}                   not return value
 */
Coynverter.prototype.update = function () {
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
          return callback(err, null);
        }
      }
      if(error){
        return callback(err, null);
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
        return callback(err, null);
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
>>>>>>> develop
 * getExchangeRatesForNewCurrency description
 * @param  {String}   currency              the currency to find the conversion rate
 * @param  {String}   collectionToWriteName collection where to check if the information is already available
 * @param  {String}   mongourl              address of the mongourl
 * @param  {Function} callback              return two possible objects, error and result of the operation
 * @return {undefined}                      not return value
 */
Coynverter.prototype.update = function () {
  "use strict";
  var mongo = this.mongo;
  var timeToday = moment(new Date()).subtract(1, 'days').format("YYYY-MM-DD");
  //Currently Bitcoin is the only from currency

  var beginTime = '2010-07-17';
  var CoinDeskAPI = new coindeskapi();

  CoinDeskAPI.getPricesForMultipleCurrencies(beginTime, timeToday, ['USD','EUR'], function(err, result) {
        console.log(result);
      }
  );
  /*
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
        }
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
  if (toCurrency === 'BTC') {
    return callback("Sorry, at the moment we do not support conversion to Bitcoin", null);
  }
  var mongourl = this.mongo,
      collectionToQueryData = this.collectionToQueryData;
  try {
    mongoUtil.connectToServer(mongourl, function (err) {
      var db = mongoUtil.getDb();
      var queryParams = {};
      queryParams.date = new Date(date);
      queryParams[toCurrency] = {$exists: true};
      db.collection(collectionToQueryData).findOne(queryParams, function (err, document) {
        if (err) {
          return callback(err, null);
        }
        if (document) {
          var conversion = document[toCurrency] * amountToConvert;
          return callback(null, conversion);
        } else {
          var todayUpdate = moment(new Date()).subtract(1, 'days').format("YYYY-MM-DD");
          _getExchangeRateForOneDate(todayUpdate, toCurrency, collectionToQueryData, function (err, result) {
            return callback(null, result[toCurrency] * amountToConvert);
          });
        }
      });
    });
  }
};


module.exports = Coynverter;