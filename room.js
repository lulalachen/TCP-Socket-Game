var model = require('node-model');
var Room = model('Room')
          .attr('id', { required: true, type: 'number' })
          .attr('game', { required: true, type: 'string' })
          .attr('clients', { required: true, type: 'array' });
          // .attr('created_at', { type: 'date' })
          // .attr('updated_at', { type: 'date' });

module.exports = Room;