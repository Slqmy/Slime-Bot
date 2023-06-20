import {MongooseEvent} from "types";
import chalk from "chalk";

const {red, bold} = chalk;

export const disconnected: MongooseEvent = {
	execute() {
		console.log(red(`\n${bold("[Database Status]")} Disconnected.\n`));
	},
};
