const { getContext } = require("./context");

/** @type {OFABot.Command} */
const command = {
  name: "task list",
  identifiers: ["tl"],
  execute: async function taskListCommand() {
    const { bot } = getContext();
    console.log(bot.taskManager.tasks);
  },
  longRunning: false,
};

module.exports = command;
