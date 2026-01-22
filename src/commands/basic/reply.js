const { getContext } = require("./context");

/**
 * @param {OFABot.Task} task
 * @param {string} minecraftMessage
 * @param {string} consoleMessage
 * @param {string | null} discordMessage
 */
function replyBySource(task, minecraftMessage, consoleMessage, discordMessage) {
  const { bot } = getContext();
  switch (task.source) {
    case "minecraft-dm":
      bot.chat(`/m ${task.minecraftUser} ${minecraftMessage}`);
      break;
    case "console":
      console.log(consoleMessage);
      break;
    case "discord":
      console.log(`Discord Reply not implemented ${discordMessage}`);
      break;
    default:
      break;
  }
}

module.exports = { replyBySource };
