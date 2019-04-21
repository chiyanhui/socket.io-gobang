var socket = io('/',{
    transports: ['websocket'],
    reconnection: false, 
});
socket.on('res', function(data) {
    console.log(data);
});
socket.emit('index');
socket.emit('repeat', 'Welcome to Beijing!');
socket.emit('message','messageA');
socket.send('messageB');

var test = io('/test/a', {
    transports: ['websocket'],
});
test.on('res', function(data) {
    console.log(data);
});
test.emit('req', 'How are you?');
test.emit('qer', 'How are you?');