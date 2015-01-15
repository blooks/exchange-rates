var config = require(__dirname+'/env.json')[process.env.NODE_ENV || 'development'];
var request = require('request');
var mongo = require('mongodb');
var hostMongo = config.MONGO_SERVER;
var portMongo = config.MONGO_PORT;
var serverMongo = new mongo.Server(hostMongo, portMongo, {auto_reconnect: true, poolSize: 1});
var mydb = config.DATABASE;
var dbMongo = new mongo.Db(mydb, serverMongo, {fsync:true});
var _ = require('underscore');
var moment = require('moment');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

module.exports = {
  request: request,
  mongo: mongo,
  hostMongo: hostMongo,
  portMongo: portMongo,
  mydb: mydb,
  serverMongo: serverMongo,
  dbMongo: dbMongo,
  _: _,
  moment: moment,
  nodemailer: nodemailer,
  smtpTransport: smtpTransport,
  username: config.USERNAME,
  password: config.PASSWORD,
  database: config.DATABASE
};
