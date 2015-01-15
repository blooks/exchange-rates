//15.01.2015 LFG Working under testing purposes//Now heavy development on this file, full of crap, many thinks to improve
var request = require('request');
var config = require(__dirname+'/config');
var _ = require('underscore');
var log = require('tracer').colorConsole();

function Coynverter (date, fromCurrency, toCurrency) {
  this.date = date;
  this.fromCurrency = fromCurrency;
  this.toCurrency = toCurrency;
}

Coynverter.prototype.exchangeRate = function (fromCurrency, toCurrency, date) {
  // TODO: usage scenarios? - decide if it'll throw errors or return nulls
  /**
   * @returns {String} User's jurisdiction (the 2-letter id). Default: 'de'
   */
  var userJurisdiction = function () {
    var _ref, 
        _ref1;
    return 'de';
    //return ((_ref = Meteor.user) !== null ? (_ref1 = _ref.profile) !== null ? _ref1.jurisdiction : void 0 : void 0) !== null ? Meteor.user.profile.jurisdiction:'de';
  };
  /**
   * @returns {Number} The EUR to USD conversion rate
   */
  var eurToUsd = function () {
    var jurisdiction, 
        year = new Date(date).getFullYear(), 
        month = new Date(date).getMonth() + 1;
    jurisdiction = userJurisdiction();
    //return (exchangeRates[jurisdiction] && exchangeRates[jurisdiction]['USD'] && exchangeRates[jurisdiction]['USD'][year] && exchangeRates[jurisdiction]['USD'][year][month]) ? exchangeRates[jurisdiction]['USD'][year][month]:null;
    return 1.12;  
  };

  /**
   * @returns {Number} The EUR to USD conversion rate or its inverse
   */
  var btcToFiat = function (currency) {
    var startDate = this.date;
    log.info(this.date);
    var endDate = new Date(this.date.getTime() + 24000 * 3600);
    //var rateRecord = BtcToFiat.findOne({date: {$gte: startDate, $lt: endDate}});
    return (rateRecord && rateRecord[currency]) ? Number(rateRecord[currency]) : null;
  };
  // validate and dispatch the exchange request:
  date = date || new Date();
  var acceptedCurrencies = ['USD', 'EUR', 'BTC'];
  if (acceptedCurrencies.indexOf(fromCurrency) < 0 || acceptedCurrencies.indexOf(toCurrency) < 0) {
    throw new Error('400', 'Sorry, can\'t use currency \'' + fromCurrency + '\'.');
  }
  switch (this.fromCurrency) {
    case this.toCurrency:
      return 1;
    case 'BTC':
      return this.toCurrency === 'USD' ? btcToFiat('USD') : btcToFiat('EUR');
    case 'EUR':
      if (to === 'USD') {
        return eurToUsd();
      } else {
        var b2e = btcToFiat('EUR');
        return b2e ? 1 / b2e : null;
      }
      break;
    case 'USD':
      if (this.toCurrency === 'BTC') {
        var b2u = btcToFiat('USD');
        return b2u ? 1 / b2u : null;
      }else {
        var e2u = eurToUsd();
        return e2u ? 1 / e2u : null;
      }
  }
};

Coynverter.prototype.importCurrency = function (currency) {
  var today = config.moment(new Date()).subtract(1, 'days').format("YYYY-MM-DD");
  var url = 'https://api.coindesk.com/v1/bpi/historical/close.json?start='+today+'&end='+today+'&currency='+currency;
  request.get({uri: url}, function (err, response, body) {
    if(err){
      log.error(err);
    }
    if(response){
      //console.log(response);
    }
    if(body){
      var ratesValues = JSON.parse(body);
      _.map(ratesValues.bpi, function (value, key) {
        log.info("Value: "+value+" new currency: "+currency+" date: "+key);
      });
    }
  });
};

/**
 * [repopulateBtcToFiat look for a the price in a currency for one date]
 * @param  {[type]} dateStart [description]
 * @param  {[type]} dateEnd [if this parameter is not provided it will look for just one day give by dateStart parameter]
 * @param  {[type]} currency    [description]
 * @return {[type]}             [description]
 */
Coynverter.prototype.repopulateBtcToFiat = function (currency, dateStart, dateEnd) {
  // YYYY-MM-DD format
  // ?currency=<VALUE> in USD format
  var endDate = typeof dateEnd !== 'undefined' ? dateEnd : dateStart;
  var url = 'https://api.coindesk.com/v1/bpi/historical/close.json?start='+dateStart+'&end='+endDate+'&currency='+currency;
  request.get({uri: url}, function (err, response, body) {
    if(err){
      log.error(err);
    }
    if(response){
      //console.log(response);
    }
    if(body){
      var ratesValues = JSON.parse(body);
      _.map(ratesValues.bpi, function (value, key) {
        log.info("Value: "+value+" "+currency+" date: "+key);
      });
    }
  });
};

/**
 * [calculateBaseAmount description]
 * @param  {[type]} amount [description]
 * @return {[type]}        [description]
 */
Coynverter.prototype.calculateBaseAmount = function (amount) {
  var baseCurrency = 'EUR', 
      rate;
  this.fromCurrency = this.fromCurrency || 'USD';
  log.info(this.fromCurrency);
  rate = this.exchangeRate(this.fromCurrency, baseCurrency, this.date);
  if (!rate) {
    log.info("Coynverter returning null!");
    log.info("Converting fromCurrency:" + this.fromCurrency);
    return 1;
  }
  return rate ? parseInt(amount * rate) : null;
};

var coynverter = new Coynverter("2015-01-10", "USD", "EUR");

log.info(coynverter.repopulateBtcToFiat("EUR", "2015-01-12"));

log.info(coynverter.calculateBaseAmount("100"));

log.info(coynverter.importCurrency('USD'));

//Coynverter().getValueOfAt(date,currencyfromCurrency,currencyto,cb);
//var synccoynverter =  Meteor.asyncwrap(Coynverter(.getvalue));



/*
// Create the BtcToUsd collection if not existing or recreate it if enforced by the environment variable COYNO_REFRESH_RATES.
Meteor.startup(function () {
  BtcToFiat = BtcToFiat || new Mongo.Collection('BtcToFiat');
  if (Meteor.isServer) {
    if (!BtcToFiat.findOne() || process.env.COYNO_REFRESH_RATES)
      Coynverter.repopulateBtcToFiat();
  }
});*/

