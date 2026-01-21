const mcFallout = require("../../lib/mcFallout");
const { getContext } = require("./context");

module.exports = {
  name: "warp",
  identifiers: ["warp", "/warp"],
  execute: async function warpCommand(task) {
    const { bot } = getContext();
    const warpTarget = task.content[1] ? task.content[1] : " ";
    console.log(warpTarget);
    await mcFallout.warp(bot, warpTarget);
  },
  longRunning: true,
};
