const mcFallout = require("../../lib/mcFallout");
const { getContext } = require("./context");

module.exports = {
  name: "tpc",
  identifiers: ["tpc"],
  execute: async function tpcCommand(task) {
    const { bot } = getContext();
    const landOwner = task.content[1] ? task.content[1] : " ";
    const index = task.content[2] ? parseInt(task.content[2], 10) : 1;
    await mcFallout.tpc(bot, landOwner, index);
  },
  longRunning: true,
};
