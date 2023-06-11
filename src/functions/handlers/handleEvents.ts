import {BotClient, Event, MongoEvent, ProcessEvent} from "types";
import {ClientEvents} from "discord.js";
import {loopFolders} from "../../utility.js";
import mongoose from "mongoose";

const {connection} = mongoose;

export default (client: BotClient) => {
	client.handleEvents = async () => {
		await loopFolders("events/client", (event, filePath) => {
			const typedEvent = event as Event<keyof ClientEvents>;
			const eventName = /\w+(?=\.js)/.exec(filePath)?.[0] as keyof ClientEvents;

			if (typedEvent.once) {
				client.once(
					eventName,
					(...args) => typedEvent.execute(client, ...args) as Promise<void>,
				);
			} else {
				client.on(
					eventName,
					(...args) => typedEvent.execute(client, ...args) as Promise<void>,
				);
			}
		});

		await loopFolders("events/process", (event, filePath) => {
			const typedEvent = event as ProcessEvent;
			const eventName = /\w+(?=\.js)/.exec(filePath)?.[0] as string;

			if (typedEvent.once) {
				process.once(eventName, typedEvent.execute);
			} else {
				process.on(eventName, typedEvent.execute);
			}
		});

		await loopFolders("events/mongo", (event, filePath) => {
			const typedEvent = event as MongoEvent;
			const eventName = /\w+(?=\.js)/.exec(filePath)?.[0] as string;

			if (typedEvent.once) {
				connection.once(eventName, typedEvent.execute);
			} else {
				connection.on(eventName, typedEvent.execute);
			}
		});
	};
};
