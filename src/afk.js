(function () {
  // AFK detection by https://github.com/Fonsan/webliero-server-plugins/
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
  return new Promise((resolve, reject) => {
    const room = window.WLROOM
    if (room.AFK_PLUGIN) {
      throw 'afk already loaded'
    }
    const defaults = {
      spectatorTeam: 0,
      timeout: 30000,
      graceTime: 5000
    }
    const settings = {
      ...defaults,
      ...room.afkConfig
    }
    room.AFK_PLUGIN = true
    chainFunction(room, 'onPlayerJoin', (player) => {
      const motd = `AFK detection loaded, players are kicked after ${settings.timeout / 1000} seconds of inactivity`
      room.sendAnnouncement(motd, player.id)
    })
    const playingPlayers = {}
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
      resetPlayerTimeout(player.id)
    })
  })
})()
