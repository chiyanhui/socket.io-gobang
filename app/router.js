module.exports = app => {
  const { router, controller, io } = app;
  router.get('/', controller.home.index);

  io.of('/').route('index', io.controller.home.index);
  io.of('/').route('repeat', io.controller.home.repeat);
  io.of('/').route('message', io.controller.home.message);
  io.of('/test/a').route('req', io.controller.test.req);
  io.of('/test/a').route('qer', io.controller.test.qer);

  // 注意检查 config 文件有没有设置 namespace
  io.of('/gobang').route('hello', io.controller.gobang.hello);
  io.of('/gobang').route('disconnecting', io.controller.gobang.disconnecting);
  io.of('/gobang').route('add user', io.controller.gobang.addUser);
  io.of('/gobang').route('create game', io.controller.gobang.createGame);
};
