//15.01.2015 LFG Working under testing purposes//Now heavy development on this file, full of crap, many thinks to improve
var moment = require('moment'),
    _ = require('underscore'),
    coindeskapi = require('coindesk-api'),
    async = require('async'),
    MongoClient = require('mongodb').MongoClient;


var toCurrencies = ["USD", "EUR", "GBP"];

var fromCurrencies = ["BTC"];


/**
 * Coynverter constructor for Coynverter package
 */
function Coynverter (mongourl) {
  this.mongourl = mongourl;
  this.toCurrencies = toCurrencies;
  this.fromCurrencies = fromCurrencies;
  this.collectionName = 'exchangeratesfromnpm';
}



var passExchangeRatesToMongo = function(mongourl, collectionName, callback) {
  return function (err, exchangeRates) {
    if (err) {
      callback(err, null);
    }
    MongoClient.connect(mongourl, function (err, db) {
      if (err) {
        callback(err, null);
      } else {
        var collection = db.collection(collectionName);
        async.each(exchangeRates, function (item, callback) {
          var time = new Date(parseInt(item.time))  ;
          var mongoItem = {
            time: time,
            rates: item.rates
          };
          collection.update({time: mongoItem.time}, mongoItem, {w:1, upsert:true}, function(err, docs) {
            if (err) {
              callback(err);
            } if (docs) {
              callback();
            }
            });
          }, function (err) {
          if (err) {
            callback(err);
          }
          db.close();
          callback(null, "Done");
        });
      }
    });
  }
};

var getExchangeRate = function(mongourl, collectionName, fromCurrency, toCurrency, date, callback) {
  var fromDate = new Date(date.getTime() - 86400000);
  var toDate = new Date(date.getTime());
  MongoClient.connect(mongourl, function (err, db) {
    if (err) {
      callback(err, null);
    }
    var collection = db.collection(collectionName);
    collection.find({time: {$gt: fromDate, $lte: toDate}}).toArray(function(err, items) {
      if (err) {
        callback(err);
      }
      if (!items) {
        console.log('Did not get any items from Mongo.');
      }
      db.close();
      if (items[0]) {
        callback(null, items[0].rates[toCurrency]);
      } else {
        callback(null, 0);
      }
    });
  });
};

/**
 * getExchangeRatesForNewCurrency description
 * @param  {Function} callback              return two possible objects, error and result of the operation
 * @return {undefined}                      not return value
 */
Coynverter.prototype.update = function (callback) {
  "use strict";
  var self = this;
  var timeToday = moment(new Date()).subtract(1, 'days').format("YYYY-MM-DD");
  //Currently Bitcoin is the only from currency
  var beginTime = '2010-07-17';
  var CoinDeskAPI = new coindeskapi();
  CoinDeskAPI.getPricesForMultipleCurrencies(beginTime, timeToday, self.toCurrencies, passExchangeRatesToMongo(self.mongourl, self.collectionName, callback));
};

var convert = function(amount, callback) {
  return function(err, result) {
    if (err) {
      callback(err)
    }
    callback(null, amount*result);
  }
};
/**
 *
 * convert convert a specified amount of BTC to a specified currency for one date
 * @param  {String}   fromCurrency     the currency to find the conversion rate
 * @param  {String}   toCurrency       the currency to find the conversion rate
 * @param  {Number}   amountToConvert  the amount of bitcoins to convert to the currency specified
 * @param  {Date}   date             the day to look for in the database, if no data in database request to coinbase API
 * @param  {Function} callback         return two possible objects, error and result of the operation
 * @return {undefined}                 not return value
 */
Coynverter.prototype.convert = function (fromCurrency, toCurrency, amountToConvert, date, callback) {
  "use strict";
  var self = this;
  if (fromCurrency === toCurrency) {
    callback(null, amountToConvert);
  }
  if (date < new Date('2010-07-17')) {
    callback(new Error('Coynverter: no data for that time!'));
  }
  if (_.indexOf(self.fromCurrencies, fromCurrency) < 0) {
    callback(new Error('Coynverter: Cannot convert from '+ fromCurrency+'!'));
  }
  if (_.indexOf(self.toCurrencies, toCurrency) < 0) {
    callback(new Error('Coynverter: Cannot convert to '+ toCurrency+'!'));
  }
  getExchangeRate(self.mongourl, self.collectionName, fromCurrency, toCurrency, date, convert(amountToConvert, callback));
};


module.exports = Coynverter;