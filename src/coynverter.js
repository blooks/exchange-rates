//15.01.2015 LFG Working under testing purposes//Now heavy development on this file, full of crap, many thinks to improve
var request = require('request'),
    moment = require('moment'),
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
  var self = this;
};



var passExchangeRatesToMongo = function(mongourl, collectionName, callback) {
  return function (err, exchangeRates) {
    var self = this;
    if (err) {
      console.log(err);
      return;
    }
    MongoClient.connect(mongourl, function (err, db) {
      if (err) {
        console.log(err);
      } else {
        var collection = db.collection(collectionName);
        async.each(exchangeRates, function (item, callback) {
          collection.update({time: item.time}, item, {w:1, upsert:true}, function(err, docs) {
            if (err) {
              console.log(err);
            } if (docs) {
              console.log("Updated an entry.");
              callback();
            }
            });
          }, function (err) {
          db.close();
          callback(null, "Done");
        });
      }
    });
  }
};

/**
 * getExchangeRatesForNewCurrency description
 * @param  {String}   currency              the currency to find the conversion rate
 * @param  {String}   collectionToWriteName collection where to check if the information is already available
 * @param  {String}   mongourl              address of the mongourl
 * @param  {Function} callback              return two possible objects, error and result of the operation
 * @return {undefined}                      not return value
 */
Coynverter.prototype.update = function (callback) {
  "use strict";
  var self = this;
  var timeToday = moment(new Date()).subtract(1, 'days').format("YYYY-MM-DD");
  //Currently Bitcoin is the only from currency
  var beginTime = '2010-07-17';
  console.log(self.toCurrencies);
  var CoinDeskAPI = new coindeskapi();
  CoinDeskAPI.getPricesForMultipleCurrencies(beginTime, timeToday, self.toCurrencies, passExchangeRatesToMongo(self.mongourl, self.collectionName, callback));
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
  if (fromCurrency === toCurrency) {
    return 1;
  }
  "use strict";
  if (toCurrency === 'BTC') {
    return callback(new Error("Sorry, at the moment we do not support conversion to Bitcoin"), null);
  }
};


module.exports = Coynverter;