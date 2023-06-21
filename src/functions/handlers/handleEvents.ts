import {BotClient, ClientEvent, MongooseEvent, ProcessEvent} from "types";
import {ClientEvents} from "discord.js";
import {loopFolders} from "../../utility.js";
import mongoose from "mongoose";

const {connection} = mongoose;

export default (client: BotClient) => {
	client.handleEvents = async () => {
		await loopFolders("events/client", (event, eventName) => {
			const typedEventName = eventName as keyof ClientEvents;
			const typedEvent = event as ClientEvent<keyof ClientEvents>;

			if (typedEvent.once) {
				client.once(
					typedEventName,
					(...args) => typedEvent.execute(client, ...args) as Promise<void>,
				);
			} else {
				client.on(
					typedEventName,
					(...args) => typedEvent.execute(client, ...args) as Promise<void>,
				);
			}
		});

		await loopFolders("events/process", (event, eventName) => {
			const typedEvent = event as ProcessEvent;

			if (typedEvent.once) {
				process.once(eventName, typedEvent.execute);
			} else {
				process.on(eventName, typedEvent.execute);
			}
		});

		await loopFolders("events/mongo", (event, eventName) => {
			const typedEvent = event as MongooseEvent;

			if (typedEvent.once) {
				connection.once(eventName, typedEvent.execute);
			} else {
				connection.on(eventName, typedEvent.execute);
			}
		});
	};
};
