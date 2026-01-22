const { getContext } = require("./context");

function formatSlot(item, bot, mcData) {
  if (!item) return null;
  const isQuickbarSlot = item.slot - 36 === bot.quickBarSlot;
  let line = `${isQuickbarSlot ? "\x1b[33mslot:\x1b[0m" : "slot:"} ${item.slot.toString().padEnd(2, " ")} ${item.name.padEnd(18, " ")} `;
  const itemTemplate = mcData.items[item.type];
  if (itemTemplate?.stackSize && itemTemplate.stackSize !== 1) {
    line += `x \x1b[33m${item.count}\x1b[0m `;
  } else {
    line += `\x1b[33m${"".padEnd(4, " ")}\x1b[0m `;
  }

  if (
    itemTemplate?.enchantCategories?.includes("breakable") &&
    item.durabilityUsed != null
  ) {
    const remaining =
      Math.round(
        ((itemTemplate.maxDurability - item.durabilityUsed) * 1000) /
          itemTemplate.maxDurability,
      ) / 10;
    if (remaining > 95) line += `\x1b[32m${remaining}%\x1b[0m `;
    else if (remaining > 50) line += `\x1b[33m${remaining}%\x1b[0m `;
    else line += `\x1b[31m${remaining}%\x1b[0m `;
  }

  return line;
}

/** @type {OFABot.Command} */
const command = {
  name: "bot info",
  identifiers: ["info", "i", "stats"],
  execute: async function infoCommand(task) {
    const { bot, logger, mcData } = getContext();
    const currentPosition = bot.entity.position;
    const expLevel = bot.experience.level;
    const expPoint = bot.experience.points;
    const expProgress = Math.round(bot.experience.progress * 1000) / 10;
    const inventory = bot.inventory;

    if (task.source === "minecraft-dm") {
      bot.chat(
        `/m ${task.minecraftUser} &bServer: &7${bot.botinfo.server}&r|&bPos: &7${currentPosition}&r|&aEmerald: &7${bot.botinfo.balance}&r|&6Coin: &7${bot.botinfo.coin}`,
      );
      return;
    }

    if (task.source === "console") {
      const lines = [];
      lines.push(
        `\x1b[96mServer \x1b[0m${bot.botinfo.server} \x1b[96mPos \x1b[0m${currentPosition}\x1b[0m`,
      );
      lines.push(
        `\x1b[96mEmerald\x1b[0m${bot.botinfo.balance} \x1b[96mCoin\x1b[0m${bot.botinfo.coin}\x1b[0m`,
      );
      lines.push(
        `\x1b[96mLevel \x1b[0m${expLevel} \x1b[96mPoint \x1b[0m${expPoint} \x1b[96mProgress \x1b[0m${expProgress}%\x1b[0m`,
      );
      lines.push(`\x1b[96mArmor\x1b[0m`);

      for (let i = 5; i <= 8; i++) {
        const line = formatSlot(inventory.slots[i], bot, mcData);
        if (line) lines.push(line);
      }

      lines.push(
        `\x1b[96mQuickbar (${bot.inventory.inventoryEnd - 9}-${bot.inventory.inventoryEnd - 1})\x1b[92m quickbar - ${bot.quickBarSlot + 36}(${bot.quickBarSlot})\x1b[0m`,
      );
      for (let i = 36; i <= 45; i++) {
        const line = formatSlot(inventory.slots[i], bot, mcData);
        if (line) lines.push(line);
      }

      lines.push(
        `\x1b[96mInventory (${bot.inventory.inventoryStart}-${bot.inventory.inventoryEnd - 10})\x1b[0m`,
      );
      for (let i = 9; i <= 35; i++) {
        const line = formatSlot(inventory.slots[i], bot, mcData);
        if (line) lines.push(line);
      }

      logger(false, "INFO", process.argv[2], `BOT info\n${lines.join("\n")}`);
      return;
    }

    if (task.source === "discord") {
      console.log("Discord Reply not implemented");
    }
  },
  longRunning: false,
};

module.exports = command;
