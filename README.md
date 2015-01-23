# coynverter

A npm package to convert any currency based on public available exchange rate data.

**Install the dependencies**
  $> npm install
**To test the package**

  $> npm test

**API**

```javascript
  var coynoverter = require('../src/coynverter.js') 
  coynoconverter = new Coynverter(mongourl, collectionWhereToWriteData);

  /**
   * update the information available on the database for a provided currency
   * @param  {String}   currency           the currency to find the conversion rate
   * @param  {Function} callback           return two possible objects, error and result of the operation
   * @return {undefined}                   not return value
   */
  coynoconverter.update(collectionToUpdate, currency, function (err, result) {
    
  });

  /**
   * convert convert a specified amount of BTC to a specified currency for one date
   * @param  {String}   fromCurrency     the currency to find the conversion rate
   * @param  {String}   toCurrency       the currency to find the conversion rate
   * @param  {Number}   amountToConvert  the amount of bitcoins to convert to the currency specified
   * @param  {String}   date             the day to look for in the database, if no data in database request to coinbase API
   * @param  {Function} callback         return two possible objects, error and result of the operation
   * @return {undefined}                 not return value
   */
  coynoconverter.convert(fromCurrency,  toCurrency, amountToConvert, date, function (err, result) {

  });
```