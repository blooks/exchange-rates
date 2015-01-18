var MongoClient = require('mongodb').MongoClient;
var _db;

module.exports = {
  connectToServer: function (callback) {
    MongoClient.connect( "mongodb://localhost:8081/meteor", function (err, db) {
      _db = db;
      return callback(err);
    });
  },
  getDb: function() {
    return _db;
  }
};