const Controller = require('egg').Controller;

class HomeController extends Controller {
    async index() {
        const { ctx, app } = this;
        const message = ctx.args[0];
        ctx.socket.emit('res', 'welcome');
    }

    async repeat() {
        const { ctx, app } = this;
        const message = ctx.args[0];
        ctx.socket.emit('res', message);
    }

    async message() {
        const { ctx, app } = this;
        ctx.socket.emit('res', `received message: ${ctx.args[0]}`);
    }
}

module.exports = HomeController;