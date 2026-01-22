const containerOperation = require("../../lib/containerOperation");
const { getContext } = require("./context");

/** @type {OFABot.Command} */
const command = {
  name: "throw all",
  identifiers: ["throwall"],
  execute: async function throwAllCommand() {
    const { bot } = getContext();
    for (let i = 9; i <= 45; i++) {
      await containerOperation.throw_slot(bot, i);
    }
  },
  longRunning: false,
};

module.exports = command;
