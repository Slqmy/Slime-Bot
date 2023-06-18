# 🌳 Slime Bot [/]

`🌳 Slime Bot [/]` is a Discord bot developed by [Slqmy](https://github.com/Slqmy) and [rolyPolyVole](https://github.com/rolyPolyVole) for `🌌 The Slimy Swamp 🌳` [community Discord server](https://www.discord.gg/SjAGgJaCYc).

The bot's main purpose is to provide key functionality and useful features for the server.

This is V2 of the bot, an archived version of V1 can be found [here](https://github.com/Slqmy/Slime-Bot-V1-Archive). Keep in mind that the code in V1 is not very well written, and it is very likely for bugs to occur, so if you for some reason plan on using it, expect errors and issues to occur.

The current version of `🌳 Slime Bot [/]` should be stable and be (mostly) free of all bugs. If you are planning on using `🌳 Slime Bot [/]` for whatever reason, it is recommended that you use this version.

## Contributors

- [Slqmy](https://github.com/Slqmy)
- [rolyPolyVole](https://github.com/rolyPolyVole)

## To-Do List

- [ ] 📄 Advanced (self-generating) settings menu (0% complete)
- [ ] 💬 Advanced embed builder (0% complete)
  - [ ] Support for multiple embeds (0% complete)
  - [ ] Support for multiple files (0% complete)
  - [ ] Support for multiple components (0 % complete)
  - [ ] Allow the components to reply with embeds (0% complete)
- [ ] 🐸 Fun commands (0% complete)
- [ ] 📊 Utility commands (30% complete)
  - [x] Poll command (100% complete)
  - [x] Purge command (100% complete)
  - [ ] More utility commands (0% complete)
- [ ] 📈 Server statistics channels system (0% complete)
- [ ] 🔼 Levelling system (40% complete)
- [ ] 📷 YouTube upload tracker (50% complete)
  - [x] YouTube upload tracker & poster (100% complete)
  - [ ] YouTube upload tracker settings (0% complete)
- [ ] ⭐ Starboard (80% complete)
  - [x] Starboard post sending (100% complete)
  - [x] Starboard post updating (100% complete)
  - [x] Delete starboard settings when the channel is deleted (100% complete)
  - [x] Delete starboard message data when the starboard message is deleted (100% complete)
  - [ ] Starboard settings (0% complete)
- [ ] 🎫 Tickets (0% complete)
- [ ] 🔢 Counting system (50% complete)
  - [x] Counting system code (100% complete)
  - [ ] Counting system settings (0% complete)
- [ ] 📜 Audit log tracker (0% complete)
- [ ] 🔊 Private VC system (0% complete)

Currently, `🌳 Slime Bot [/]` is a private bot (you can't invite it to your server), however, it may be made public at some point in the future.

## Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file. See the [.env.schema](https://github.com/Slqmy/Slime-Bot/blob/main/.env.schema) file for more information.

`discordBotToken`

`discordApplicationID`

`mongoDatabaseToken`

### Optional Environment Variables

The bot can still function without these variables, but it is recommended to fill them in to be able to have access to all the bot's features. Again, see the [.env.schema](https://github.com/Slqmy/Slime-Bot/blob/main/.env.schema) file for more information.

`discordGuildID`

`discordSupportChannelID`

`discordBotOwnerID`

`discordBotTesters`

[![ISC License](https://img.shields.io/badge/License-ISC-green.svg)](https://choosealicense.com/licenses/isc/)
