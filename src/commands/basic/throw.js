const containerOperation = require("../../lib/containerOperation");
const { getContext } = require("./context");
const { replyBySource } = require("./reply");

/** @type {OFABot.Command} */
const command = {
  name: "throw",
  identifiers: ["throw"],
  execute: async function throwCommand(task) {
    const { bot } = getContext();
    const targetSlots = task.content.slice(1).map((value) => parseInt(value, 10));
    if (targetSlots.length === 0) {
      replyBySource(
        task,
        "Provide slot indexes or use throwall.",
        "Provide slot indexes or use throwall.",
        null,
      );
      return;
    }

    for (const slotIndex of targetSlots) {
      await containerOperation.throw_slot(bot, slotIndex);
    }
  },
  longRunning: true,
};

module.exports = command;
