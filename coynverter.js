//15.01.2015 LFG Working under testing purposes//Now heavy development on this file, full of crap, many thinks to improve
var request = require('request'),
    moment = require('moment'),
    _ = require('underscore'),
    log = require('tracer').colorConsole(),
    uuid = require('node-uuid'),
    Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server;

var db = new Db('meteor', new Server('localhost', 8081), {w:1});
var currencies = ["EUR", "USD"];
/**
 * [_connectToDatabase opens the connection to the database]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var _connectToDatabase = function (callback) {
  db.open(function (err, db) {
    if(db){
      try {
        return callback(null, db);
      } catch (error) {
        return callback(error, null);
      }
    }
    if(err){
      return callback(err, null);
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
  /**
   * [getOneDateNotInDatabase description]
   * @param  {[type]}   date     [description]
   * @param  {[type]}   currency [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  var getOneDateNotInDatabase = function (date, currency, callback) {
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
  var exchangeRate;
  var queryParams = {};
  queryParams.date = new Date(date);
  queryParams[currency] = {$exists: true};
  collection.findOne(queryParams, function (err, document) {
    if(err){
      log.error(err);
    }
    if(document){
      return callback(null, document);
    }else{
      getOneDateNotInDatabase(date, currency, function (err, result) {
        if(result){
          var exchangeRateForDate = {};
          exchangeRateForDate[currency] = result[currency];
          exchangeRateForDate.date = new Date(result.date);
          collection.insert(exchangeRateForDate, function  (err, result) {
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
};

/**
 * [importCurrency description]
 * @param  {[type]}   currency [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
var getExchangeRatesForNewCurrency = function (currency, collectionToWriteName, collection, callback) {
  var today = moment(new Date()).subtract(1, 'days').format("YYYY-MM-DD");
  var url = 'https://api.coindesk.com/v1/bpi/historical/close.json?start=2010-07-17&end='+today+'&currency='+currency;
  //var url = 'https://api.coindesk.com/v1/bpi/historical/close.json?start=2015-01-13&end='+today+'&currency='+currency;
  return request.get({uri: url}, function (err, response, body) {
    if(err){
      log.error(err);
    }
    if(response){
      //log.info(response);
    }
    if(body){
      var ratesValues = JSON.parse(body),
          exchangeRatesCurrency = ratesValues.bpi;
      var arrayValuesForDatabase = [];
      _.each(exchangeRatesCurrency, function (value, prop) {
        var datesAndExchangeRates = {};
        datesAndExchangeRates._id = uuid.v1();
        datesAndExchangeRates[currency] = value;
        datesAndExchangeRates.date = new Date(prop);
        arrayValuesForDatabase.push(datesAndExchangeRates);
      });
      collection(collectionToWriteName, collection, function (error, collection) {
        if(collection){
          arrayValuesForDatabase.forEach(function (exchangeRate) {
            collection.insert(exchangeRate, function  (err, result) {
              if(result){
                //log.info(result);
              }
              if(err){
                //log.error(err);
              }
            });
          });
          return callback(null, true);
        }
        if(error){
          return callback(error, null);
        }
      });
    }
  });
};

(function() {
  var coynverter = typeof exports !== "undefined" && exports !== null ? exports : (this.conversion = {});
  /**
   * [update description]
   * @param  {[type]}   collectionToUpdate [description]
   * @param  {[type]}   currency         [description]
   * @param  {Function} callback         [description]
   * @return {[type]}                    [description]
   */
  coynverter.update = function (collectionToUpdate, currency, callback) {
    _connectToDatabase(function (err, database) {
      if(database){
        database.collection(collectionToUpdate, function (error, collection) {
          if(collection){
            try {
              var todayUpdate = moment(new Date()).subtract(1, 'days').format("YYYY-MM-DD");
              _getExchangeRateForOneDate(todayUpdate, currency, collectionToUpdate, collection, function (err, result) {
                return callback(null, result);
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
      }
    });
  };
  /**
   * [convert description]
   * @param  {[type]}   date             [description]
   * @param  {[type]}   currency         [description]
   * @param  {[type]}   collectionToRead [description]
   * @param  {Function} callback         [description]
   * @return {[type]}                    [description]
   */
  coynverter.convert = function (date, currency,  amountToConvert, collectionToRead, callback) {
    _connectToDatabase(function (err, database) {
      if(database){
        db.collection(collectionToRead, function (error, collection) {
          if(collection){
            var queryParams = {};
            queryParams.date = new Date(date);
            queryParams[currency] = {$exists: true};
            collection.findOne(queryParams, function (err, document) {
              if(err){
                log.error(err);
              }
              if(document){
                var conversion = document[currency] * amountToConvert;
                return callback(null, conversion);
              }else{
                log.info("No RESULT in DB");
                var todayUpdate = moment(new Date()).subtract(1, 'days').format("YYYY-MM-DD");
                _getExchangeRateForOneDate(todayUpdate, currency, collectionToRead, collection, function (err, result) {
                  return callback(null, result);
                });
              }
            });
          }
          if(error){
            return callback(error, null);
          }
        });
      }
    });
  };
}).call(this);