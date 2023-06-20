import {MongooseError} from "mongoose";
import {MongooseEvent} from "types";
import chalk from "chalk";

const {bold, redBright} = chalk;

export const err: MongooseEvent = {
	execute(error: MongooseError) {
		console.log(redBright(`\n${bold("[Database Status]")} ${error.name}`));
		console.error(error);
		console.log();
	},
};
