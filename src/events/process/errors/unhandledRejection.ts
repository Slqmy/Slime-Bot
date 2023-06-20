import {ProcessEvent} from "types";
import chalk from "chalk";

const {redBright, bold} = chalk;

export const unhandledRejection: ProcessEvent = {
	execute(...args) {
		console.log(redBright(`\n${bold("[Error]")} Unhandled Rejection`));
		console.error("Unhandled Rejection:", ...args);
		console.log();
	},
};
