import {Event} from "types";

export const messageDeleteBulk: Event<"messageDeleteBulk"> = {
	async execute(client, messages) {
		for await (const message of messages) {
			client.emit("messageDelete", message[1]);
		}
	},
};
