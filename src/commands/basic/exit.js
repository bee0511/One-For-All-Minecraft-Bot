const { getContext } = require("./context");

module.exports = {
  name: "exit",
  identifiers: ["exit"],
  execute: async function exitCommand() {
    const { bot } = getContext();
    process.send({ type: "setStatus", value: 0 });
    await bot.gkill(0);
  },
  longRunning: false,
};
