const containerOperation = require("../../lib/containerOperation");
const { getContext } = require("./context");

module.exports = {
  name: "quick throw",
  identifiers: ["qt"],
  execute: async function quickThrowCommand() {
    const { bot } = getContext();
    const throwWhitelist = [
      "netherite_shovel",
      "netherite_pickaxe",
      "netherite_axe",
      "netherite_sword",
      "netherite_hoe",
      "fishing_rod",
    ];

    for (let i = 9; i <= 45; i++) {
      const slotItem = bot.inventory.slots[i];
      if (slotItem && !throwWhitelist.includes(slotItem.name)) {
        await containerOperation.throw_slot(bot, i);
      }
    }
  },
  longRunning: true,
};
