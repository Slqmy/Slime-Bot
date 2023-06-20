import {APIEmbed, APIEmbedField, TextChannel, User} from "discord.js";
import {ClientEvent, MongooseDocument} from "types";
import GuildDataSchema, {
	IGuildDataSchema,
} from "../../../schemas/GuildDataSchema.js";
import {PollMessage} from "../../../utility.js";

export const messageReactionRemove: ClientEvent<"messageReactionRemove"> = {
	async execute(client, reaction, user) {
		const {message} = reaction;
		const {guild} = message;

		if (guild) {
			const guildData = (await GuildDataSchema.findOne({
				id: guild.id,
			})) as MongooseDocument<IGuildDataSchema>;

			const {settings} = guildData;
			const starboardChannels = settings?.starboard?.channels;

			if (starboardChannels?.length && !settings?.starboard?.disabled) {
				for (const channel of starboardChannels) {
					const starredMessageID = channel.starredMessageIDs?.[message.id];

					// Message sent in starboard channel.
					if (starredMessageID) {
						// The assertion is safe as we know that the channel exists (starboard data is deleted from the database when the starboard channel is deleted)
						// The bot also checks that the channel is a text channel when the user inputs the ID/link, therefore the channel has to be an instance of the TextChannel type.
						// channel.channelID has to be a string since the input requires that.
						const starboardChannel = (await guild.channels.fetch(
							channel.channelID,
						)) as TextChannel;

						const starredMessage = await starboardChannel.messages.fetch(
							starredMessageID,
						);

						const {title} = starredMessage.embeds[0].data;

						// Assertion necessary because the embed needs to be edited.
						// Updating the reaction count.
						(starredMessage.embeds[0].data as APIEmbed).title = (
							title as string
						).replace(/> \d+/, `> ${reaction.count}`);

						await starredMessage.edit({
							embeds: starredMessage.embeds,
						});
					}
				}
			}

			const embed = message.embeds?.[0]?.data;

			if (embed?.author?.name === `${(client.user as User).username} Poll`) {
				const member = await guild.members.fetch(user.id);

				const emojis = (embed.description as string).match(
					/^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|🔟)/gm,
				) as RegExpMatchArray;

				if (reaction.me) {
					const requiredRole = (
						/(`None`|(?<=<@&)\d+(?=>))/.exec(
							(embed.fields as APIEmbedField[])[1].value,
						) as RegExpMatchArray
					)[0];

					if (
						requiredRole === "`None`" ||
						member.roles.cache.has(requiredRole)
					) {
						const memberReactions = [
							...message.reactions.cache.values(),
						].filter(
							(messageReaction) =>
								emojis.includes(messageReaction.emoji.name as string) &&
								messageReaction.users.cache.has(member.id),
						).length;

						const maxOptions =
							parseInt(
								(
									/(`Unlimited`|\d+)/.exec(
										(embed.fields as APIEmbedField[])[1].value,
									) as RegExpMatchArray
								)[0],
							) || 10;

						if (
							memberReactions <= maxOptions &&
							emojis.includes(reaction.emoji.name as string)
						) {
							await message.edit(
								await new PollMessage().create(reaction, client),
							);
						}
					}
				}
			}
		}
	},
};
