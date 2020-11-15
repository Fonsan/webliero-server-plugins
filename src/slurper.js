(function () {
  // Slurper by https://github.com/Fonsan/webliero-server-plugins/
  const chainFunction = (object, attribute, func) => {
    const original = object[attribute]
    if (original) {
      object[attribute] = (...arguments) => {
        original.apply(object, arguments)
        func.apply(object, arguments)
      }
    } else {
      object[attribute] = func
    }
  }
  const log = (...arguments) => {
    console.log(...arguments.map(x => JSON.stringify(x)))
  }

  return new Promise((resolve, reject) => {
    const room = window.WLROOM
    if (room.SLURPER_PLUGIN) {
      throw 'slurper already loaded'
    }
    if (!room.config) {
      throw 'you need to set do var config = {....};window.WLInit(config); room.config = config'
    }
    if (!room.config.roomName) {
      throw 'you must set a roomName in config'
    }
    room.SLURPER_PLUGIN = true
    const defaults = {
      events: [
        'onGameStart',
        'onGameEnd',
        'onGameEnd2',
        'onPlayerJoin',
        'onPlayerLeave',
        'onPlayerKicked',
        'onPlayerChat',
        'onPlayerTeamChange',
        'onPlayerAdminChange',
        // 'onPlayerActivity', // Disabled for performance reasons
        // 'onGameTick', // Disabled for performance reasons
        'onRoomLink',
        'onPlayerKilled',
      ]
    }
    const settings = {
      ...defaults,
      ...room.SLURPERConfig
    }
    log('SLURPER_PLUGIN loaded', settings)
    settings.events.forEach(event => {
      chainFunction(room, event, (...arguments) => {
        const message = {
          event: event
        }
        if (arguments.length > 0) {
          message.arguments = arguments
        }
        log(message)
      })
    })
    log('SLURPER_PLUGIN loaded')
    resolve()
  })
})()
