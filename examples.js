var coynverter = require('./src/coynverter.js');

var Coynverter = new coynverter('mongodb://127.0.0.1:3001/meteor');


Coynverter.update(function(err, response) {
    console.log(response);
});