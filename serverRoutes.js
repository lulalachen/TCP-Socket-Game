var game1 = require('./guessNumber'),
    game2 = require('./blackjack'),
    User = require('./user'),
    Room  = require('./room'),
    users = [],
    rooms = [];

var routes = [{
  'api' : '/login',
  'response' : {
    'status':'success',
    'next' : '/choosegame',
    'msg':'Login successfully.\nPlease continue to gameroom.\n'
  },
  exec : function(data, socket){
    var toggle = true;
    users.forEach(function(user){
      if (user.name() === data.name){

        if (user.password() === data.password){
          toggle = false;
          socket.write(JSON.stringify({
            'next' : '/choosegame',
            'msg':'User ' + user.name() + ' login.\n'
          }))
        } else {
          toggle = false;
          socket.write(JSON.stringify({
            'next' : '/login',
            'msg':'Wrong password, try again.\n'
          }))
        }
      }
    })
    if (toggle){
      socket.write(JSON.stringify({
        'next' : '/home',
        'msg':'User not exist.'
      }))
    }
  }
},{
  'api' : '/signup',
  'response' : {
    'status':'success',
    'next' : '/login',
    'msg':'Signup successfully.\nPlease continue to login.\n'
  },
  exec : function(data, socket){
    var user = new User({
      id : socket.remotePort,
      name : data.name,
      password : data.password
    })
    users.push(user);
    // console.log(user);
    socket.write(JSON.stringify({
      'next' : '/login',
      'msg':'Hello ' + user.name() + '\n' + 'Please continue to login.\n'
    }))
  }
},{
  'api' : '/neworjoin',
  'response' :{
    'next' : '/neworjoin',
    'msg': 'Create a new room or join others?\n'
  }
},{
  'api' : '/newroom',
  exec : function(data, socket){
    var room = new Room({
      id : socket.remotePort,
      game : data.game,
      clients : [socket.remotePort],
    });
    console.log(room);
    rooms.push(room);
    socket.write(JSON.stringify({
      'next' : '/' + data.game,
      'msg':'Room ' + room.id() + ' created.\n'
    }))
  }
},{
  'api' : '/joinroom',
  exec : function(data, socket){
    var toggle = true;
    console.log('Joining ' + data);
    rooms.forEach(function(room){
      if (room.id() === parseInt(data)){
        toggle = false;
        room.clients().push(socket.remotePort);
        console.log(room.clients());
        socket.write(JSON.stringify({
          'next' : '/' + room.game(),
          'msg':'Room ' + room.id() + ' joined.\n'
        }))
      }
    })
    if (toggle){
      socket.write(JSON.stringify({
        'next' : '/newroom',
        'msg':'Room ' + data.data.game + ' not found.\nCreate a new room?\n'
      }))
    }

  }
},{
  'api' : '/choosegame',
  'response' : {
    'status':'success',
    'next' : '/neworjoin',
    'msg':'Please choose your game.(1 : guess number, 2 : blackjack)\n'
  }
},{
  'api' : '/game1', // Guess number
  exec : function(data, socket){
    game1.start();
    socket.write(JSON.stringify({
      'status':'success',
      'next' : '/game1/check',
      'msg':'Have fun in Guess Number.\n'
    }));
  }
},{
  'api' : '/game1/check', // Guess number check

  exec : function(data, socket){
    var result = game1.check(data.toString());
    var status = (result === 'done') ? true : false;
    var next = (result === 'done') ? '/choosegame' : '/game1/check';
    result = (result === 'done') ? game1.final()+ '\n' + 'Congratulations!\n' + 'Want to play other games?' : result;
    var res = {
      'status' : status,
      'next' : next,
      'msg' : result
    }
    socket.write(JSON.stringify(res));
  }
},{
  'api' : '/game2', // Blackjack
  'response' : {
    'status':'success',
    'next' : '',
    'msg':'Have fun in Blackjack.\n'
  }
},{
  'api' : '/game2', // Blackjack check
  'response' : {
    'status':'success',
    'next' : '',
    'msg':'Have fun in Blackjack.\n'
  }
},{
  'api' : '/gamefinish',
  'response' : {
    'status':'success',
    'next' : '/choosegame',
    'msg':'Congratulations! Would you like to play another game?\n'
  }
}]

module.exports = routes;