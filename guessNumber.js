var targets = [],
    guessLog = [];

module.exports = {

  start : function(roomId){
    var num = genNumber();
    targets.push({
      roomId : roomId,
      num : num
    })
    console.log('game start');
    console.log('Room ' + roomId + '\'s target number is ' + num);
  },

  check : function(num, uid, roomId){
    if (!/^\d{4}$/.test(num))
      return 'Invalid input, please input 4 digit number.';

    var result = {
      'guess' : num.split('\n')[0],
      'A' : 0,
      'B' : 0
    }

    var target = '';
    targets.forEach(function(tg){
      if (tg.roomId == roomId){
        target = tg.num;
      }
    })
    if (target === '')
      return 'Exception: Plaese restart the program again.';
    for (var i = 0; i < num.length; i++) {
      for (var j = 0; j < target.length; j++) {
        if (num[i] == target[j] && i === j)
          result.A = result.A + 1;
        else if (num[i] == target[j] && i !== j)
          result.B++;
      };
    };

    updateLog(uid, roomId,result);

    if (result.A === 4){
      if (isLast(roomId)){
        compete(roomId);
        return 'gameover';
      } else
        return 'done';
    }
    else
      return result.A + 'A,' + result.B + 'B';
  },

  final : function(uid, roomId){
    var temp = 'Guess | (A,B)\n';
    guessLog.forEach(function(u){
      console.log(u.uid, uid);
      if (u.uid = uid){
        u.result.forEach(function(val){
          temp += ' ' + val.guess + ' | (' + val.A + ',' + val.B + ')\n';
        })
      }
    })
    clearLog(uid)
    return temp;
  }



}




////////////////////
//////Function//////
////////////////////
function isLast(roomId){
  var usersLeft = 0;
  guessLog.forEach(function(u){
    if (u.roomId === roomId && u.status === 'playing'){
      usersLeft++;
    }
  })
  if (usersLeft > 1)
    return false;
  else
    return true;
}

function compete (roomId){
  var users = [];
  var best;
  guessLog.forEach(function(user){
    if (user.roomId === roomId){
      users.push(user);
    }
  })
  users.forEach(function(u,idx,arr){
    if (u.result.length < best.times){
      best = {
        times : u.result,
        users : [u]
      };
    } else if (u.result.length = best.times){
      best.users.push(u);
    }
  })
  console.log(users);
  return users;
}

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

function clearLog(uid){
  guessLog.forEach(function(u,idx,arr){
    if (u.uid === uid){
      guessLog.splice(idx);
    }
  })
}

function updateLog(uid, roomId, result){
  var find = false;
  guessLog.forEach(function(u){
    if (u.uid === uid && u.roomId === roomId){
      find = true;
      u.result.push(result);
    }
  })
  if (!find){
    guessLog.push({
      uid : uid,
      roomId : roomId,
      status : 'playing',
      result : [result]
    })
  }
  console.log(guessLog);
}