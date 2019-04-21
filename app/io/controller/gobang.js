const Controller = require('egg').Controller;

var numUsers = 0;
var gameId = 1, games = [];
var waitingGames = [];
var waitingInfo = new Map();
var playingGames = [];
var playingInfo = new Map();
class GobangController extends Controller {
    constructor(ctx) {
        super(ctx);
        this.nsp = this.app.io.of('/gobang');
    }

    async hello() {
        const { ctx, nsp } = this;
        const { socket } = ctx;
        socket.emit('res', ctx.args[0]);
    }

    async addUser() {
        const { ctx, nsp } = this;
        const { socket } = ctx;
        if (socket.username) {
            return;
        }
        socket.username = ctx.args[0];
        numUsers++;
        socket.emit('login', { numUsers });
        socket.join('hall');
        socket.to('hall').emit('user joined', {
            username: socket.username,
            numUsers,
        });
    }

    async createGame() {
        const { ctx, nsp } = this;
        const { socket } = ctx;
        let game = 'game#' + gameId;
        gameId++;
        waitingGames.push(game);
        socket.join(game);
        const res = {
            username: socket.username,
            game,
        };
        socket.to('hall').emit('new game add', res);
        if (typeof ctx.args[0] === 'function') {
            ctx.args[0](res);
        }
    }

    async joinGame() {
        const { ctx, nsp } = this;
        const { socket } = ctx;
        let game = ctx.args[0];
        let callback = ctx.args[1] || (()=>{});
        var index = games.indexOf(game);
        if (index > -1) {
            games.splice(index, 1);
            socket.join(game);
            socket.to(game).emit('enter game', {
                username: socket.username,
            })
        } else {
            callback({
                success: false,
                msg: game + '不存在',
            });
        }
    }

    async disconnecting() {
        const { ctx } = this;
        const { socket } = ctx;
        // console.log('socket.id', socket.id);
        // console.log('socket.rooms', Object.keys(socket.rooms));
    }
}

module.exports = GobangController;