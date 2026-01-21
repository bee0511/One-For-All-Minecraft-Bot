if (!process.argv[2]) {
	return;
}

const fs = require("fs");
const fsp = require("fs").promises;
const mineflayer = require("mineflayer");
const registry = require("prismarine-registry")("1.18.2");
const ChatMessage = require("prismarine-chat")(registry);
const profiles = require(`${process.cwd()}/profiles.json`);

const mapart = require("../../mapart");
const { logger } = require("../../logger");
const basicCommandsModule = require("../../commands/basic");
const GeneralBot = require("../../services/bot/GeneralBot");

const debug = process.argv.includes("--debug");
const enableChat = process.argv.includes("--chat");

const serverRegex = /分流(\d+)/g;
const emeraldRegex = /綠寶石餘額 : ([\d,]+)/g;
const coinRegex = /村民錠餘額 : ([\d,]+)/g;
const SBserverRegex = /分流(\d+)/;
const SBemeraldRegex = /綠寶石.*?(\d+(?:,\d+)*)元/;
const SBcoinRegex = /村民錠.*?(\d+(?:,\d+)*)個.*?每個.*?(\d+(?:,\d+)*)元/;

const generalBot = new GeneralBot({
	profileName: process.argv[2],
	botType: process.argv[3],
	debug,
	enableChat,
	process,
	fs,
	fsp,
	mineflayer,
	logger,
	profiles,
	commands: [mapart],
	basicCommandsModule,
	chatMessageClass: ChatMessage,
	regexes: {
		serverRegex,
		emeraldRegex,
		coinRegex,
		SBserverRegex,
		SBemeraldRegex,
		SBcoinRegex,
	},
});

generalBot.start();
