const { getContext } = require("./context");

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
