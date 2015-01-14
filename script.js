var program = require('commander');

//Import functions.js file
var helpers = require(__dirname+'/helpers.js');
var conversionCurrencies = require(__dirname+'/calculateConversionHistory.js');
var testdatabase = require(__dirname+'/testdatabase.js');

program
  .version('0.0.1')
  .option('-h, --historic', 'Get the conversion of currencies according to historical rates')
  .option('-d, --testdatabase', 'Test connection to database')
  .parse(process.argv);
console.error(__dirname);
console.error('Your command line option: '+process.argv);
//Average ranks for cities
if(program.historic){
  conversionCurrencies.calculateDailyRanking('berlin');
}
if(program.testdatabase){
  testdatabase.testConnection();
}