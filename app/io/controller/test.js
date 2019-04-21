const Controller = require('egg').Controller;

class TestController extends Controller {
    async req() {
        const { ctx, app } = this;
        const message = ctx.args[0];
        // console.log(ctx.packet);
        ctx.socket.emit('res', message);
    }
    async qer() {
        const { ctx, app } = this;
        const message = ctx.args[0];
        // console.log(ctx.packet);
        ctx.socket.emit('res', message.split('').reverse().join(''));
    }
}

module.exports = TestController;