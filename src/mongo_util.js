var MongoClient = require('mongodb').MongoClient;
var _db;

module.exports = {
  connectToServer: function (database, callback) {
    MongoClient.connect(database, function (err, db) {
      if(db){
        _db = db;
        return callback(db, null);
      }
      if(err){
        return callback(null, db); 
      }
    });
  },
  getDb: function() {
    return _db;
  }
};