var axios = require('axios');

function connection (io) {
  io.on('connection', function (socket) {
    socket.emit('customEmit', 'string from server');

    socket.on('toFight', function () {
      console.log('someone want to Fight!');
    });

    socket.on('getData', function ({ token, locationId}) {
      const url = 'http://localhost:8000/api/artifical/expedition/' + locationId + '/';
      const config = {
        headers: {
          Authorization: token,
        },
      };

      axios
        .get(url, config)
        .then(response => (socket.emit('returnedData', response.data)))
        .catch(error => (console.log('ERROR\n', error)));
    });
  }); 
};

module.exports =  {
  connection
};