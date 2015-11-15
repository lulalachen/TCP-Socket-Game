var config = require('./config'),
    net = require('net'),
    Promise = require('bluebird'),
    readline = require("readline"),
    cli = require('cli-color'),
    term = require( 'terminal-kit' ).terminal;
    // routes = require('./clientRoute');

var client = new net.Socket({
  allowHalfOpen: true,
  pauseOnConnect: true
});

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var question = Promise.promisify(function(question, callback) {
    rl.question(question, callback.bind(null, null));
});



client.connect(config.port, config.host, function() {
  console.log('Connected');
  findByApi('/home', '/home')
  .then(function(rt){
    rt.exec('Init');
  })
  .catch(function(){
    console.log('ErrorQQ');
  })

});


// term.clear() ;




process.stdin.on('data', function (data) {
  if ((new String(data)).toLowerCase() === 'exit\n') {
      client.write('exit');
      client.destroy();
      process.exit();
  }
});

client.on('data', function(data) {
  console.log(JSON.parse(data.toString()).msg);
  router(data.toString(), client)
});

function router(data, client){
  var data = JSON.parse(data) || undefined;
  var api = data.next || undefined;
  var msg = data.msg || undefined;

  if (api !== undefined) {
    routes.forEach(function(val){
      if (val.nextApi === api)
        val.exec(data);
    })

  } else {
    client.write( JSON.stringify({"status" : 'error', "err":'Invalid route.'}) );
  }
}

client.on('close', function() {
  console.log('Connection closed');
});


function findByApi(obj, from) {
  return new Promise (function(resolve, reject){
    routes.forEach(function(val){
      if (val.nextApi === obj)
        resolve(val);
    })
    routes.forEach(function(val){
      if (val.nextApi === from)
        reject(from);
    })
  })
}


var routes = [
{
  'nextApi' : '/home',
  exec : function(data){
    term.singleLineMenu( ['Signup','Login','ExitGame'] , function( error , response ) {
      if (response.selectedText === 'ExitGame') process.exit();
      var lookup = '/' + response.selectedText.toLowerCase();
      findByApi(lookup, '/home')
      .then(function(rt){
        rt.exec(lookup);
      })
      .catch(function(rt){
        console.log('Error /home', rt.nextApi);
      })
    });
  }
},
{
  'nextApi' : '/signup',
  exec : function(data){
    var questions  = {
      name : 'What\'s your name?',
      password : 'Enter password.'
    };
    Promise.each(Object.keys(questions), function(key) {
      return questions[key] = question(questions[key]);
    })
    .return(questions).props()
    .then(function(result) {
      client.write(JSON.stringify({
        'api' : '/signup',
        'data' : result
      }));
    })
    .catch(function(rt){
      console.log('Error /signup', rt.nextApi);
    });
  }
},
{
  'nextApi' : '/login',
  exec : function(data){
    var questions  = {
      name : 'What\'s your name?',
      password : 'Enter password.'
    };
    Promise.each(Object.keys(questions), function(key) {
      return questions[key] = question(questions[key]);
    })
    .return(questions).props()
    .then(function(result) {
      client.write(JSON.stringify({
        'api' : '/login',
        'data' : result
      }));
    }).catch(function(rt){
      console.log('Error /signup', rt.nextApi);
    });
  }
},
{
  'nextApi' : '/neworjoin',
  exec : function(data){
    term.singleLineMenu( ['NewRoom','JoinRoom'] , function( error , response ) {
      if (response.selectedText === 'NewRoom') lookup = '/newroom';
      else if (response.selectedText === 'JoinRoom') lookup = '/joinroom';
      findByApi(lookup, '/neworjoin')
      .then(function(rt){
        rt.exec(data);
      })
      .catch(function(rt){
        console.log('Error /neworjoin', rt);
      })
    });
  }
},
{
  'nextApi' : '/newroom',
  exec : function(data){
    client.write(JSON.stringify({
      'api' : '/newroom',
      'data' : {
        'game' : data
      }
    }))
  }
},
{
  'nextApi' : '/joinroom',
  exec : function(data){
    rl.question("Enter room number!",function(roomNumber){
      console.log("Room Number : " + roomNumber);
      client.write(JSON.stringify({
        'api' : '/joinroom',
        'data' : roomNumber
      }))
    });
  }
},
{
  'nextApi' : '/choosegame',
  exec : function(data){
    term.singleLineMenu( ['Guess Number','Blackjack', 'ExitGame'] , function( error , response ) {
      if (response.selectedText === 'Blackjack') lookup = 'game2';
      else if (response.selectedText === 'Guess Number') lookup = 'game1';
      else process.exit();
      findByApi('/neworjoin', '/home')
      .then(function(rt){
        rt.exec(lookup);
      })
      .catch(function(rt){
        console.log('Error /choosegame', rt.nextApi);
      })
    });
  }
},
{
  'nextApi' : '/game1',
  exec : function(data){
    client.write(JSON.stringify({
        'api' : '/game1',
        'data' : ''
      }));
  }
},
{
  'nextApi' : '/game1/check',
  exec : function(data){
    rl.question("Guess a number!",function(data){
      console.log("Guess : " + data);
      client.write(JSON.stringify({
        'api' : '/game1/check',
        'data' : data
      }))
    });
  }
},
{
  'nextApi' : '/game2',
  exec : function(data){

  }
},
{
  'nextApi' : '/game2/check',
  exec : function(data){

  }
}];