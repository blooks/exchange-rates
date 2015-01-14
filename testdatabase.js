//This hack could become a conflict when we check this code
//Asynchronous for insertion
var config = require(__dirname+'/config');
var helpers = require(__dirname+'/helpers.js');

module.exports = {
  testConnection: function () {
    config.dbMongo.open(function (err, db) { 
      if(!err){
        config.dbMongo.collection('startups', function (err, collection) {
          if(collection){
            if(process.env.NODE_ENV==='production'){
              config.dbMongo.authenticate(config.username, config.password, function (err, res) {
                if(res){
                  console.log('Connected to database in production');
                  config.dbMongo.close();
                  process.exit();
                }
                if(err){
                  console.log('Error connecting to MongoDB: '+err);
                  process.exit();
                }
              });
            }else{
              console.log('Connected to database in development');
              config.dbMongo.close();
              process.exit();
            }
          }
        });
      }else{
        console.log('ERROR on connection to MongoDB: ' + err);
        process.exit();
      }
    });
  }
};