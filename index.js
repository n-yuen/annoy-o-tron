require('dotenv').config()

const Discord = require('discord.js')
const client = new Discord.Client()
const ffmpeg = require('ffmpeg');

client.on('voiceStateUpdate', (oldMember, newMember) => {
    var newUserChannel = newMember.voiceChannel
    var oldUserChannel = oldMember.voiceChannel

    console.log(`trigger1`)

    if (oldUserChannel === undefined && newUserChannel !== undefined) {
        console.log(`trigger2`)
        if (newMember.roles.find(role => role.name === process.env.ROLE_TRIGGER)) {
            console.log(`trigger3`)

            var voiceChannel = newMember.voiceChannel

            voiceChannel.join().then(connection => {
                const dispatcher = connection.playFile('./song.mp3')
                dispatcher.on("end", end => { 
                    voiceChannel.leave()
                });
            }).catch(err => console.log(err));
        }
    }
})

client.login(process.env.BOT_TOKEN)