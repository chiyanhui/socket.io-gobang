module.exports = appInfo => {

  const config = exports = {}
  config.keys = appInfo.name + '_1555644367233_405'
  config.middleware = [ 'errorHandler' ]

  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: [ 'http://localhost:8000' ],
  }

  config.io = {
    // passed to engine.io
    init: {
      transports: [
        'websocket',
      ],
    },
    namespace: {
      '/': {
        connectionMiddleware: [],
        packetMiddleware: [],
      },
      '/test/a': {
        connectionMiddleware: ['connection'],
        packetMiddleware: ['packet'],
      },
      '/gobang': {},
    },
  }

  return config
};
