module.exports = app => {
    return async (ctx, next) => {
        ctx.socket.emit('res', 'packet received');
        console.log('packet:', ctx.packet);
        if (ctx.packet[1]) {
            ctx.packet[1] = ctx.packet[1].split('').reverse().join('');
        }
        if (ctx.packet[0]) {
            ctx.packet[0] = ctx.packet[0].split('').reverse().join('');
        }
        await next();
    }
}