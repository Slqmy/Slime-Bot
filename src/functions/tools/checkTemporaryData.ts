import {Message, TextChannel} from "discord.js";
import {BotClient} from "../../types";
import {PollMessage} from "../../utility.js";
import TemporaryDataSchema from "../../schemas/TemporaryDataSchema.js";

export default (client: BotClient) => {
	client.checkTemporaryData = async () => {
		const tempArray = await TemporaryDataSchema.find();

		for (const temporary of tempArray) {
			if (
				Date.now() - (temporary.creationDate as number) >
				temporary.lifeSpan
			) {
				await TemporaryDataSchema.deleteOne({_id: temporary._id});

				// More types of temporary data will possibly be used in the future
				switch (temporary.type) {
					case "poll":
						await client.channels
							.fetch(temporary.data.channel as string)
							.then((channel) =>
								(channel as TextChannel)?.messages
									?.fetch(temporary.data.message as string)
									.then(async (message: Message) => {
										await message.edit(
											await new PollMessage().create({message}, client),
										);
									}),
							);
						break;
				}
			}
		}
	};
};
