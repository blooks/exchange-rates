var config = require(__dirname+'/config');

module.exports = {
  connectMongo: function () {
    config.dbMongo.open(function (err, db) {
      if(db){
        if(process.env.NODE_ENV==="production"){
          config.dbMongo.authenticate(config.username, config.password, function (err, res) {
            if(res){
              config.dbMongo.collection("users", function (error, collection) {
                if(collection){
                  var checkEndOperations = syncTwitterAllStartups(collection);
                  if(checkEndOperations===true){
                    config.dbMongo.close();
                  }
                }
                if(error){
                  config.logger.error("calculateConversionHistory.js script, users collection not available");
                }
              });
            }
            if(err){
              config.logger.error("calculateConversionHistory.js script, error on connection to mongodb in production");
            }
          });
        }else{
          config.dbMongo.collection("users", function (error, collection) {
            if(collection){
              
            }
            if(error){
              config.logger.error("calculateConversionHistory.js script, users collection not available");
            }
          });
        }
      }
      if(err){
        config.logger.error('ERROR on connection to mongodb' + err);
      }
    });
  }
};
