//run test $> jasmine-node --autotest ./spec --color --verbose
var Coynverter = require("../src/coynverter");
jasmine.getEnv().defaultTimeoutInterval = 300;
 
describe("convert", function () {
  it("Should convert function return 0.100172 BTC to EUR for 2015-01-17 with a value of 17.2902481632", function (done) {
    var coynverter = new Coynverter();
    coynverter.convert("2015-01-17", "EUR", 0.100172, "bitcoinExchangeRates", function (err, amount) {
      expect(amount).toBe(17.2902481632);
      done();
    });
  });
  it("Should convert function return 0.100172 BTC to USD for 2015-01-17 with a value of 19.9968355", function (done) {
    var coynverter = new Coynverter();
    coynverter.convert("2015-01-17", "USD", 0.100172, "bitcoinExchangeRates", function (err, amount) {
      expect(amount).toEqual(19.9968355);
      done();
    });
  });
  it("Should convert function return a number when conversion to EUR", function (done) {
    var coynverter = new Coynverter();
    coynverter.convert("2015-01-17", "EUR", 0.100172, "bitcoinExchangeRates", function (err, amount) {
      expect(typeof amount).toBe("number");
      done();
    });
  });
  it("Should convert function return a number when conversion to USD", function (done) {
    var coynverter = new Coynverter();
    coynverter.convert("2015-01-17", "USD", 0.100172, "bitcoinExchangeRates", function (err, amount) {
      expect(typeof amount).toBe("number");
      done();
    });
  });
  it("Should convert function not return a string when conversion to USD", function (done) {
    var coynverter = new Coynverter();
    coynverter.convert("2015-01-17", "USD", 0.100172, "bitcoinExchangeRates", function (err, amount) {
      expect(typeof amount).not.toBe("string");
      done();
    });
  });
  it("Should convert function not return a 0 when amount is > 0", function (done) {
    var coynverter = new Coynverter();
    coynverter.convert("2015-01-17", "USD", 0.100172, "bitcoinExchangeRates", function (err, amount) {
      expect(amount).not.toBe(0);
      done();
    });
  });
}); 