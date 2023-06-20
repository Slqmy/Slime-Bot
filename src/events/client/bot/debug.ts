import {ClientEvent} from "types";
import chalk from "chalk";

const {yellow, bold} = chalk;

export const debug: ClientEvent<"debug"> = {
	async execute(_client, message) {
		if (process.env.debug) console.log(yellow(`${bold("[Debug]")} ${message}`));
	},
};
