import {BotClient, Command} from "types";
import {REST} from "@discordjs/rest";
import {Routes} from "discord.js";
import {loopFolders} from "../../utility.js";

export default (client: BotClient) => {
	client.handleCommands = async () => {
		let {commandArray} = client;
		const {commands} = client;

		await loopFolders("commands", (command) => {
			const typedCommand = command as Command;

			commandArray.push(typedCommand.data);
			commands.set(typedCommand.data.name, typedCommand);
		});

		// Filter out duplicate commands.
		commandArray = commandArray.filter(
			(command, index) =>
				commandArray
					.map((commandData) => commandData.name)
					.indexOf(command.name) === index,
		);

		const rest = new REST({version: "9"}).setToken(
			process.env.discordBotToken as string,
		);

		await rest.put(
			Routes.applicationCommands(process.env.discordApplicationID as string),
			{
				body: process.env.clearCommands ? [] : commandArray,
			},
		);
	};
};
