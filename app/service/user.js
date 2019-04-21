const Service = require('egg').Service

class UserService extends Service {

    async apply() {
        const { ctx } = this
        return ctx.app.jwt.sign({
            authed: true,
            exp: Math.floor(Date.now() / 1000) + (this.app.config.jwt.expire)
        }, ctx.app.config.jwt.secret)
    }

    async login(payload) {
        const { ctx } = this
        const user = this.app.config.admin
        if (payload.username == user.username && payload.password == user.password) {
            return { token: await this.apply() }
        } else {
            ctx.throw(401, '用户名或密码错误')
        }
    }

}

module.exports = UserService
