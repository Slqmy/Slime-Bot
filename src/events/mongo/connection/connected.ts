import {MongooseEvent} from "types";
import chalk from "chalk";

const {green, bold} = chalk;

export const connected: MongooseEvent = {
	execute() {
		console.log(green(`\n${bold("[Database Status]")} Connected.\n`));
	},
};
