const { getFreeDebugStaff } = require("./debugStaff");
const { openPreventSpecItem } = require("./openPreventItem");
const {
	promiseTeleportServer,
	teleportServer,
	waitChangeServer,
	waitProfileLoad,
	sethome,
} = require("./teleport");
const { promiseWarp, warp } = require("./warp");
const { tpc } = require("./tpc");
const { getPlayerServer } = require("./playerServer");
const { rTextNoColor } = require("./text");

module.exports = {
	getFreeDebugStaff,
	openPreventSpecItem,
	promiseTeleportServer,
	teleportServer,
	waitChangeServer,
	waitProfileLoad,
	sethome,
	promiseWarp,
	warp,
	tpc,
	getPlayerServer,
	rTextNoColor,
};
