const Controller = require('egg').Controller;
const ChessBoard = require('../../game/chessboard');

let numUsers = 0;
let gameId = 1;
let waitingGames = new Map();
let playingGames = new Map();
class GobangController extends Controller {
    constructor(ctx) {
        super(ctx);
        this.nsp = this.app.io.of('/gobang');
    }

    async addUser() {
        const { ctx } = this;
        const { socket } = ctx;
        if (socket.userdata) {
            return;
        }
        socket.userdata = {
            username: ctx.args[0],
        };
        numUsers++;
        socket.emit('login', { numUsers });
        socket.join('hall');
        socket.to('hall').emit('user joined', {
            username: socket.userdata.username,
            numUsers,
        });
    }

    async createGame() {
        const { ctx } = this;
        const { socket } = ctx;
        const { userdata } = socket;
        let callback = ctx.args[0] || (()=>{});
        if (!userdata || userdata.game) {
            callback({ success: false });
            return;
        }
        let game = 'game#' + gameId;
        gameId++;
        waitingGames.set(game, {
            creator: socket,
        });
        socket.join(game);
        userdata.game = game;
        const res = {
            username: userdata.username,
            creator: userdata.username,
            game,
        };
        socket.to('hall').emit('new game add', res);
        callback({
            success: true,
            ...res,
        });
    }

    async joinGame() {
        const { ctx } = this;
        const { socket } = ctx;
        const { userdata } = socket;
        let callback = ctx.args[1] || (()=>{});
        if (!userdata || userdata.game) {
            callback({
                success: false,
                msg: '当前状态不能加入游戏',
            });
            return;
        }
        let game = ctx.args[0];
        if (waitingGames.has(game)) {
            let gameInfo = waitingGames.get(game);
            waitingGames.delete(game);
            socket.to('hall').emit('remove game', {
                game,
                reason: 'join',
            });
            playingGames.set(game, gameInfo);
            gameInfo.joiner = socket;
            gameInfo.chessBoard = new ChessBoard();
            gameInfo.black = true;
            socket.join(game);
            userdata.game = game;
            socket.to(game).emit('enter game', {
                username: userdata.username,
                creator: gameInfo.creator.userdata.username,
                joiner: userdata.username,
                game,
            });
            callback({
                success: true,
                creator: gameInfo.creator.userdata.username,
                joiner: userdata.username,
                game,
            });
        } else {
            callback({
                success: false,
                msg: game + '不存在',
            });
        }
    }

    async cancelGame() {
        const { ctx } = this;
        const { socket } = ctx;
        const { userdata } = socket;
        let callback = ctx.args[0] || (()=>{});
        if (!userdata || !waitingGames.has(userdata.game)) {
            callback({ success: false });
            return;
        }
        const game = userdata.game;
        waitingGames.delete(game);
        socket.to('hall').emit('remove game', {
            game,
            reason: 'cancel',
        });
        userdata.game = undefined;
        socket.leave(game);
        callback({
            success: true,
            game,
        });
    }

    async getGames() {
        const { ctx } = this;
        let callback = ctx.args[0] || (()=>{});
        let games = [];
        for (let [game, info] of waitingGames) {
            games.push({
                game,
                creator: info.creator.userdata.username,
                username: info.creator.userdata.username,
            });
        }
        callback(games);
    }

    async step() {
        const { ctx, nsp } = this;
        const { socket } = ctx;
        const { userdata } = socket;
        let callback = ctx.args[2] || (()=>{});
        if (!userdata || !playingGames.has(userdata.game)) {
            callback({ success: false, });
            return;
        }
        const game = userdata.game;
        const gameInfo = playingGames.get(game);
        const { chessBoard } = gameInfo;
        let [i, j] = ctx.args;
        let black = socket === gameInfo.joiner;
        if (gameInfo.black !== black || !chessBoard.step(i, j, black)) {
            callback({ success: false, });
            return;
        }
        gameInfo.black = !black;
        let flag = chessBoard.judge(i, j);
        let res = {
            step: { i, j, black },
        };
        let opponent = black ? gameInfo.creator : gameInfo.joiner;
        if (flag > 0) {
            playingGames.delete(game);
            userdata.game = opponent.userdata.game = undefined;
            socket.leave(game);
            opponent.leave(game);
            res.winner = userdata.username;
            res.loser = opponent.userdata.username;
            res.reason = black ? 'black win' : 'white win';
            callback({
                ...res,
                success: true,
            });
            socket.emit('win', res);
            opponent.emit('lose', res);
            nsp.to('hall').emit('game result', res);
        } else {
            callback({
                ...res,
                success: true,
            });
            opponent.emit('step', res);
        }
    }

    async surrender() {
        const { ctx, nsp } = this;
        const { socket } = ctx;
        const { userdata } = socket;
        let callback = ctx.args[0] || (()=>{});
        if (!userdata || !playingGames.has(userdata.game)) {
            callback({ success: false });
            return;
        }
        const game = userdata.game;
        let gameInfo = playingGames.get(game);
        playingGames.delete(game);
        let opponent = gameInfo.creator === socket ? gameInfo.joiner : gameInfo.creator;
        userdata.game = opponent.userdata.game = undefined;
        socket.leave(game);
        opponent.leave(game);
        let res = {
            winner: opponent.userdata.username,
            loser: userdata.username,
            reason: 'surrender',
        };
        callback({
            ...res,
            success: true,
        });
        opponent.emit('win', res);
        nsp.to('hall').emit('game result', res);
    }

    async disconnecting() {
        const { ctx, nsp } = this;
        const { socket } = ctx;
        const { userdata } = socket;
        if (!userdata) {
            return;
        }
        numUsers--;
        socket.to('hall').emit('user left', {
            username: userdata.username,
            numUsers,
        });
        const game = userdata.game;
        if (!game) {
            return;
        } else if (waitingGames.has(game)) {
            waitingGames.delete(game);
            socket.to('hall').emit('remove game', {
                game,
                reason: 'disconnect',
            });
        } else if (playingGames.has(game)) {
            let gameInfo = playingGames.get(game);
            playingGames.delete(game);
            let opponent = gameInfo.creator === socket ? gameInfo.joiner : gameInfo.creator;
            opponent.userdata.game = undefined;
            opponent.leave(game);
            let res = {
                winner: opponent.userdata.username,
                loser: userdata.username,
                reason: 'disconnect',
            };
            opponent.emit('win', res);
            nsp.to('hall').emit('game result', res);
        }
    }
}

module.exports = GobangController;