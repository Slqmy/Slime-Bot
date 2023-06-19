import {BotClient, MongooseDocument} from "../../types";
import {Message, TextChannel} from "discord.js";
import TemporaryDataSchema, {
	ITemporaryDataSchema,
} from "../../schemas/TemporaryDataSchema.js";
import {PollMessage} from "../../utility.js";

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
				if (temporary.type === "poll") {
					const typedTemporaryData = temporary as MongooseDocument<
						ITemporaryDataSchema<{channelID: string; messageID: string}>
					>;

					await client.channels
						.fetch(typedTemporaryData.data.channelID)
						.then((channel) =>
							(channel as TextChannel | null)?.messages
								?.fetch(typedTemporaryData.data.messageID)
								.then(async (message: Message) => {
									await message.edit(
										await new PollMessage().create({message}, client),
									);
								}),
						);
				}
			}
		}
	};
};
