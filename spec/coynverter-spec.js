//run test $> jasmine-node --autotest ./spec --color --verbose
var Coynverter = require("../lib/coynverter");
jasmine.getEnv().defaultTimeoutInterval = 300;
var coynverter = new Coynverter("meteor", "3001", "", "");

describe("convert", function () {
  it("Should convert function return 0.100172 BTC to EUR for 2015-01-17 with a value of 17.2902481632", function (done) {
    coynverter.convert("2015-01-17", "EUR", 0.100172, "bitcoinExchangeRates", function (err, amount) {
      expect(amount).toBe(17.2902481632);
      done();
    });
  });
  it("Should convert function return 0.100172 BTC to USD for 2015-01-17 with a value of 19.9968355", function (done) {
    coynverter.convert("2015-01-17", "USD", 0.100172, "bitcoinExchangeRates", function (err, amount) {
      expect(amount).toEqual(19.9968355);
      done();
    });
  });
  it("Should convert function return a number when conversion to EUR", function (done) {
    coynverter.convert("2015-01-17", "EUR", 0.100172, "bitcoinExchangeRates", function (err, amount) {
      expect(typeof amount).toBe("number");
      done();
    });
  });
  it("Should convert function return a number when conversion to USD", function (done) {
    coynverter.convert("2015-01-17", "USD", 0.100172, "bitcoinExchangeRates", function (err, amount) {
      expect(typeof amount).toBe("number");
      done();
    });
  });
  it("Should convert function not return a string when conversion to USD", function (done) {
    coynverter.convert("2015-01-17", "USD", 0.100172, "bitcoinExchangeRates", function (err, amount) {
      expect(typeof amount).not.toBe("string");
      done();
    });
  });
  it("Should convert function not return a 0 when amount is > 0", function (done) {
    coynverter.convert("2015-01-17", "USD", 0.100172, "bitcoinExchangeRates", function (err, amount) {
      expect(amount).not.toBe(0);
      done();
    });
  });
}); 

// coynverter.getExchangeRatesForNewCurrency("meteor", "CHF", "bitcoinExchangeRates", function (err, result) {
//   log.info(result);
// });