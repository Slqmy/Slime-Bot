import {Message, TextChannel} from "discord.js";
import {BotClient} from "../../types";
import {PollMessageBuilder} from "../../utility.js";
import temporaryDataSchema from "../../schemas/temporaryDataSchema.js";

export default (client: BotClient) => {
	client.checkTemporaryData = async () => {
		const tempArray = await temporaryDataSchema.find();

		for (const temporary of tempArray) {
			if (
				Date.now() - (temporary.creationDate as number) >
				(temporary.lifeSpan as number)
			) {
				await temporaryDataSchema.deleteOne({_id: temporary._id});

				// More types of temporary data will possibly be used in the future
				switch (temporary.type) {
					case "poll":
						await client.channels
							.fetch(temporary.data.channel)
							.then((channel) =>
								(channel as TextChannel)?.messages
									?.fetch(temporary.data.message)
									.then(async (message: Message) => {
										await message.edit(
											await new PollMessageBuilder().create({message}, client),
										);
									}),
							);
						break;
				}
			}
		}
	};
};
