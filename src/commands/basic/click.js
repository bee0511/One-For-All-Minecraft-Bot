const { getContext } = require("./context");

/** @type {OFABot.Command} */
const command = {
  name: "click the window",
  identifiers: ["click"],
  execute: async function clickCommand(task) {
    const { bot } = getContext();
    const slotId = parseInt(task.content[1], 10);
    console.log(slotId);
    await bot.simpleClick.leftMouse(slotId);
  },
  longRunning: false,
};

module.exports = command;
