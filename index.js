require('dotenv').config()

const Discord = require('discord.js')
const client = new Discord.Client()

var vc = undefined;

client.on('voiceStateUpdate', (oldMember, newMember) => {
    var newUserChannel = newMember.voiceChannel
    var oldUserChannel = oldMember.voiceChannel

    if (oldUserChannel === undefined && newUserChannel !== undefined) {
        if (newMember.roles.find(role => role.name === process.env.ROLE_TRIGGER)) {

            vc = newMember.voiceChannel

            vc.join().then(connection => {
                var dispatcher = connection.playFile('./bassboosted.mp3')
                dispatcher.on("end", end => { 
                    vc.leave()
                })
            }).catch(err => console.log(err))
        }
    } else if (newUserChannel === undefined && vc !== undefined) {
        vc.leave()
    }

})

client.on('message', (message) => {
    vc = message.member.voiceChannel
    if (message.content.startsWith('!') && vc !== undefined) {
        switch(message.content){
            case '!keem':
                var toPlay = './shout.mp3'
            case '!bruh':
                var toPlay = './bruh.mp3'
            default:
                var toPlay = undefined
        }
        if (toPlay !== undefined){
            vc.join().then(connection => {
                var dispatcher = connection.playFile(toPlay)
                dispatcher.on("end", end => { 
                    vc.leave()
                })
            }).catch(err => console.log(err))
        }
    }
  });

client.login(process.env.BOT_TOKEN)