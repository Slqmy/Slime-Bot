import {ClientEvent} from "types";
import chalk from "chalk";

const {yellowBright, bold} = chalk;

export const debug: ClientEvent<"warn"> = {
	async execute(_client, message) {
		console.log(yellowBright(`\n${bold("[Warning]")}`));
		console.warn(message);
		console.log();
	},
};
