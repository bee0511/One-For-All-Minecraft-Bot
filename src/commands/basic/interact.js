const { Vec3 } = require("vec3");
const { getContext } = require("./context");

module.exports = {
  name: "interact",
  identifiers: ["interact"],
  execute: async function interactCommand(task) {
    const { bot } = getContext();
    const x = parseInt(task.content[1], 10);
    const y = parseInt(task.content[2], 10);
    const z = parseInt(task.content[3], 10);
    const position = new Vec3(x, y, z);
    console.log(position);
    bot._client.write("block_place", {
      location: position,
      direction: 1,
      hand: 0,
      cursorX: 0.5,
      cursorY: 0.5,
      cursorZ: 0.5,
      insideBlock: false,
    });
  },
  longRunning: false,
};
