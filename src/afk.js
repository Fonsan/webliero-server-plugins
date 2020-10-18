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
    if (!room.config) {
      throw 'you need to set do var config = {....};window.WLInit(config); room.config = config'
    }
    const defaults = {
      spectatorTeam: 0,
      timeout: 60000,
      graceTime: 10000,
      hotTimeout: 3000,
      kickAFKSpectatorWhenFull: true
    }
    const settings = {
      ...defaults,
      ...room.AFKConfig
    }
    log('AFK_PLUGIN loaded', settings)
    room.AFK_PLUGIN = true
    const playingPlayers = {}
    const hotPlayers = {}
    const kickCandidates = {}
    const evictPlayer = (playerId) => {
      const message = `You will be moved to spectators due too inactivity in ${settings.graceTime / 1000} seconds, please move`
      room.sendAnnouncement(message, playerId, 0xFFFF00, "bold", 2)
      const currentTimeout = playingPlayers[playerId]
      setTimeout(() => {
        const player = room.getPlayer(playerId)
        if (player && player.team != settings.spectatorTeam && playingPlayers[playerId] == currentTimeout) {
          room.sendAnnouncement(`Moving ${player.name} to spectators due to inactivity`, null, 0xDDDDDD)
          const reason = `You were afk for more than ${settings.timeout / 1000} seconds, moving you to spectators`
          room.sendAnnouncement(reason, playerId, 0xFF0000, "bold", 2);
          room.setPlayerTeam(playerId, 0)
          kickCandidates[playerId] = new Date()
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
      playingPlayers[playerId] = setTimeout(evictPlayer.bind(null, playerId), settings.timeout - settings.graceTime)
    }

    const activate = (player) => {
      if (!hotPlayers[player.id]) {
        hotPlayers[player.id] = setTimeout(() => {
          delete hotPlayers[player.id]
        }, settings.hotTimeout)
        if (playingPlayers[player.id]) {
          resetPlayerTimeout(player.id)
        }
      }
    }

    const purgeInactiveSpectators = () => {
      const list = room.getPlayerList();
      if (list.length >= room.config.maxPlayers) {
        let oldest = null;
        for(let playerId in kickCandidates) {
          if (!oldest) {
            oldest = playerId
          } else if (kickCandidates[playerId] < kickCandidates[oldest]) {
            oldest = playerId
          }
        }
        if (oldest) {
          room.sendAnnouncement(`Server full, kicking oldest afk spectator %{room.getPlayer(oldest).name}`, null, 0xDDDDDD)
          room.kickPlayer(oldest, 'Server full, kicking oldest afk spectator')
        }
      }
    }

    chainFunction(room, 'onPlayerJoin', (player) => {
      const motd = `AFK detection loaded, players are moved to spectators after ${settings.timeout / 1000} seconds of inactivity`
      room.sendAnnouncement(motd, player.id)
    })

    if (settings.kickAFKSpectatorWhenFull) {
      chainFunction(room, 'onPlayerJoin', (player) => {
        purgeInactiveSpectators()
      })
    }

    chainFunction(room, 'onPlayerTeamChange', (player) => {
      if (player.team == settings.spectatorTeam) {
        clearPlayerTimeout(player.id)
      } else {
        delete kickCandidates[player.id]
        resetPlayerTimeout(player.id)
      }
    })

    chainFunction(room, 'onPlayerActivity', activate)
    chainFunction(room, 'onPlayerChat', activate)

    chainFunction(room, 'onPlayerLeave', (player) => {
      delete kickCandidates[player.id]
      clearPlayerTimeout(player.id)
    })
    resolve()
  })
})()
