class CommandResolver {
	constructor({ commandGroups = [], basicCommands = [] } = {}) {
		this.commandGroups = commandGroups;
		this.basicCommands = basicCommands;
	}

	setCommandGroups(commandGroups) {
		this.commandGroups = commandGroups || [];
	}

	setBasicCommands(basicCommands) {
		this.basicCommands = basicCommands || [];
	}

	resolve(args) {
		if (!Array.isArray(args) || args.length === 0) return null;
		let result;
		for (let index = 0; index < this.commandGroups.length && !result; index++) {
			const commandGroup = this.commandGroups[index];
			if (!commandGroup?.identifiers?.includes(args[0])) continue;
			for (
				let commandIndex = 0;
				commandIndex < commandGroup.commands.length && !result;
				commandIndex++
			) {
				const subCommandKey = args.slice(1, args.length)[0];
				if (
					commandGroup.commands[commandIndex].identifiers.includes(
						subCommandKey,
					)
				) {
					result = commandGroup.commands[commandIndex];
				}
			}
			if (!result) {
				result = commandGroup.commandHelper;
			}
		}
		if (!result) {
			for (
				let commandIndex = 0;
				commandIndex < this.basicCommands.length && !result;
				commandIndex++
			) {
				if (this.basicCommands[commandIndex].identifiers.includes(args[0])) {
					result = this.basicCommands[commandIndex];
				}
			}
		}
		return result || null;
	}
}

module.exports = CommandResolver;
