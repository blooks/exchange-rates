var MongoClient = require('mongodb').MongoClient;
var _db;

module.exports = {
  connectToServer: function (database, callback) {
    MongoClient.connect(database, function (err, db) {
      _db = db;
      return callback(err);
    });
  },
  getDb: function() {
    return _db;
  }
};