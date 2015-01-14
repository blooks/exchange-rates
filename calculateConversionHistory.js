var config = require(__dirname+'/config');
var rank = {
  createdAt: config.moment().valueOf()
};

var winston = require('winston');
var fs = require('fs');
var logger;
if (fs.existsSync(__dirname+'/logs/')) {
  logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: __dirname+'/logs/logsCoynverter.log' })
    ]
  });
}else{
  try {
    fs.mkdirSync(__dirname+'/logs/');
    logger = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: __dirname+'/logs/logsDataCoynverter.log' })
      ]
    });
    console.log(logger);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
}

//Visible for script.js
module.exports = {
  
};