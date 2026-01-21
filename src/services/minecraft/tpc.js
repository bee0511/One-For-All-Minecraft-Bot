async function tpc(bot, owner, index) {
	let fail = false;
	try {
		await new Promise(async (res, rej) => {
			const timeout = setTimeout(() => {
				fail = true;
				rej();
			}, 15_000);
			bot.chat(`/tpc ${owner}`);
			await bot.once("windowOpen");
			if (!fail) {
				console.log("menu open");
				await bot.simpleClick.leftMouse(8 + index);
				console.log("點擊選單");
				await bot.once("forcedMove");
				if (!fail) {
					console.log(`傳送成功 - tpc_${owner}_${index}`);
					clearTimeout(timeout);
					res();
				}
			}
		});
		try {
			bot.closeWindow(bot.currentWindow);
		} catch (err) {}
	} catch (e) {
		console.log("傳送失敗");
	}
}

module.exports = { tpc };
