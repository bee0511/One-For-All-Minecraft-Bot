const { initContext } = require("./context");
const taskList = require("./taskList");
const interact = require("./interact");
const click = require("./click");
const help = require("./help");
const playerList = require("./playerList");
const info = require("./info");
const payAll = require("./payAll");
const balance = require("./balance");
const experience = require("./experience");
const throwCommand = require("./throw");
const quickThrow = require("./quickThrow");
const throwAll = require("./throwAll");
const say = require("./say");
const warp = require("./warp");
const tpc = require("./tpc");
const findPlayer = require("./findPlayer");
const exitCommand = require("./exit");

/** @type {OFABot.Command[]} */
const commands = [
  taskList,
  interact,
  click,
  help,
  playerList,
  info,
  payAll,
  balance,
  experience,
  throwCommand,
  quickThrow,
  throwAll,
  say,
  warp,
  tpc,
  findPlayer,
  exitCommand,
];

/** @type {OFABot.BasicCommandModule} */
const basicCommandsModule = {
  label: "basic",
  commands,
  init: async function init(bot, userId, logger) {
    initContext(bot, userId, logger);
  },
};

module.exports = basicCommandsModule;
