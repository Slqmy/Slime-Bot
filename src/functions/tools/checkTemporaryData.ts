import {Message, TextChannel} from "discord.js";
import {BotClient} from "../../types";
import {PollMessageBuilder} from "../../utility.js";
import TemporaryDataSchema from "../../schemas/TemporaryDataSchema.js";

export default (client: BotClient) => {
	client.checkTemporaryData = async () => {
		const tempArray = await TemporaryDataSchema.find();

		for (const temporary of tempArray) {
			if (
				Date.now() - (temporary.creationDate as number) >
				(temporary.lifeSpan as number)
			) {
				await TemporaryDataSchema.deleteOne({_id: temporary._id});

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
