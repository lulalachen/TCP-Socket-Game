var config = require('./config'),
    cli = require('cli-color'),
    net = require('net'),
    events = require('events'),
    JsonSocket = require('json-socket'),
    User = require('./user');

var clients = [];

var server = net.createServer(function(socket) {
  socket.name = socket.remoteAddress + ":" + socket.remotePort
  var user = new User({
    id : socket.remotePort
  });
  clients.push(socket);
});

server.listen(config.port, config.host, function(err){
  if (err) console.log(err);
  else console.log(cli.cyan('Server start'));
});

server.maxConnections = config.maxConnections;
server.clients = clients;
// server.socket = new events.EventEmitter();
// server.socket = Promise.promisify(server.on);

module.exports = server;
