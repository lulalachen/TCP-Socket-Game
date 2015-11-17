var host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000,
    maxConnections = process.env.MAXCONNECTIONS || 10;

module.exports = {
  'port' : port,
  'host' : host,
  'maxConnections' : maxConnections
}