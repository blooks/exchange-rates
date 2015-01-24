//Populate the database for testing purposes
var log = require('tracer').colorConsole();
var Coynverter = require("../src/coynverter");
var coynverter = new Coynverter("mongodb://127.0.0.1:3001/meteor", "BitcoinExchangeRates");
var currencies = ['EUR', 'USD'];
currencies.forEach(function (currency){
  coynverter.update(currency, function (err, amount) {
    if(err){
      log.info(err);
    }
    if(amount){
      log.info(amount);
    }
  });
});