const { getContext } = require("./context");

/** @type {OFABot.Command} */
const command = {
  name: "say",
  identifiers: ["say"],
  execute: async function sayCommand(task) {
    const { bot, logger } = getContext();
    const text = task.content.slice(1).join(" ");
    if (task.source === "minecraft-dm") {
      logger(
        true,
        "INFO",
        process.argv[2],
        `Forward ${task.minecraftUser} message: ${text}`,
      );
    } else if (task.source === "console") {
      logger(true, "INFO", process.argv[2], `Forward message: ${text}`);
    }
    bot.chat(text);
  },
  longRunning: false,
};

module.exports = command;
