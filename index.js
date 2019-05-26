require('dotenv').config()

const Discord = require('discord.js')
const client = new Discord.Client()
const messages = require('./messages.json')

var vc = undefined  // Voice channel that the bot will be joining

function leave() {
    vc.leave()
    vc = undefined
}

client.on('voiceStateUpdate', (oldMember, newMember) => {   // Play unique mp3 if user with role enters the chat

    if (oldMember.user.bot || newMember.user.bot)
        return

    var newUserChannel = newMember.voiceChannel
    var oldUserChannel = oldMember.voiceChannel

    if (oldUserChannel === undefined && newUserChannel !== undefined) { // user joined channel
        var song = undefined
        if (newMember.roles.find(role => role.name === messages.role_trigger)) {
            song = 'bassboosted.mp3'
        } else {
            song = 'bruh.mp3'   // Plays when user without the role enters the chat. Comment out to avoid some cancer
        }

        vc = newMember.voiceChannel

        vc.join().then(connection => {
            var dispatcher = connection.playFile('./audio/' + song)
            dispatcher.on("end", end => {
                leave()
            })
        }).catch(err => console.log(err))


    } else if (newUserChannel === undefined && vc !== undefined) {  // user left channel
        leave()
    }
})

client.on('message', (message) => {     /* 
                                        * Play mp3 if special message is sent in chat in your voice channel,
                                        * or in the voice channel of someone you pinged
                                        */
    var content = message.content

    if (content.startsWith('!')) {

        var iter        // Number of times the command is to be executed, in a row

        var isSpam = content.startsWith('!spam')
        var splitIndex = content.indexOf(' ')
        var firstWord
        var remainder = undefined
        var multiWord = (splitIndex === -1)

        if (multiWord){ 
            if (isSpam)
                return
            firstWord = content
        } else {        // Parse into multiple words
            firstWord = content.substr(0, splitIndex)
            remainder = content.substr(splitIndex + 1)
        }

        var iter_default = 1    // Default iter value for non-spam command
        if (isSpam)
            iter_default = 20   // Default iter value for spam command

        var fWArr = firstWord.split('=')    // Parse first word by looking for repeat command
        var fWLen = fWArr.length
        if (fWLen > 2)
            return
        var fWData = fWArr[0]       // Before equals sign
        var fWNum = fWArr[1]        // After equals sign

        if (fWLen === 1) {
            iter = iter_default
        } else if (!isNaN(fWNum)) {
            iter = fWNum
        } else {
            return
        }

        if (isSpam) {       // Text spam

            console.log(message.member.user.tag + ': ' + content)

            iter = Math.min(iter, 50) // prevent cancer

            function sendMessage(i) {   // Repeatedly send text message
                message.channel.send(remainder)
                setTimeout(() => { if (--i) (sendMessage(i)) }, 2000)
            }

            sendMessage(iter)
            message.delete()

            return
        }

        var member = message.member

        var expected_len = 0
        var numWords = 0    // used to check correct syntax
        if (remainder !== undefined)
            numWords = remainder.split(" ").length

        var mention = message.mentions.members.first()  // check for pinged member
        if (mention !== undefined) {
            expected_len++
            member = mention
        }

        vc = member.voiceChannel
        if (vc === undefined || numWords > expected_len)
            return

        iter = Math.min(iter, 20)   // avoid utter cancer

        if (fWData == '!harass') {

            console.log(member.user.tag + ': ' + content)

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
            var toPlay = undefined
            for (var i = 0; i < messages.sound_triggers.length; i++) {  // look for correct song to play
                var m = messages.sound_triggers[i]
                
                if (fWData == m.trigger) {
                    toPlay = './audio/' + m.file
                    break
                }
            }
            if (toPlay === undefined || vc === undefined) {
                return
            }

            console.log(member.user.tag + ': ' + content)

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