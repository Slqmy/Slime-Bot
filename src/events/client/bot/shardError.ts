import {ClientEvent} from "types";
import chalk from "chalk";

const {redBright, bold} = chalk;

export const debug: ClientEvent<"shardError"> = {
	async execute(_client, error) {
		console.log(redBright(`\n${bold("[Shard Error]")} ${error.name}`));
		console.error(error);
		console.log();
	},
};
