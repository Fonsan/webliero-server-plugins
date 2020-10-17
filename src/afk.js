(function () {
  // AFK detection by https://github.com/Fonsan/webliero-server-plugins/
  // Advanced Usage:
  // in your server script
  // room.AFKConfig = {
  //   spectatorTeam: 0, // Future use
  //   timeout: 30000, // The afk timeout
  //   graceTime: 5000, // the grace period before being kicked
  //   hotTimeout: 3000, // performance related
  // }
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
    if (room.AFK_PLUGIN) {
      throw 'AFK_PLUGIN already loaded'
    }
    const defaults = {
      spectatorTeam: 0,
      timeout: 30000,
      graceTime: 5000,
      hotTimeout: 3000,
    }
    const settings = {
      ...defaults,
      ...room.AFKConfig
    }
    log('AFK_PLUGIN loaded', settings)
    room.AFK_PLUGIN = true
    chainFunction(room, 'onPlayerJoin', (player) => {
      const motd = `AFK detection loaded, players are kicked after ${settings.timeout / 1000} seconds of inactivity`
      room.sendAnnouncement(motd, player.id)
    })
    const playingPlayers = {}
    const hotPlayers = {}
    const evictPlayer = (playerId) => {
      const message = `You will be evicted due too inactivity in ${settings.graceTime / 1000}, please move`
      room.sendAnnouncement(message, playerId)
      const currentTimeout = playingPlayers[playerId]
      setTimeout(() => {
        if (playingPlayers[playerId] == currentTimeout) {
          const reason = `You were afk for more than ${settings.timeout / 1000} seconds`
          room.kickPlayer(playerId, 'afk')
        }
      }, settings.graceTime)
    }
    const clearPlayerTimeout = (playerId) => {
      if(playingPlayers[playerId]) {
        clearTimeout(playingPlayers[playerId])
      }
      delete playingPlayers[playerId]
    }
    const resetPlayerTimeout = (playerId) => {
      clearPlayerTimeout(playerId)
      playingPlayers[playerId] = setTimeout(evictPlayer.bind(null, playerId), settings.timeout)
    }

    chainFunction(room, 'onPlayerTeamChange', (player) => {
      if (player.team == settings.spectatorTeam) {
        clearPlayerTimeout(player.id)
      } else {
        resetPlayerTimeout(player.id)
      }
    })

    chainFunction(room, 'onPlayerActivity', (player) => {
      if (!hotPlayers[player.id]) {
        hotPlayers[player.id] = setTimeout(() => {
          delete hotPlayers[player.id]
        }, settings.hotTimeout)
        resetPlayerTimeout(player.id)
      }
    })

    chainFunction(room, 'onPlayerLeave', (player) => {
      clearPlayerTimeout(player.id)
    })
    resolve()
  })
})()
