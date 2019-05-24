require('dotenv').config()

const Discord = require('discord.js')
const client = new Discord.Client()
//const ffmpeg = require('ffmpeg');

var vc;

client.on('voiceStateUpdate', (oldMember, newMember) => {
    var newUserChannel = newMember.voiceChannel
    var oldUserChannel = oldMember.voiceChannel

    if (oldUserChannel === undefined && newUserChannel !== undefined) {
        if (newMember.roles.find(role => role.name === process.env.ROLE_TRIGGER)) {

            vc = newMember.voiceChannel

            vc.join().then(connection => {
                const dispatcher = connection.playFile('./song.mp3')
                dispatcher.on("end", end => { 
                    vc.leave()
                });
            }).catch(err => console.log(err));
        }
    } else if(newUserChannel === undefined){
        vc.leave()
    }

})

client.login(process.env.BOT_TOKEN)