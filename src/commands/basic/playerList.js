const { getContext } = require("./context");

/** @type {OFABot.Command} */
const command = {
  name: "player list",
  identifiers: ["plist"],
  execute: async function playerListCommand() {
    const { bot } = getContext();
    const result = await bot.tabComplete("/tpa ");
    const playerList = result.map((entry) => entry.match);
    playerList.sort();
    console.log(playerList);
  },
  longRunning: false,
};

module.exports = command;
