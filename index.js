require('dotenv').config()

const Discord = require('discord.js')
const client = new Discord.Client()
const messages = require('./messages.json')

var vc = undefined;

client.on('voiceStateUpdate', (oldMember, newMember) => {   // Play unique mp3 if user with role enters the chat
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

client.on('message', (message) => {     // Play mp3 if special message is sent in chat in your voice channel,
                                        // or in the voice channel of someone you pinged
    var member = message.member
    var content = message.content

    if (content.startsWith('!')) {

        var mention = message.mentions.members.first()
        if (mention !== undefined){
            member = mention
        }
        vc = member.voiceChannel

        var toPlay = undefined
        for ( var i = 0; i < messages.length; i++ ) {
            var m = messages[i]
            if (content.startsWith(m.trigger)){
                toPlay = './audio/' + m.file
                break
            }
        }
        if (toPlay === undefined){
            return
        }

        if (vc !== undefined){
            vc.join().then(connection => {
                var dispatcher = connection.playFile(toPlay)
                dispatcher.on("end", end => { 
                    vc.leave()
                })
            }).catch(err => console.log(err))
            message.delete()
        }
    }
  })

client.login(process.env.BOT_TOKEN)