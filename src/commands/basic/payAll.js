const { getContext } = require("./context");

/** @type {OFABot.Command} */
const command = {
  name: "emerald withdraw",
  identifiers: ["payall", "withdraw"],
  execute: async function payAllCommand(task) {
    const { bot, logger } = getContext();
    if (task.source === "minecraft-dm") {
      bot.chat(`/pay ${task.minecraftUser} ${bot.botinfo.balance}`);
      logger(
        true,
        "INFO",
        process.argv[2],
        `${task.minecraftUser} withdraw ${bot.botinfo.balance}`,
      );
      return;
    }
    console.log("Only available via minecraft DM.");
  },
  longRunning: false,
};

module.exports = command;
