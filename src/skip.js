(function () {
  // Skip level by https://github.com/Fonsan/webliero-server-plugins/
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
    if (room.SKIP_PLUGIN) {
      throw 'SKIP_PLUGIN already loaded'
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
    log('SKIP_PLUGIN loaded', settings)
    room.SKIP_PLUGIN = true
    chainFunction(room, 'onPlayerJoin', (player) => {
      const motd = `Skip plugin loaded, write !skip to vote for level skip`
      room.sendAnnouncement(motd, player.id)
    })
    let voteRunning = false
    chainFunction(room, 'onPlayerChat', (player, message) => {
      if (message.match(/^!skip/)) {
        if(voteRunning) {

          addVote(player.id)
        }
      }
      return true
    })
    resolve()
  })
})()
