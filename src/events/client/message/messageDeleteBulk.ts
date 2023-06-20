import {ClientEvent} from "types";

export const messageDeleteBulk: ClientEvent<"messageDeleteBulk"> = {
	async execute(client, messages) {
		for await (const message of messages) {
			client.emit("messageDelete", message[1]);
		}
	},
};
