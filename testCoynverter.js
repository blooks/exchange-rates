var btcAmount, 
    currency, 
    rates,
    log;

rates = require('./coynverter');
log = require('tracer').colorConsole();

btcAmount = 0.100172;

currency = 'EUR';

/*rates.getExchangeRateForOneDate("2015-01-12", 'EUR', function (err, exchangeRate) {
  return log.info(exchangeRate);
});*/

/*rates.convert("2015-01-12", "EUR", "bitcoinExchangeRates", function (err, collection) {
  return log.info(collection);
});*/
/*rates.getExchangeRatesForNewCurrency('USD', function (err, amount) {
  return log.info(amount);
});*/

// rates.getExchangeRatesForNewCurrency("EUR", "bitcoinExchangeRates", function (err, collection) {
//   return log.info(collection);
// });

/*rates.getExchangeRateForOneDate("2015-01-10", "EUR", "bitcoinExchangeRates", function (err, collection) {
  return log.info(collection);
});*/

/*rates.update("bitcoinExchangeRates", "EUR", function (err, collection) {
  return log.info(collection);
});*/

rates.convert("2015-01-17", "EUR",  btcAmount, "bitcoinExchangeRates", function (err, amount) {
  return log.info(amount);
});


// rates.connectToDatabase(function (err, database) {
//   return log.info(database);
// });