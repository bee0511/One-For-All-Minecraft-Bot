const { getContext } = require("./context");

/** @type {OFABot.Command} */
const command = {
  name: "balance query",
  identifiers: ["balance", "bal", "money", "emerald", "coin"],
  execute: async function balanceCommand(task) {
    const { bot, logger } = getContext();
    switch (task.source) {
      case "minecraft-dm":
        bot.chat(
          `/m ${task.minecraftUser} &bEmerald&r: &6${bot.botinfo.balance}&r, &bCoin&r: &6${bot.botinfo.coin}`,
        );
        break;
      case "console":
        logger(
          false,
          "INFO",
          process.argv[2],
          `\x1b[96mEmerald\x1b[37m${bot.botinfo.balance} \x1b[96mCoin\x1b[37m${bot.botinfo.coin}\x1b[0m`,
        );
        break;
      case "discord":
        console.log("Discord Reply not implemented");
        break;
      default:
        break;
    }
  },
  longRunning: false,
};

module.exports = command;
