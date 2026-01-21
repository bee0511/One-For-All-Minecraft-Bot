const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function getPlayerServer(bot, targetUser) {
	let result = {};
	for (let i = 0; i < targetUser.length; i++) {
		result[targetUser[i]] = -1;
	}
	bot.on("message", mtTarget);
	bot.chat("/glist");
	let waitMSG = true;
	let stopMTTARGET = setTimeout(() => {
		try {
			bot.off("message", mtTarget);
			console.log("glist Timeout");
		} catch (e) {
			console.log("glist Timeout 解除監聽失敗");
		}
		waitMSG = false;
	}, 5000);
	async function mtTarget(jsonMsg) {
		let msg = jsonMsg.toString();
		let glistReg = /\[\w+\] \(\d+\): ([\s\w(,)*])*/g;
		let glistEnd = /Total players online: (\d+)/g;
		let crtServer = msg.split("]")[0].substr(1, this.length);
		if (msg.match(glistReg)) {
			let m2 = msg.replace(/\s+/g, "");
			let users = m2.split(":")[1].split(",");
			for (let user of users) {
				if (targetUser.includes(user)) {
					result[user] = crtServer;
				}
			}
		}
		if (msg.match(glistEnd)) {
			bot.off("message", mtTarget);
			clearTimeout(stopMTTARGET);
			waitMSG = false;
		}
	}
	while (waitMSG) {
		await sleep(50);
	}
	return result;
}

module.exports = { getPlayerServer };
