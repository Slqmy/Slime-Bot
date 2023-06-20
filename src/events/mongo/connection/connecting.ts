import {MongooseEvent} from "types";
import chalk from "chalk";

const {cyan, bold} = chalk;

export const connecting: MongooseEvent = {
	execute() {
		console.log(cyan(`\n${bold("[Database Status]")} Connecting...\n`));
	},
};
