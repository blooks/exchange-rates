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
      return callback(err, null);
    }
    MongoClient.connect(mongourl, function (err, db) {
      if (err) {
        return callback(err, null);
      } else {
        var collection = db.collection(collectionName);
        collection.ensureIndex({time: -1}, function(err, result) {
          if (err) {
            return callback(err);
          } else {
            async.each(exchangeRates, function (item, callback) {
              var time = new Date(parseInt(item.time))  ;
              var mongoItem = {
                time: time,
                rates: item.rates
              };
              collection.update({time: mongoItem.time}, mongoItem, {w:1, upsert:true}, function(err, docs) {
                if (err) {
                  return callback(err);
                } if (docs) {
                  return callback();
                }
              });
              }, function (err) {
              if (err) {
                return callback(err);
              }
              db.close();
              return callback(null, "Done");
            });
          }
        });
      }
    });
  }
};

var getExchangeRate = function(mongourl, collectionName, fromCurrency, toCurrency, date, callback) {
  var dateTime = new Date(date.getTime());
  MongoClient.connect(mongourl, function (err, db) {
    if (err) {
      return callback(err, null);
    }
    var collection = db.collection(collectionName);
    collection.findOne({time: {$lte: dateTime}}, {sort: {time: -1}}, function(err, item) {
      if (err) {
        return callback(err);
      }
      db.close();
      if (item.rates) {
        return callback(null, item.rates[toCurrency]);
      } else {
        return callback(new Error('Coynverter found entry in Mongo without rates array.'));
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
  var timeToday = moment(new Date()).format("YYYY-MM-DD");
  //Currently Bitcoin is the only from currency
  var beginTime = '2010-07-17';
  var CoinDeskAPI = new coindeskapi();
  CoinDeskAPI.getPricesForMultipleCurrencies(beginTime, timeToday, self.toCurrencies, passExchangeRatesToMongo(self.mongourl, self.collectionName, callback));
};

var convert = function(amount, callback) {
  return function(err, result) {
    if (err) {
      return callback(err)
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
    return callback(null, amountToConvert);
  }
  if (date < new Date('2010-07-17')) {
    return callback(new Error('Coynverter: no data for that time!'));
  }
  if (_.indexOf(self.fromCurrencies, fromCurrency) < 0) {
    return callback(new Error('Coynverter: Cannot convert from '+ fromCurrency+'!'));
  }
  if (_.indexOf(self.toCurrencies, toCurrency) < 0) {
    return callback(new Error('Coynverter: Cannot convert to '+ toCurrency+'!'));
  }
  getExchangeRate(self.mongourl, self.collectionName, fromCurrency, toCurrency, date, convert(amountToConvert, callback));
};


module.exports = Coynverter;