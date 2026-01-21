const { getContext } = require("./context");

module.exports = {
  name: "task list",
  identifiers: ["tl"],
  execute: async function taskListCommand() {
    const { bot } = getContext();
    console.log(bot.taskManager.tasks);
  },
  longRunning: false,
};
