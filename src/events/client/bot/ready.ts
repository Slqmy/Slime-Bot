import {ClientEvent} from "types";
import chalk from "chalk";

const {bold, whiteBright, greenBright} = chalk;

export const ready: ClientEvent<"ready"> = {
	once: true,
	async execute(client) {
		client.onlineTimestamp = Date.now();

		console.log(
			whiteBright(
				`\n${bold("[Client]")} Ready! Online and logged in as ${greenBright(
					client.user.username,
				)}.\n`,
			),
		);

		console.log(
			whiteBright(
				`\n${bold("[Client]")} Currently in ${bold(
					client.guilds.cache.size,
				)} guilds.\n`,
			),
		);

		await client.checkUploads();
		setInterval(client.checkUploads, 60000);

		await client.checkTemporaryData();
		setInterval(client.checkTemporaryData, 10000);
	},
};
