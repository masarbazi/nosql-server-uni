const net = require('net');

const { spread } = require('./src/controllers/spreadController');
const errorHandler = require('./src/controllers/errorHandler');

const server = net.createServer((socket) => {
  let fullData = '';

  socket.on('data', (data) => {
    try {
      if (data.indexOf('\n') == -1) return (fullData += data.toString('utf-8'));
      socket.write(('You typed: ' + fullData).toString('utf-8'));
      const { queryHandler } = spread(fullData, socket.write);
      queryHandler(fullData, socket.write); // queryHandler may be database related or for documenting or authentication etc.
      fullData = '';
    } catch (e) {
      errorHandler(e);
    }
  });

  socket.on('close', () => {
    socket.write('Goodbye :)');
    socket.destroy();
  });

  socket.on('connect', () => {
    socket.write('Hey there ...\n');
  });

  socket.on('error', (e) => {
    console.log('💥', e);
    socket.destroy();
  });
});

server.listen(8080);
