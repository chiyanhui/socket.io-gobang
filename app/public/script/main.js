var socket;
var username = localStorage.getItem('username');
var page;

function init() {
    socket = io('/gobang',{
        transports: ['websocket'],
        reconnection: false, 
    });
    
    socket.on('connect', function() {
        console.log('连接成功');
        $('.mask').hide();
        $('.page').hide();
        if (!username) {
            $('.login').show();
            $('.usernameInput').focus();
        } else {
            login(username);
        }
    });
    socket.on('connect_error', function(error) {
        console.log('连接失败', error);
        disconnectHandler('连接失败');
    });
    socket.on('connect_timeout', function(timeout) {
        console.log('连接超时', timeout);
        disconnectHandler('连接超时');
    });
    socket.on('disconnect', function(reason) {
        console.log(`连接断开: ${reason}`);
        disconnectHandler('连接断开');
    });
    socket.on('login', function({ numUsers }) {
        console.log('当前在线用户数: ' + numUsers);
        toHall();
    });

    $(window).keydown(event => {
        if (event.which === 13 && !username) {
            let val = $('.usernameInput').val();
            if (val) {
                username = val;
                localStorage.setItem('username', val);
                login(val);
            }
        }
    });

    socket.on('new game add', (game) => {
        if (page !== 'hall') {
            return;
        }
        var $item = $(`<div class="game-item"><h4>${game.game}</h4></div>`);
        var $creator = $('<p></p>');
        $creator.text(`创建者: ${game.creator}`);
        $item.append($creator);
        $item.append(`<span data-game="${game.game}" class="join">加入</span>`);
        gamesMap.set(game.game, $item);
        $games.append($item);
    });

    socket.on('remove game', (res) => {
        if (page !== 'hall') {
            return;
        }
        let $item = gamesMap.get(res.game);
        if ($item) {
            gamesMap.delete(res.game);
            $item.remove();
        }
    });

    socket.on('enter game', (res) => {
        enterGame(res, false);
    });
    
    socket.on('win', winHandler);
    socket.on('lose', loseHandler);
}
init();

function disconnectHandler(msg) {
    $('.mask').show();
    $('.reconnect').show();
    $('.reconnect-info').text(msg);
}

$('.reconnect-btn').click(function() {
    $('.reconnect').hide();
    socket.connect();
});

function login(username) {
    socket.emit('add user', username);
}

var gamesMap = new Map();
var $games = $('.games');
function toHall() {
    $games.empty();
    $('.page').hide();
    $('.hall').show();
    socket.emit('get games', function(games) {
        page = 'hall';
        $games.append('<div class="game-item create">+</div>');
        for (let game of games) {
            var $item = $(`<div class="game-item"><h4>${game.game}</h4></div>`);
            var $creator = $('<p></p>');
            $creator.text(`创建者: ${game.creator}`);
            $item.append($creator);
            $item.append(`<span data-game="${game.game}" class="join">加入</span>`);
            gamesMap.set(game.game, $item);
            $games.append($item);
        }
    });
}

function createGame() {
    socket.emit('create game', (res) => {
        if (!res.success) {
            return;
        }
        console.log(res.game + '已创建');
        $('.game-item.create').remove();
        var $item = $(`<div class="game-item mygame"><h4>${res.game}</h4></div>`);
        var $creator = $('<p></p>');
        $creator.text(`创建者: ${username}`);
        $item.append($creator, '<span class="cancel">取消</span>');
        $games.prepend($item);
    });
}
$games.on('click', '.create', createGame);

$games.on('click', '.cancel', function() {
    socket.emit('cancel game', (res) => {
        if (!res.success) {
            return;
        }
        $('.game-item.mygame').remove();
        $games.prepend('<div class="game-item create">+</div>');
    });
});

$games.on('click', '.join', function(e) {
    var game = this.getAttribute('data-game');
    socket.emit('join game', game, (res) => {
        if (!res.success) {
            return;
        }
        enterGame(res, true);
    });
});

function enterGame(res, black) {
    page = 'game';
    console.log(`进入${res.game}, ${res.creator} VS ${res.joiner}, 你执${black?'黑':'白'}`);
    $('.hall').hide();
    $('.game').show();
}


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
