const process = require("process");
const { once } = require("events");

async function warp(bot, warpp, timeout = 15_000, log = false) {
	let fail = false;
	try {
		await new Promise(async (res, rej) => {
			const to = setTimeout(() => {
				fail = true;
				rej();
			}, timeout);
			bot.chat(`/warp ${warpp}`);
			await once(bot, "forcedMove");
			if (!fail) {
				if (log)
					bot.logger(
						false,
						"INFO",
						process.argv[2],
						`warp ${warpp} - 傳送成功`,
					);
				clearTimeout(to);
				res();
			}
		});
		return true;
	} catch (e) {
		bot.logger(
			true,
			"WARN",
			process.argv[2],
			`warp ${warpp} - 傳送失敗`,
		);
		return false;
	}
}

async function promiseWarp(bot, warpName, timeout = 15_000) {
	await warp(bot, warpName, timeout);
}

module.exports = { warp, promiseWarp };
