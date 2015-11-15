var model = require('node-model');
var User = model('User')
          .attr('id', { required: true, type: 'number' })
          .attr('name')
          .attr('password');


module.exports = User;