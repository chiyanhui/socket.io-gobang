const path = require('path');
const Koa = require('koa');

const app = new Koa();

const port = 7001;
const server = app.listen(port);
console.log(`app started at port ${port}...`);

const io = require('socket.io')();
io.attach(server);

io.on('connection', function(socket) {
    socket.emit('res', 'welcome!');
    socket.on('req', function(data) {
        socket.emit('res', `receive message: ${data}`);
    });
});
