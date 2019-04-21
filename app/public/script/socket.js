var socket = io('/gobang',{
    transports: ['websocket'],
    reconnection: false, 
});

socket.on('res', function(...args) {
    console.log(...args);
});

socket.on('connect', function() {
    console.log('连接成功');
});
socket.on('connect_error', function(error) {
    console.log('连接失败', error);
});
socket.on('connect_timeout', function(timeout) {
    console.log('连接超时', timeout);
});
socket.on('disconnect', function(reason) {
    console.log(`连接失败: ${reason}`);
});

socket.on('login', function({ numUsers }) {
    console.log('当前在线用户数: ' + numUsers);
});

socket.on('user joined', function(res) {
    console.log(res.username + '进入系统, 当前在线用户数: ' + res.numUsers);
});
socket.on('user left', function(res) {
    console.log(res.username + '离开系统, 当前在线用户数: ' + res.numUsers);
});

socket.on('new game add', function(res) {
    console.log(res.game + '已创建, 创建者: ' + res.username);
});
socket.on('enter game', function(res) {
    console.log(`${res.game}有人加入, 加入者: ${res.username}, 进入游戏`);
});

socket.on('remove game', function(res) {
    let game = res.game;
    let reason = '未知';
    if (res.reason === 'disconnect') {
        reason = '创建者离开系统';
    } else if (res.reason === 'cancel') {
        reason = '被创建者取消';
    } else if (res.reason === 'join') {
        reason = '游戏开始';
    }
    console.log(`${game} 已被移除, 原因: ${reason}`);
});

socket.on('win', winHandler);
socket.on('lose', loseHandler);
socket.on('step', function(res) {
    let step = res.step;
    console.log(`${step.black ? '黑' : '白'}方在 ${res.step.i},${res.step.j} 处落子, 轮到你了`);
});

socket.on('game result', function(res) {
    let msg;
    if (res.reason === 'disconnect') {
        msg = `${res.loser}在比赛中不幸掉线, 输给了${res.winner}`;
    } else if (res.reason === 'surrender') {
        msg = `${res.winner}实力强大, ${res.loser}甘拜下风, 主动认输`;
    } else if (res.reason === 'white win') {
        msg = `${res.winner}棋高一着, 执白战胜${res.loser}`;
    } else if (res.reason === 'black win') {
        msg = `${res.winner}挑战成功, 执黑击败${res.loser}`;
    } else {
        msg = `${res.winner}击败了${res.loser}`;
    }
    console.log(msg);
});

function winHandler(res) {
    let msg;
    if (res.reason === 'disconnect') {
        msg = `${res.loser}掉线, 你赢了`;
    } else if (res.reason === 'surrender') {
        msg = `${res.loser}认输, 你赢了`;
    } else {
        msg = `恭喜你战胜${res.loser}`;
    }
    console.log(msg);
}
function loseHandler(res) {
    let msg;
    if (res.reason === 'surrender') {
        msg = `你认输了, ${res.winner}获胜`;
    } else if (res.reason === 'white win') {
        msg = `白方在 ${res.step.i},${res.step.j} 处落子, 你输了`;
    } else if (res.reason === 'black win') {
        msg = `黑方在 ${res.step.i},${res.step.j} 处落子, 你输了`;
    } else {
        msg = '你输了!';
    }
    console.log(msg);
}

function createGame() {
    socket.emit('create game', (res) => {
        console.log(res.game + '已创建');
    });
}

function login(username) {
    socket.emit('add user', username);
}

function joinGame(game) {
    socket.emit('join game', game, function(res) {
        if (res.success) {
            console.log(`进入${res.game}, 创建者: ${res.creator}, 挑战者: ${res.joiner}`);
        } else {
            console.log(`进入${game}失败, ${res.msg}`);
        }
    });
}

function step(i, j) {
    socket.emit('step', i, j, function(res) {
        if (res.success) {
            let step = res.step;
            console.log(`你在 ${res.step.i},${res.step.j} 处落${step.black ? '黑' : '白'}子`);
        } else {
            console.log('落子无效');
        }
    });
}

function surrender() {
    socket.emit('surrender', function(res) {
        console.log(`你投降了, ${res.winner}获胜`);
    });
}