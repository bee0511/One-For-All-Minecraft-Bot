const { getContext } = require("./context");

/** @type {OFABot.Command} */
const command = {
  name: "exit",
  identifiers: ["exit"],
  execute: async function exitCommand() {
    const { bot } = getContext();
    process.send({ type: "setStatus", value: 0 });
    await bot.gkill(0);
  },
  longRunning: false,
};

module.exports = command;
