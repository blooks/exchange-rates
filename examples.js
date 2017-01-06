var coynverter = require('./src/coynverter.js')

var Coynverter = new coynverter('mongodb://127.0.0.1:3001/meteor')

Coynverter.update(function (err) {
  if (err) {
    console.log(err)
  } else {
    Coynverter.convert('BTC', 'USD', 23, new Date('07-27-2012'), function (err, resp) {
      if (err) {
        console.log(err)
      } else {
        console.log(resp)
      }
    })
  }
})
