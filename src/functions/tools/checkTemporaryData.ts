import {BotClient, MongooseDocument} from "../../types";
import {Message, TextChannel} from "discord.js";
import TemporaryDataSchema, {
	ITemporaryDataSchema,
} from "../../schemas/TemporaryDataSchema.js";
import {PollMessage} from "../../utility.js";

export default (client: BotClient) => {
	client.checkTemporaryData = async () => {
		const temporaryDataArray = await TemporaryDataSchema.find();

		for (const temporaryData of temporaryDataArray) {
			if (
				Date.now() - (temporaryData.creationDate as number) >
				temporaryData.lifeSpan
			) {
				await TemporaryDataSchema.deleteOne({_id: temporaryData._id});

				// More types of temporary data will possibly be used in the future
				switch (temporaryData.type) {
					case "poll":
						const typedTemporaryData = temporaryData as MongooseDocument<
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
						break;
				}
			}
		}
	};
};
