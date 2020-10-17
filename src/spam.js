(function () {
  // SPAM detection by https://github.com/Fonsan/webliero-server-plugins/
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
    if (room.SPAM_PLUGIN) {
      throw 'SPAM_PLUGIN loaded'
    }
    const playingPlayers = {}
    const idToAuth = {}
    chainFunction(room, 'onPlayerJoin', (player) => {
      idToAuth[player.id] = player.auth
      existingPlayer = playingPlayers[player.auth]
      if (existingPlayer) {
        room.kickPlayer(existingPlayer.id, 'Only one connection allowed')
      }
      playingPlayers[player.auth] = player
    })
    chainFunction(room, 'onPlayerLeave', (player) => {
      const auth = idToAuth[player.id]
      delete idToAuth[player.id]
      delete playingPlayers[auth]
    })
    log('SPAM_PLUGIN loaded')
    resolve()
  })
})()
