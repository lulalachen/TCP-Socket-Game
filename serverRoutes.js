var game1 = require('./guessNumber'),
    game2 = require('./blackjack/blackjack'),
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
    rooms.push(room);
    console.log('/' + data.game);
    socket.write(JSON.stringify({
      'next' : '/' + data.game,
      'msg':'Room ' + room.id() + ' created.\n',
      'data':{
        roomId : room.id()
      }
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
          'next' : '/' + room.game() + '/check',
          'msg':'Room ' + room.id() + ' joined.\n',
          'data':{
            roomId : room.id()
          }
        }))
      }
    })
    if (toggle){
      socket.write(JSON.stringify({
        'next' : '/neworjoin',
        'msg':'Room ' + data + ' not found.\nCreate a new room?\n'
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
    game1.start(data.roomId);
    socket.write(JSON.stringify({
      'status':'success',
      'next' : '/game1/check',
      'msg':'Have fun in Guess Number.\n',
      'data':{
        roomId : data.roomId
      }
    }));
  }
},{
  'api' : '/game1/check', // Guess number check

  exec : function(data, socket){
    var result = game1.check(data.guess, socket.remotePort, data.roomId);
    var status = (result === 'done' || result === 'gameover') ? result : '';
    var next = '';

    if (status === 'done'){
      result = game1.final(socket.remotePort, data.roomId)+ '\n' + 'Congratulations!\nYou made it.\nLet\'s wait for others.....';
      next = '/wait';
    } else if (status === 'gameover') {
      result = result;
      next = '/choosegame';
    } else {
      next = '/game1/check';
    }


    var res = {
      'next' : next,
      'msg' : result,
      'data':{
        status : status,
        roomId : data.roomId
      }
    }
    socket.write(JSON.stringify(res));
  }
},{
  'api' : '/game2', // Blackjack
  exec : function(data, socket){
    var game2Single = game2.newGame(socket.remotePort, data.roomId);
    console.log( data);
    console.log(game2Single.isInProgress());
    socket.write(JSON.stringify({
      'status':'success',
      'next' : '/game2/waitForOthers',
      'msg':'Have fun in Blackjack.\nWait for other player or start?',
      'data':{
        roomId : data.roomId,
        game : game2Single
      }
    }));
  }
},{
  'api' : '/game2/initalDeal', // Blackjack deal
  exec : function(data, socket){

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