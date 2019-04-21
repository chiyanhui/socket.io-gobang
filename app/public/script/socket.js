var socket = io('/gobang',{
    transports: ['websocket'],
    reconnection: false, 
});

socket.on('res', function(...args) {
    console.log(...args);
});

socket.on('connect', function() {
    socket.emit('hello', 'Hello!');
});

socket.on('disconnect', function(reason) {
    console.log(`disconnect: ${reason}`);
});

socket.on('login', function({ numUsers }) {
    console.log('当前在线用户数: ' + numUsers);
});

socket.on('user joined', function(res) {
    console.log(res.username + '进入系统, 当前在线用户数: ' + res.numUsers);
})

socket.on('new game add', function(res) {
    console.log(res.game + '已创建, 创建者: ' + res.username);
})

function createGame() {
    socket.emit('create game', (res) => {
        console.log(res.game + '已创建');
    });
}
