require('dotenv').config()

const Discord = require('discord.js')
const client = new Discord.Client()
const messages = require('./messages.json')

var vc = undefined;

client.on('voiceStateUpdate', (oldMember, newMember) => {   // Play unique mp3 if user with role enters the chat
    var newUserChannel = newMember.voiceChannel
    var oldUserChannel = oldMember.voiceChannel

    if (oldUserChannel === undefined && newUserChannel !== undefined) {
        if (newMember.roles.find(role => role.name === messages.role_trigger)) {

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
        if (mention !== undefined) {
            member = mention
        }
        vc = member.voiceChannel

        var toPlay = undefined
        if (content == '!null') {
            joinLeave(10)
            message.delete()
        } else {
            for (var i = 0; i < messages.sound_triggers.length; i++) {
                var m = messages.sound_triggers[i]
                if (content.startsWith(m.trigger)) {
                    toPlay = './audio/' + m.file
                    break
                }
            }
            if (toPlay === undefined) {
                return
            }

            if (vc !== undefined) {
                vc.join().then(connection => {
                    var dispatcher = connection.playFile(toPlay)
                    dispatcher.on("end", end => {
                        vc.leave()
                    })
                }).catch(err => console.log(err))
                message.delete()
            }
        }
    }
})

function joinLeave(i) {
    setTimeout(function () {
        vc.join().then(connection => {
            setTimeout(function () {
                vc.leave()
                if (--i) (joinLeave(i))
            }, 500)
        }).catch(err => console.log(err))
    }, 500)

}

client.login(process.env.BOT_TOKEN)