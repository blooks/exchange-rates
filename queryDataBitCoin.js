var request = require('request');
var config = require(__dirname+'/config');
var _ = require('underscore');
// YYYY-MM-DD format
// ?currency=<VALUE> in USD format
var dateStart = "2009-01-01";
var dateFinish = "2011-01-14";
var currency = "EUR";
var url = 'https://api.coindesk.com/v1/bpi/historical/close.json?start='+dateStart+'&end='+dateFinish+'&currency='+currency;
request.get({uri: url}, function (err, response, body) {
  if(err){
    console.error(err);
  }
  if(response){
    //console.log(response);
  }
  if(body){
    var ratesValues = JSON.parse(body);
    console.log(ratesValues);
    _.map(ratesValues.bpi, function (value, key) {
      //console.log("Value: "+value+" "+currency+" date: "+key);
    });
  }
});

//Coynverter().getValueOfAt(date,currencyfrom,currencyto,cb);
//var synccoynverter =  Meteor.asyncwrap(Coynverter(.getvalue));


