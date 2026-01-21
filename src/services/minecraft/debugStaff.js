const { once } = require("events");

async function getFreeDebugStaff(bot) {
	let fail = false;
	try {
		await new Promise(async (res, rej) => {
			const timeout = setTimeout(() => {
				fail = true;
				rej();
			}, 15_000);
			bot.chat(`/chestcommands open category-5-5.yml`);
			await once(bot, "windowOpen");
			if (!fail) {
				await bot.simpleClick.leftMouse(21);
				if (!fail) {
					clearTimeout(timeout);
					res();
				}
			}
		});
		try {
			bot.closeWindow(bot.currentWindow);
		} catch (err) {}
	} catch (e) {
		console.log("取得除錯權杖失敗");
	}
}

module.exports = { getFreeDebugStaff };
