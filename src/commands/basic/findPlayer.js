const mcFallout = require("../../services/minecraft");
const { getContext } = require("./context");
const { replyBySource } = require("./reply");

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

module.exports = {
  name: "find player",
  identifiers: ["find", "findplayer"],
  execute: async function findPlayerCommand(task) {
    const { bot } = getContext();
    if (task.content.length < 2) {
      replyBySource(
        task,
        "Invalid args length.",
        "Invalid args length.",
        "Invalid args length.",
      );
      return;
    }

    const playerServers = await mcFallout.getPlayerServer(
      bot,
      task.content.slice(1),
    );
    for (const playerName in playerServers) {
      const serverId = playerServers[playerName];
      if (serverId !== -1) {
        replyBySource(
          task,
          `Found ${playerName} at ${serverId}`,
          `Found ${playerName} at ${serverId}`,
          `Found ${playerName} at ${serverId}`,
        );
      } else {
        replyBySource(
          task,
          `Player ${playerName} not found`,
          `Player ${playerName} not found`,
          `Player ${playerName} not found`,
        );
      }
      await sleep(1000);
    }
  },
  longRunning: false,
};
