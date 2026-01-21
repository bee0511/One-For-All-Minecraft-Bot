const process = require("process");

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
let lastChat = Date.now();

async function promiseTeleportServer(bot, server, timeout = 15_000) {
	timeout *= 2;
	while (bot.botinfo.server != server) {
		let rs = await teleportServer(bot, server, timeout);
		if (rs == true) return true;
	}
}

async function teleportServer(bot, server, timeout = 15_000) {
	bot.logger(
		true,
		"INFO",
		process.argv[2],
		`切換伺服器 從 ${bot.botinfo.server} 到 ${server}`,
	);
	let needWaitProfile = false;
	let loadProfile = false;
	if (bot.botinfo.server != server) {
		needWaitProfile = true;
	}
	console.log("需要等待人物載入", needWaitProfile);
	while (bot.botinfo.server != server) {
		if (Date.now() - lastChat > 5000) {
			bot.chat(`/ts ${server}`);
			bot.logger(true, "INFO", process.argv[2], `/ts ${server}`);
			lastChat = Date.now();
		} else {
			const waitMs = 5000 - (Date.now() - lastChat);
			await sleep(waitMs);
			continue;
		}
		let waitChangeServerStartTime = Date.now();
		let success = false;
		bot.on("message", profileLoadCheck);
		while (Date.now() - waitChangeServerStartTime < timeout) {
			if (!needWaitProfile && bot.botinfo.server == server) {
				success = true;
				break;
			}
			if (needWaitProfile && loadProfile) {
				console.log(
					`切換伺服器成功 花費 ${Date.now() - waitChangeServerStartTime} ms`,
				);
				success = true;
				break;
			}
			await sleep(100);
		}
		if (success) return true;
		else {
			if (!loadProfile) {
				try {
					bot.off("message", profileLoadCheck);
				} catch (e) {
					console.log(e);
				}
			}
			console.log(`切換伺服器失敗`);
			return false;
		}
	}
	async function profileLoadCheck(jsonMsg) {
		let loadDataRegex = /\[系統\] 讀取人物成功。/;
		let ldR = loadDataRegex.test(jsonMsg.toString());
		if (ldR) {
			loadProfile = true;
			console.log("收到 讀取人物成功 訊息");
			bot.off("message", profileLoadCheck);
		}
	}
}

async function waitChangeServer(bot, maxtime) {
	if (!maxtime) maxtime = 30000;
	let waitChangeServerStartTime = Date.now();
	let loadProfile = false;
	let success = false;
	bot.on("message", lDcheck);
	while (Date.now() - waitChangeServerStartTime < maxtime) {
		if (loadProfile) {
			console.log(
				`切換伺服器成功 花費 ${Date.now() - waitChangeServerStartTime} ms`,
			);
			success = true;
			break;
		}
		await sleep(100);
	}
	if (success) return 1;
	else {
		if (!loadProfile) {
			try {
				bot.off("message", lDcheck);
			} catch (e) {
				console.log(e);
			}
		}
		console.log(`切換伺服器失敗`);
		return 0;
	}
	async function lDcheck(jsonMsg) {
		let loadDataRegex = /\[系統\] 讀取人物成功。/;
		let ldR = loadDataRegex.test(jsonMsg.toString());
		if (ldR) {
			loadProfile = true;
			bot.off("message", lDcheck);
		}
	}
}

async function waitProfileLoad() {}

async function sethome(bot, homeName, timeout = 15_000, log = false) {
	let fail = false;
	try {
		await new Promise(async (res, rej) => {
			const to = setTimeout(() => {
				fail = true;
				rej();
			}, timeout);
			bot.chat(`/sethome ${homeName}`);
			await bot.awaitMessage(/^已成功設立目前位置為家點。$/);
			if (!fail) {
				if (log)
					bot.logger(
						false,
						"INFO",
						process.argv[2],
						`sethome ${homeName} - 設立成功`,
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
			`sethome ${homeName} - 設立失敗`,
		);
		return false;
	}
}

module.exports = {
	promiseTeleportServer,
	teleportServer,
	waitChangeServer,
	waitProfileLoad,
	sethome,
};
