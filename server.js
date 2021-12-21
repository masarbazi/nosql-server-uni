const net = require('net');
const { Buffer } = require('buffer');

const { spread } = require('./src/controllers/spreadController');
const errorHandler = require('./src/controllers/errorHandler');

// buffers to ignore
const PUTTY = Buffer.from([
  255, 251, 31, 255, 251, 32, 255, 251, 24, 255, 251, 39, 255, 253, 1, 255, 251,
  3, 255, 253, 3,
]);
const CARRIAGE_REUTRN = Buffer.from([13, 10]);

const server = net.createServer((socket) => {
  let fullData = '';

  socket.on('data', (data) => {
    try {
      data = data.toString();
      if (
        data == PUTTY.toString() ||
        (data == CARRIAGE_REUTRN.toString() && !fullData)
      ) {
        console.log('Caught Problem');
        return;
      }
      fullData += data;
      if (fullData.includes('clear')) {
        fullData = '';
      } else {
        console.log('Data:', data);
        if (data.indexOf('\n') == -1) return;
        // socket.write(('You typed: ' + fullData + '\r\n').toString());
        const { queryHandler } = spread(fullData, socket.write);
        queryHandler(fullData, socket); // queryHandler may be database related or for documenting or authentication etc.
        fullData = '';
      }
    } catch (e) {
      fullData = '';
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

server.listen(60681);
