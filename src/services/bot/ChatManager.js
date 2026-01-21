class ChatManager {
	constructor() {
		this.q = [];
		this.pq = [];
		this.cd = 400;
		this.lastSend = Date.now();
		this.bot = null;
		this.checker = setInterval(async () => {
			if (this.q.length === 0 && this.pq.length === 0) return;
			if (Date.now() - this.lastSend < this.cd) return;
			if (!this.bot) return;
			if (this.pq.length !== 0) {
				this.bot.chat(this.pq.shift());
				this.lastSend = Date.now();
				return;
			}
			if (this.q.length !== 0) {
				this.bot.chat(this.q.shift());
				this.lastSend = Date.now();
			}
		}, 10);
	}

	setBot(bot) {
		this.bot = bot;
	}

	async chat(text) {
		this.q.push(text);
	}

	async cmd(text) {
		this.pq.push(text);
	}

	init() {
		if (!this.bot) return;
		this.bot.chatManager = this;
	}
}

module.exports = ChatManager;
