import {evaluate, isComplex, isResultSet} from "mathjs";
import {Event} from "types";
import GuildSettingsSchema from "../../../schemas/GuildSettingsSchema.js";

export const messageCreate: Event<"messageCreate"> = {
	async execute(_client, message) {
		const {guild} = message;

		if (guild) {
			const guildSettings = await GuildSettingsSchema.findOne({id: guild.id});

			if (guildSettings?.counting?.channels.length) {
				guildSettings.counting.channels.forEach((countingChannel, index) => {
					if (
						message.channelId === countingChannel.channelID &&
						!message.author.bot
					) {
						const count = countingChannel.count ?? 0;

						let evaluatedExpression;

						try {
							evaluatedExpression = evaluate(message.content);
						} catch (_error) {
							message.delete().catch(console.error);
						}

						const expressionValue = isComplex(evaluatedExpression)
							? evaluatedExpression.re
							: isResultSet(evaluatedExpression)
							? evaluatedExpression.entries[
									evaluatedExpression.entries.length - 1
							  ]
							: evaluatedExpression;

						if (
							message.author.id !== countingChannel.latestCountAuthorID &&
							expressionValue === count + 1 &&
							guildSettings.counting
						) {
							guildSettings.counting.channels[index].count = count + 1;
							guildSettings.counting.channels[index].latestCountAuthorID =
								message.author.id;
						} else message.delete().catch(console.error);
					}
				});

				await guildSettings.save();
			}
		}
	},
};
