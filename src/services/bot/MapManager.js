class MapManager {
	constructor() {
		this.maplist = [];
		this.bot = null;
	}

	setBot(bot) {
		this.bot = bot;
	}

	init() {
		if (!this.bot) return;
		this.bot.mapManager = this;
		this.bot._client.on("map", () => {
			//console.log(mapdata)
		});
	}
}

module.exports = MapManager;
