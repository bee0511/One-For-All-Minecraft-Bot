const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

class TaskManager {
	constructor({
		logger,
		profileName,
		fs,
		fsp,
		sendStatus,
		getLogin,
		commandResolver,
		cwd,
	}) {
		this.logger = logger;
		this.profileName = profileName;
		this.fs = fs;
		this.fsp = fsp;
		this.sendStatus = sendStatus;
		this.getLogin = getLogin;
		this.commandResolver = commandResolver;
		this.cwd = cwd;

		this.tasks = [];
		this.err_tasks = [];
		this.defaultPriority = 10;
		this.tasking = false;
		this.bot = null;
	}

	setBot(bot) {
		this.bot = bot;
		if (bot) {
			bot.taskManager = this;
		}
	}

	taskSort() {
		this.tasks.sort((a, b) => {
			if (a.priority === b.priority) {
				return a.timestamp - b.timestamp;
			}
			return a.priority - b.priority;
		});
	}

	async init() {
		if (!this.bot) return;
		const taskPath = `${this.cwd()}/config/${this.profileName}/task.json`;
		if (!this.fs.existsSync(taskPath)) {
			this.save();
		} else {
			try {
				const taskData = await this.readConfig(taskPath);
				this.tasks = taskData.tasks;
				this.err_tasks = taskData.err_tasks;
			} catch (e) {
				await this.save();
			}
		}
		if (this.tasks.length !== 0 && !this.tasking) {
			this.logger(
				false,
				"INFO",
				this.profileName,
				`Found ${this.tasks.length} Task, will run at 3 second later.`,
			);
			await sleep(3000);
			await this.loop(false);
		}
	}

	isTask(args) {
		return this.commandResolver.resolve(args);
	}

	async execute(task) {
		const args = task.content;
		if (task.source === "console") task.console = this.logger;
		const command = this.commandResolver.resolve(args);
		this.logger(
			true,
			"INFO",
			this.profileName,
			`execute task ${task.displayName}`,
		);
		if (!command) {
			console.log(task);
			this.logger(
				true,
				"ERROR",
				this.profileName,
				`task ${task.displayName} not found`,
			);
			return;
		}
		await command.execute(task);
		if (command.longRunning) {
			this.logger(
				true,
				"INFO",
				this.profileName,
				`任務 ${task.displayName} \x1b[32mcompleted\x1b[0m`,
			);
		}
	}

	async assign(task, longRunning = true) {
		if (!this.bot) return;
		if (longRunning) {
			if (task.sendNotification) {
				switch (task.source) {
					case "minecraft-dm":
						this.bot.chat(
							`/m ${task.minecraftUser} Receive Task Success Add To The Queue`,
						);
						break;
					case "console":
						this.logger(
							true,
							"INFO",
							this.profileName,
							"Receive Task \x1b[33mSuccess Add To The Queue\x1b[0m",
						);
						break;
					case "discord":
						this.logger(
							true,
							"INFO",
							this.profileName,
							"Receive Task \x1b[33mSuccess Add To The Queue\x1b[0m",
						);
						break;
					default:
						break;
				}
			}
			this.tasks.push(task);
			if (this.getLogin()) await this.save();
			if (!this.tasking) await this.loop(true);
		} else {
			this.execute(task);
		}
	}

	async loop(sort = true) {
		if (this.tasking) return;
		this.tasking = true;
		this.sendStatus(3202);
		if (sort) this.taskSort();
		const currentTask = this.tasks[0];
		if (this.getLogin()) await this.save();
		await this.execute(currentTask);
		this.tasks.shift();
		if (this.getLogin()) await this.save();
		this.tasking = false;
		this.sendStatus(3201);
		if (this.tasks.length) await this.loop(true);
	}

	async save() {
		const data = {
			tasks: this.tasks,
			err_tasks: this.err_tasks,
		};
		await this.fsp.writeFile(
			`${this.cwd()}/config/${this.profileName}/task.json`,
			JSON.stringify(data, null, "\t"),
			function (err) {
				if (err) console.log("tasks save error", err);
			},
		);
	}

	async readConfig(file) {
		const rawFile = await this.fsp.readFile(file);
		const configFile = await JSON.parse(rawFile);
		return configFile;
	}
}

module.exports = TaskManager;
