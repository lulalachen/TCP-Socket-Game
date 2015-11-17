var cli = require('cli-color'),
    net = require('net'),
    events = require("events"),
    channel = new events.EventEmitter();


var server = require('./connection');

server.on('connection',function(socket){

  broadcast(cli.cyan(socket.name + " joined the gameroom\n"), socket);

  socket.on('data',function(data){
    broadcast(cli.yellow(socket.name) + cli.yellow(" > ") + data, socket);
    router(data.toString(), socket);
  })
  // Remove the client from the list when it leaves
  socket.on('end', function () {
    server.clients.splice(server.clients.indexOf(socket), 1);
    broadcast(cli.yellow(socket.name) + " left the gameroom.\n");
  });
})

var routes = require('./serverRoutes');

function router(data, socket){
  var data = JSON.parse(data) || undefined;
  var api = data.api || undefined;
  var jsonData = data.data || undefined;

  if (api !== undefined ) {
    routes.forEach(function(rt){
      if (rt.api === api){
        console.log(cli.green(JSON.stringify(data.data)));
        if (typeof(rt.exec) !== 'function'){
          socket.write( JSON.stringify(rt.response) )
        } else if (jsonData !== undefined){
          rt.exec(jsonData, socket);
        } else{
          console.log('do nothing');
        }
      }
    })
  } else {
    socket.write( JSON.stringify({"status" : 'error', "err":'Invalid input.'}) );
  }
}

// Send a message to all clients
function broadcast(message, sender) {
  // server.clients.forEach(function (client) {
  //   if (client === sender) return;
  //   client.write(message);
  // });
  process.stdout.write(message)
}


