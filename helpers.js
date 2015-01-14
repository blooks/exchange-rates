module.exports = {
  /**
   * [ description]
   * @param  {[type]} n [description]
   * @return {[type]}   [description]
   */
  showTwoDecimals: function (n) {
    // DGB 2013-05-14 -0 to make sure we have a number
    if(n===undefined){
      return '...';
    }
    if(n===null){
      return '...';
    }
    else{
      var number = n-0;
      return (number.toFixed(2))-0;
    }
  }
};