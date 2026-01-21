const { getContext } = require("./context");

function formatIdentifiers(identifiers) {
  if (!identifiers) return "-";
  if (Array.isArray(identifiers)) return identifiers.join(",");
  return String(identifiers);
}

module.exports = {
  name: "usagetree",
  identifiers: ["help", "?", "usage"],
  execute: async function helpCommand() {
    const { bot } = getContext();
    const groups = bot.taskManager.commands || [];

    groups.forEach((group, groupIndex) => {
      const isLastGroup = groupIndex === groups.length - 1;
      const groupBranch = isLastGroup ? "└─" : "├─";
      console.log(`${groupBranch} ${formatIdentifiers(group.identifiers)}`);

      const groupCommands = group.commands || [];
      groupCommands.forEach((command, commandIndex) => {
        const isLastCommand = commandIndex === groupCommands.length - 1;
        const commandBranch = isLastCommand ? "└─" : "├─";
        console.log(
          `│  ${commandBranch} ${formatIdentifiers(command.identifiers)} → ${command.name}`,
        );
      });
    });

    const basicCommands = bot.taskManager.basicCommands || [];
    const basicLabel = bot.taskManager.basicCommandLabel || "basic";
    console.log(`└─ ${basicLabel}`);

    basicCommands.forEach((command, commandIndex) => {
      const isLastCommand = commandIndex === basicCommands.length - 1;
      const commandBranch = isLastCommand ? "└─" : "├─";
      console.log(
        `   ${commandBranch} ${formatIdentifiers(command.identifiers)} → ${command.name}`,
      );
    });
  },
  longRunning: false,
};
