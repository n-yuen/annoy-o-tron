# Annoy-o-tron

Want to pester your friends? Do people not hate you enough? Do you not hate yourself enough? This is the bot for you.

Annoy-o-tron can, on request, play mp3s on repeat any number of times! Alternatively, it can spam chat with a specified message over and over again.

If that wasn't enough, you can also configure it to play an mp3 if a user with a particular role joins, just to announce their special arrival.

And just when your friends think they can get you by muting the bot, have the bot repeatedly join and leave the voice channel until everyone blocks and bans you.

# Setup

Create a .env file containing Discord setup information; it should have the properties:

`BOT_TOKEN=....

CLIENT_ID=....`

Then, create a messages.json file containing the following properties:

sound_triggers, an array of elements formatted as follows:

`{
    "trigger": ...
    "file": ...
}`

where file is an mp3 file located in the ./audio folder, and trigger is what is typed in chat for the bot to play the audio.

role_trigger, the exact name of the role that the bot will recognize to play audio when that user joins a channel.

View messages_example.json for an example.

`npm install` to install the packages. `npm run start` to start the bot.

# Syntax

The bot will read commands from Discord chat. For all commands, syntax is `![command name]=[command number]`. To play mp3 files, the bot will default to the voice channel that you're in. Otherwise, you will need to specify the channel to join by adding [@user_to_annoy] at the end of the command.

Ex: `!bruh=20 @XDDDDDDD#6969` will play the mp3 corresponding to "bruh" in XDDDDDDD's channel 20 times in a row.

Alternatively, the `!harass` command will tell the bot to leave and join a user's channel, following the same syntax as above.

For text spam, it's roughly the same: `!spam=[num] [message]`

Ex: `!spam=50 @everyone HAVE A NICE DAY` will cause the bot to output `@everyone HAVE A NICE DAY` fifty times.
