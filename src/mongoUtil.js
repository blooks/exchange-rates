var MongoClient = require('mongodb').MongoClient;
var _db;

module.exports = {
  /**
   * [connectToServer description]
   * @param  {[type]}   database [description]
   * @param  {[type]}   port     [description]
   * @param  {[type]}   user     [description]
   * @param  {[type]}   password [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  connectToServer: function (database, port, user, password, callback) {
    if(user.length>0 && password.length>0){
      MongoClient.connect( "mongodb://"+user+":"+password+"@localhost:+"+port+"/"+database, function (err, db) {
        _db = db;
        return callback(err);
      });
    }else{
      MongoClient.connect( "mongodb://localhost:+"+port+"/"+database, function (err, db) {
        _db = db;
        return callback(err);
      });
    }
  },
  getDb: function() {
    return _db;
  }
};