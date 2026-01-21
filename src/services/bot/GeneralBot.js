const ChatManager = require("./ChatManager");
const CommandResolver = require("./CommandResolver");
const MapManager = require("./MapManager");
const Task = require("./Task");
const TaskManager = require("./TaskManager");

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

class GeneralBot {
	constructor(options) {
		this.profileName = options.profileName;
		this.botType = options.botType;
		this.debug = options.debug;
		this.enableChat = options.enableChat;

		this.process = options.process;
		this.fs = options.fs;
		this.fsp = options.fsp;
		this.mineflayer = options.mineflayer;
		this.logger = options.logger;
		this.profiles = options.profiles;
		this.ChatMessage = options.chatMessageClass;
		this.regexes = options.regexes || {};
		this.commands = options.commands || [];
		this.basicCommandsModule = options.basicCommandsModule;
		this.basicCommands = options.basicCommandsModule?.commands || [];
		this.basicCommandLabel = options.basicCommandsModule?.label || "basic";

		this.login = false;
		this.config = null;
		this.bot = null;
		this.botInfo = {
			server: -1,
			serverCH: -1,
			balance: -1,
			coin: -1,
			tabUpdateTime: new Date(),
		};

		this.commandResolver = new CommandResolver({
			commandGroups: this.commands,
			basicCommands: this.basicCommands,
		});
		this.taskManager = new TaskManager({
			logger: this.logger,
			profileName: this.profileName,
			fs: this.fs,
			fsp: this.fsp,
			sendStatus: (value) => this.sendStatus(value),
			getLogin: () => this.login,
			commandResolver: this.commandResolver,
			cwd: () => this.process.cwd(),
		});
		this.chatManager = new ChatManager();
		this.mapManager = new MapManager();
	}

	start() {
		this.ensureProfile();
		this.ensureConfigDir();
		this.sendReloadCd();
		this.sendStatus(3001);
		this.registerProcessHandlers();
		this.createBot();
	}

	ensureProfile() {
		if (!this.profiles[this.profileName]) {
			//已經在parent檢查過了 這邊沒有必要
			console.log(`profiles中無 ${this.profileName} 資料`);
			this.sendStatus(1000);
			this.process.exit(2001);
		}
	}

	ensureConfigDir() {
		if (!this.fs.existsSync(`config/${this.profileName}`)) {
			this.fs.mkdirSync(`config/${this.profileName}`, { recursive: true });
			console.log(`未發現配置文件 請至 config/${this.profileName} 配置`);
		}
	}

	sendStatus(value) {
		this.process.send({ type: "setStatus", value });
	}

	sendReloadCd(value) {
		const reloadValue =
			typeof value === "number"
				? value
				: this.config?.setting?.reconnect_CD
					? this.config.setting.reconnect_CD
					: 20_000;
		this.process.send({ type: "setReloadCD", value: reloadValue });
	}

	createBot() {
		this.logger(
			true,
			"INFO",
			this.profileName,
			`Initializing | type: ${this.botType}`,
		);
		this.bot = this.mineflayer.createBot({
			host: this.profiles[this.profileName].host,
			port: this.profiles[this.profileName].port,
			username: this.profiles[this.profileName].username,
			auth: "microsoft",
			version: "1.18.2",
		});
		if (this.debug) {
			this.bot.on("windowOpen", async () => {
				//console.log(window)
				// console.log(window.title)
				// for(i in window.slots){
				//     if(!window.slots[i]) continue
				//     else console.log(`${window.slots[i].slot} ${window.slots[i].name} ${window.slots[i].displayName}`)
				// }
			});
		}
		this.taskManager.setBot(this.bot);
		this.chatManager.setBot(this.bot);
		this.mapManager.setBot(this.bot);
		this.registerBotEvents();
		return this.bot;
	}

	registerBotEvents() {
		this.bot.once("spawn", async () => {
			await this.handleSpawn();
		});
		this.bot.on("message", async (jsonMsg) => {
			if (this.enableChat) {
				if (jsonMsg.toString().includes("目標生命 : ❤❤❤❤❤❤❤❤❤❤")) {
					return;
				}
				this.logger(false, "CHAT", this.profileName, jsonMsg.toAnsi());
			}
		});
		this.bot.on("forcedMove", () => {
			if (this.bot.debugMode)
				this.logger(
					false,
					"DEBUG",
					this.profileName,
					`\x1b[31m強制移動\x1b[0m ${this.bot.entity.position} 伺服 ${this.botInfo.server}`,
				);
		});
		this.bot.on("dm", async (jsonMsg) => {
			await this.handleDirectMessage(jsonMsg);
		});
		this.bot.on("tpa", (playerName) => {
			this.handleTpa(playerName);
		});
		this.bot.on("tpahere", (playerName) => {
			this.handleTpahere(playerName);
		});
		this.bot._client.on("playerlist_header", (data) => {
			this.handleTabHeader(data);
			this.handleScoreboard(this.bot.scoreboard["1"]);
		});
		this.bot.on("error", async (error) => {
			await this.handleError(error);
		});
		this.bot.on("kicked", async (reason, loggedIn) => {
			await this.handleKicked(reason, loggedIn);
		});
		this.bot.on("death", () => {
			this.logger(
				true,
				"INFO",
				this.profileName,
				`Death at Location: ${this.bot.entity.position} server: ${this.botInfo.server}`,
			);
		});
		this.bot.once("end", async () => {
			this.logger(
				true,
				"WARN",
				this.profileName,
				`${this.profileName} disconnect`,
			);
			await sleep(1000);
			await this.kill(1000);
		});
		this.bot.once("wait", async () => {
			this.sendReloadCd(120_000);
			this.logger(true, "INFO", this.profileName, `was sent to waiting room`);
			await this.kill(11);
		});
	}

	async handleSpawn() {
		this.logger(true, "INFO", this.profileName, `login as ${this.bot.username}`);
		this.bot._client.write("abilities", {
			flags: 0b0111,
			flyingSpeed: 4.0,
			walkingSpeed: 4.0,
		});
		this.bot.entity.onGround = false;
		this.bot.creative.flyTo(this.bot.entity.position.offset(0, 0.01, 0));
		this.bot.logger = this.logger;
		this.bot.gkill = (code) => this.kill(code);
		this.bot.botinfo = this.botInfo;
		this.bot.debugMode = this.debug;
		this.taskManager.init();
		this.chatManager.init();
		this.mapManager.init();
		await this.basicCommandsModule.init(
			this.bot,
			this.profileName,
			this.logger,
		);
		for (const command of this.commands) {
			await command.init(this.bot, this.profileName, this.logger);
		}
		this.bot._client.write("client_command", { payload: 0 }); //fix death bug
		this.sendStatus(3201);
		this.sendReloadCd();
		this.bot.chatAddPattern(
			/^(\[[A-Za-z0-9-_您]+ -> [A-Za-z0-9-_您]+\] .+)$/,
			"dm",
		);
		this.bot.chatAddPattern(/^\[系統\] (\S+) 想要傳送到 你 的位置$/, "tpa");
		this.bot.chatAddPattern(
			/^\[系統\] (\S+) 想要你傳送到 該玩家 的位置$/,
			"tpahere",
		);
		this.bot.chatAddPattern(/^Summoned to wait by CONSOLE$/, "wait");
		this.login = true;
	}

	async handleDirectMessage(jsonMsg) {
		const args = jsonMsg.toString().split(" ");
		const playerId = args[0].slice(1, args[0].length);
		const cmds = args.slice(3, args.length);
		const command = this.taskManager.isTask(cmds);
		if (!this.config.setting.whitelist.includes(playerId)) {
			this.logger(true, "CHAT", this.profileName, jsonMsg.toString());
			return;
		}
		if (command) {
			const task = new Task(
				this.taskManager.defaultPriority,
				command.name,
				"minecraft-dm",
				cmds,
				undefined,
				undefined,
				playerId,
				undefined,
			);
			this.taskManager.assign(task, command.longRunning);
			// console.log(taskManager.isImm(cmds))
		} else {
			this.bot.chat(
				`/m ${playerId} 無效的指令 輸入 help 查看幫助 若要轉發消息使用 say <text>`,
			);
			this.enableChat = !this.enableChat;
		}
		this.logger(true, "CHAT", this.profileName, jsonMsg.toString());
	}

	handleTpa(playerName) {
		this.bot.chat(
			this.config.setting.whitelist.includes(playerName)
				? "/tpaccept"
				: "/tpdeny",
		);
		this.logger(
			true,
			"INFO",
			this.profileName,
			`${this.config.setting.whitelist.includes(playerName) ? "\x1b[32mAccept\x1b[0m" : "\x1b[31mDeny\x1b[0m"} ${playerName}'s tpa request`,
		);
	}

	handleTpahere(playerName) {
		this.bot.chat(
			this.config.setting.whitelist.includes(playerName)
				? "/tpaccept"
				: "/tpdeny",
		);
		this.logger(
			true,
			"INFO",
			this.profileName,
			`${this.config.setting.whitelist.includes(playerName) ? "\x1b[32mAccept\x1b[0m" : "\x1b[31mDeny\x1b[0m"} ${playerName}'s tpahere request`,
		);
	}

	async handleError(error) {
		if (error?.message?.includes("RateLimiter disallowed request")) {
			this.sendReloadCd(60_000);
			this.sendStatus(4);
			await this.kill(1900);
		} else if (error?.message?.includes("Failed to obtain profile data for")) {
			this.sendStatus(4);
			await this.kill(1901);
		} else if (
			error?.message?.includes(
				"request to https://sessionserver.mojang.com/session/minecraft/join failed",
			)
		) {
			this.sendStatus(4);
			await this.kill(1902);
		} else if (error?.message?.includes("read ECONNRESET")) {
			this.sendStatus(4);
			await this.kill(1903);
		}
		console.log("[ERROR]name:\n" + error.name);
		console.log("[ERROR]msg:\n" + error.message);
		console.log("[ERROR]code:\n" + error.code);
		this.logger(true, "ERROR", this.profileName, error + "\n" + error.stack);
		await this.kill(1000);
	}

	async handleKicked(reason, loggedIn) {
		this.logger(
			true,
			"WARN",
			this.profileName,
			`${loggedIn}, kick reason ${reason}`,
		);
		if (reason.includes("The proxy server is restarting")) {
			this.sendReloadCd(120_000);
			this.sendStatus(100);
			await this.kill(10);
		}
		await this.kill(1000);
	}

	async kill(code = 9) {
		this.bot.end();
		this.process.exit(code);
	}

	handleTabHeader(data) {
		const tabMsg = new this.ChatMessage(JSON.parse(data.header));
		const tabData = tabMsg.toString();
		const serverData = this.regexes.serverRegex.exec(tabData);
		if (serverData != null && serverData.length > 0)
			this.botInfo.server = parseInt(serverData[1]);
	}

	handleScoreboard(data) {
		if (!data?.itemsMap) return;

		Object.values(data.itemsMap).forEach((item) => {
			const text = item.displayName?.text || "";
			const emeraldMatch = text.match(this.regexes.SBemeraldRegex);
			if (emeraldMatch) {
				this.botInfo.balance = parseInt(emeraldMatch[1].replace(/,/g, ""));
			}

			const coinMatch = text.match(this.regexes.SBcoinRegex);
			if (coinMatch) {
				this.botInfo.coin = parseInt(coinMatch[1].replace(/,/g, ""));
			}
		});
		this.botInfo.tabUpdateTime = new Date();
	}

	registerProcessHandlers() {
		this.process.on("uncaughtException", async (err) => {
			this.logger(true, "ERROR", this.profileName, err + "\n" + err.stack);
			this.kill(70);
		});
		this.process.on("message", async (message) => {
			await this.handleProcessMessage(message);
		});
	}

	async handleProcessMessage(message) {
		switch (message.type) {
			case "init":
				this.config = message.config;
				break;
			case "dataRequire": {
				const dataRequireData = {
					name: this.bot.username,
					server: this.botInfo.server,
					coin: this.botInfo.coin,
					balance: this.botInfo.balance,
					position: this.bot.entity.position,
					tasks: this.taskManager.tasks,
					runingTask: this.taskManager.tasking,
				};
				this.process.send({ type: "dataToParent", value: dataRequireData });
				break;
			}
			case "cmd": {
				const args = message.text.slice(1).split(" ");
				const command = this.taskManager.isTask(args);
				if (command) {
					const task = new Task(
						this.taskManager.defaultPriority,
						command.name,
						"console",
						args,
						undefined,
						undefined,
						undefined,
						undefined,
					);
					this.taskManager.assign(task, command.longRunning);
				} else {
					console.log("無效的指令 輸入.help 查看幫助 若要轉發消息使用 .say <text>");
				}
				break;
			}
			case "chat":
				try {
					this.bot.chat(message.text);
					console.log(`訊息已由 ${this.bot.username} 送出: ${message.text}`);
				} catch (e) {
					this.logger(
						false,
						"ERROR",
						this.profileName,
						"訊息發送失敗 try again",
					);
				}
				break;
			case "reload":
				this.sendStatus(3002);
				await this.kill(75);
				break;
			case "exit":
				this.sendStatus(0);
				await this.kill(0);
				break;
			default:
				console.log("message from parent:", message);
		}
	}
}

module.exports = GeneralBot;
