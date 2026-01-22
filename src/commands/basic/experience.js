const { getContext } = require("./context");

/** @type {OFABot.Command} */
const command = {
  name: "experience query",
  identifiers: ["xp", "exp", "experience"],
  execute: async function experienceCommand(task) {
    const { bot, logger } = getContext();
    const expLevel = bot.experience.level;
    const expPoint = bot.experience.points;
    const expProgress = Math.round(bot.experience.progress * 1000) / 10;

    switch (task.source) {
      case "minecraft-dm":
        bot.chat(
          `/m ${task.minecraftUser} &bLevel&r: &6${expLevel}&r, &bPoint&r: &6${expPoint}&r, &bProgress&r: &6${expProgress}%`,
        );
        break;
      case "console":
        logger(
          false,
          "INFO",
          process.argv[2],
          `\x1b[96mLevel \x1b[37m${expLevel} \x1b[96mPoint \x1b[37m${expPoint} \x1b[96mProgress \x1b[37m${expProgress}%\x1b[0m`,
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
