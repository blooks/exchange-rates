var MongoClient = require('mongodb').MongoClient;
var _db;

module.exports = {
  connectToServer: function (mongourl, callback) {
    MongoClient.connect(mongourl, function (err, db) {
      if(db){
        _db = db;
        return callback(null, db);
      }
      if(err){
        return callback(err, null);
      }
    });
  },
  getDb: function () {
    return _db;
  }
};