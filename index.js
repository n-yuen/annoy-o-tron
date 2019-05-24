require('dotenv').config()

const Discord = require('discord.js')
const client = new Discord.Client()
const messages = require('./messages.json')

var vc = undefined;

function leave() {
    vc.leave()
    vc = undefined;
}

client.on('voiceStateUpdate', (oldMember, newMember) => {   // Play unique mp3 if user with role enters the chat
    var newUserChannel = newMember.voiceChannel
    var oldUserChannel = oldMember.voiceChannel

    if (oldUserChannel === undefined && newUserChannel !== undefined) { // user joined channel
        if (newMember.roles.find(role => role.name === messages.role_trigger)) {

            vc = newMember.voiceChannel

            vc.join().then(connection => {
                var dispatcher = connection.playFile('./audio/bassboosted.mp3')
                dispatcher.on("end", end => {
                    leave()
                })
            }).catch(err => console.log(err))
        }
    } else if (newUserChannel === undefined && vc !== undefined) {  // user left channel
        leave()
    }
})

client.on('message', (message) => {     /* 
                                        * Play mp3 if special message is sent in chat in your voice channel,
                                        * or in the voice channel of someone you pinged
                                        */
    var member = message.member
    var content = message.content

    var expected_len = 2

    if (content.startsWith('!')) {

        var mention = message.mentions.members.first()  // check for pinged member
        if (mention !== undefined) {
            expected_len++
            member = mention
        }

        console.log(content.length)
        var parsed_content = content.split(" ")
        if (parsed_content.length > expected_len)
            return

        var iter = 0 // number of times to repeat the action
        if (parsed_content.length > expected_len - 1) { // read number as second word of the message, if applicable, and storre to iter
            var content2 = parsed_content[1]
            if (content2 !== undefined && !isNaN(content2))
                iter = parseInt(content2, 10)
        }

        iter = Math.max(iter, 20)   // avoid utter cancer

        vc = member.voiceChannel

        var toPlay = undefined
        if (parsed_content[0] == '!harass') {
            if (iter === 0) iter = 10

            function joinLeave(i) {         // join and leave repeatedly
                setTimeout(() => {
                    vc.join().then(connection => {
                        setTimeout(() => {
                            vc.leave()
                            setTimeout(() => { if (--i) (joinLeave(i)) }, 100)
                        }, 300)
                    }).catch(err => console.log(err))
                }, 400)
            }

            joinLeave(iter)
        } else {
            for (var i = 0; i < messages.sound_triggers.length; i++) {  // look for correct song to play
                var m = messages.sound_triggers[i]
                if (parsed_content[0] == m.trigger) {
                    toPlay = './audio/' + m.file
                    break
                }
            }
            if (toPlay === undefined || vc === undefined) {
                return
            }

            if (!iter) iter++

            vc.join().then(connection => {
                function playAudio(i) {     // play audio repeatedly
                    var dispatcher = connection.playFile(toPlay)
                    dispatcher.on("end", end => {
                        if (--iter) (playAudio(i))
                        else if (vc !== undefined) leave()
                    })
                }
                playAudio(iter)

            }).catch(err => console.log(err))

        }
        message.delete()
    }
})

client.login(process.env.BOT_TOKEN)