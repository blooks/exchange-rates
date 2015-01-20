# coynverter

A npm package to convert any currency based on public available exchange rate data.

**Install the dependencies**
  $> npm install
**To test the package**

  $> npm test

**API**

```javascript
  var coynoverter = require('../src/coynverter.js') 
  coynoconverter = new Coynverter();

  /**
   * update the information available on the database
   * @param  {String}   databaseName       Name of the database where to save/query information about exchange rates
   * @param  {String}   collectionToUpdate Collection in the mongodb to store the information
   * @param  {String}   currency           the currency to find the conversion rate
   * @param  {Function} callback           return two possible objects, error and result of the operation
   * @return {undefined}                   not return value
   */
  coynoconverter.update(databaseName, collectionToUpdate, currency, function (err, result) {
    
  });

  /**
   * convert convert a specified amount of BTC to a specified currency for one date
   * @param  {String}   databaseName     Name of the database where to save/query information about exchange rates
   * @param  {String}   date             the day to look for in the database, if no data in database request to coinbase API
   * @param  {String}   currency         the currency to find the conversion rate
   * @param  {Number}   amountToConvert  the amount of bitcoins to convert to the currency specified
   * @param  {String}   collectionToRead collection where to check if the information is already available
   * @param  {Function} callback         return two possible objects, error and result of the operation
   * @return {undefined}                 not return value
   */
  coynoconverter.convert(databaseName, date, currency,  amountToConvert, collectionToRead, function (err, result) {

  });

  /**
   * getExchangeRatesForNewCurrency description
   * @param  {String}   databaseName          Name of the database where to save/query information about exchange rates
   * @param  {String}   currency              the currency to find the conversion rate
   * @param  {String}   collectionToWriteName collection where to check if the information is already available
   * @param  {Function} callback              return two possible objects, error and result of the operation
   * @return {undefined}                      not return value
   */
  coynoconverter.getExchangeRatesForNewCurrency(databaseName, currency, collectionToWriteName, function (err, result) {

  });
```