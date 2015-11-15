var target,
    guessLog = [];

module.exports = {

  start : function(){
    target = genNumber();
    console.log('game start');
    console.log('Target number is ' + target);
  },


  check : function(num){
    if (!/^\d{4}$/.test(num))
      return 'Invalid input, please input 4 digit number.';

    var result = {
      'guess' : num.split('\n')[0],
      'A' : 0,
      'B' : 0
    }
    for (var i = 0; i < num.length; i++) {
      for (var j = 0; j < target.length; j++) {
        if (num[i] == target[j] && i === j)
          result.A = result.A + 1;
        else if (num[i] == target[j] && i !== j)
          result.B++;
      };
    };
    guessLog.push(result);
    if (result.A === 4)
      return 'done';
    else
      return result.A + 'A,' + result.B + 'B';
  },
  final : function(){
    var temp = 'Guess | (A,B)\n';
    guessLog.forEach(function(val){
      temp += ' ' +val.guess + ' | (' + val.A + ',' + val.B + ')\n';
    })
    return temp;
  }



}










////////////////////
//////Function//////
////////////////////


function genNumber(){
  var from = [0,1,2,3,4,5,6,7,8,9];
  var ans = [];
  while (ans.length < 4){
    var temp = Math.floor(Math.random()*1000)%from.length;
    ans.push(from[temp]);
    from.splice(temp,1);
  }
  return ans;
}
