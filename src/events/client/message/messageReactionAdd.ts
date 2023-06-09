import {
	APIEmbed,
	APIEmbedField,
	AttachmentBuilder,
	GuildEmoji,
	Role,
	TextChannel,
} from "discord.js";
import {ClientEvent, MongooseDocument} from "types";
import {
	Colours,
	DisplayAvatarURLOptions,
	ErrorMessage,
	PollMessage,
	URLRegExp,
	addSuffix,
	isImageLink,
} from "../../../utility.js";
import GuildDataSchema, {
	IGuildDataSchema,
} from "../../../schemas/GuildDataSchema.js";

export const messageReactionAdd: ClientEvent<"messageReactionAdd"> = {
	async execute(client, reaction, user) {
		const {message} = reaction;
		const {guild} = message;

		if (guild) {
			const guildData = (await GuildDataSchema.findOne({
				id: guild.id,
			})) as MongooseDocument<IGuildDataSchema>;

			const {settings} = guildData;

			// Checking if a new starboard message needs to be added or if one needs to be updated.
			if (
				settings?.starboard?.channels.length &&
				!settings.starboard.disabled
			) {
				const {emoji} = reaction;

				for (const channel of settings.starboard.channels) {
					if (
						// The emoji is the one of the starboard channel. (By default (AKA channel.emojiID is undefined), the starboard emoji is a star emoji ⭐)
						(emoji.id ?? emoji.name) === (channel.emoji ?? "⭐") &&
						channel.channelID !== message.channelId // The message is not in the starboard channel.
					) {
						// When the owner or an admin adds a channel, the bot would have checked that the channel is not of type CategoryChannel or type ForumChannel.
						// That means that the assertion that the channel is of type TextChannel is safe.
						const starboardChannel = (await client.channels.fetch(
							channel.channelID,
						)) as TextChannel;

						const starredMessageID = channel.starredMessageIDs?.[message.id];

						if (
							starredMessageID
							// The message has been sent already => reaction count needs to be updated.
						) {
							const starredMessage = await starboardChannel.messages.fetch(
								starredMessageID,
							);

							const {title} = starredMessage.embeds[0].data;

							// The assertion necessary because the embed needs to be edited.
							// Updating the reaction count.
							(starredMessage.embeds[0].data as APIEmbed).title =
								// It's needed to match the `>` character as simply matching `\d+` could match the emoji ID in the title.
								title?.replace(/> \d+/, `> ${reaction.count}`);

							await starredMessage.edit({
								embeds: starredMessage.embeds,
							});
						} else if (
							// Message hasn't been sent to the starboard channel => needs to be sent.
							// Both of these values are going to be numbers so the assertion is safe.
							(reaction.count as number) >= (channel.emojiCount ?? 3)
						) {
							const {
								author,
								content,
								url,
								createdTimestamp,
								attachments,
								embeds,
							} = message;
							const {emojis} = guild;

							const starboardEmoji = emoji.id
								? await emojis.fetch(emoji.id)
								: null;

							// isImageLink is shorthand syntax for (link) => isImageLink(link).
							const messageImageURLs = (content?.match(URLRegExp) ?? []).filter(
								isImageLink,
							);

							const starboardMessage: {
								content: string | undefined;
								embeds: [APIEmbed];
								files: (string | AttachmentBuilder)[];
							} = {
								content: channel.pingRoleID
									? `<@&${channel.pingRoleID}>`
									: undefined,
								embeds: [
									{
										// If emoji.id is truthy, that means that it is a string, and therefore the starboardEmoji is a GuildEmoji, since the bot checks whenever a starboard emoji is deleted.
										title: `${
											emoji.id
												? `<:${
														(starboardEmoji as GuildEmoji).animated ? "a:" : ""
												  }_:`
												: ""
										}${channel.emoji ?? "⭐"}${emoji.id ? ">" : ""} ${
											reaction.count
										} | <t:${Math.round(Date.now() / 1000)}:R> | <#${
											message.channelId
										}>`,
										description:
											`${content}\n\n[Jump to Message](${url})`.trim(),
										color: Colours.Default,
										author: {
											name: author?.username ?? "👤 Unknown",
											icon_url:
												author?.avatarURL() ??
												"attachment://Question-Mark-Icon.png",
										},
										footer: {
											text: `${client.user.username} - Message ID • Time sent at - ${message.id}`,
											icon_url: client.user.displayAvatarURL(
												DisplayAvatarURLOptions,
											),
										},
										timestamp: new Date(createdTimestamp).toISOString(),
									},
								],
								// Note: The following code matches links in the content of the message and then filters out any non-image links as they behave in a bit of a strange way.
								// This doesn't apply to message's *files* as those behave the same way as in the original message.
								files: [
									new AttachmentBuilder(
										"./images/png/standard/emojis/icons/Question-Mark-Icon.png",
										{name: "Question-Mark-Icon.png"},
									),
									...[...attachments.values()].map(
										(attachment) => attachment.url,
									),
									...messageImageURLs,
								],
							};

							let needsAttachmentBuilder = false;

							starboardMessage.embeds.push(
								...embeds
									.map((embed) => embed.data)
									// Filter out embedded image links saved from the original message.
									// There has to be a complicated statement because embed.type is deprecated.
									.filter((embed) => {
										const {thumbnail} = embed;

										if (embed.url && thumbnail?.url) {
											const {proxy_url} = thumbnail;

											const embedKeys = Object.keys(embed);
											const urlIndex = messageImageURLs.indexOf(embed.url);
											const thumbnailURLIndex = messageImageURLs.indexOf(
												thumbnail.url,
											);

											if (
												embedKeys.length === 3 &&
												// Only have to check for one of the variables if they are equal to -1 since the variables are compared either way.
												urlIndex !== -1 &&
												urlIndex === thumbnailURLIndex &&
												proxy_url ===
													`https://media.discordapp.net${
														/(?<=https:\/\/cdn.discordapp.com)[\s\S]+/.exec(
															thumbnail.url,
														)?.[0]
													}`
											) {
												return false;
											}
										}

										return true;
									})
									.map((embed: APIEmbed) => {
										if (embed.video) {
											needsAttachmentBuilder = true;

											// This conversion is safe & necessary because if the embed contains a video, it will have a thumbnail and a URL.
											embed.image = {
												url: embed.thumbnail?.url as string,
											};
											embed.footer = {
												text: `${embed.provider?.name}`,
												icon_url: "attachment://Video-Play-Icon.png",
											};
										}

										return embed;
									})
									// Make sure that the limit of embeds per message is not exceeded.
									.slice(0, 24),
							);

							if (needsAttachmentBuilder) {
								starboardMessage.files.unshift(
									new AttachmentBuilder(
										"./images/png/standard/Video-Play-Icon.png",
										{name: "Video-Play-Icon.png"},
									),
								);
							}

							starboardMessage.files = starboardMessage.files.slice(0, 25);

							const starboardChannelMessage = await starboardChannel.send(
								starboardMessage,
							);

							channel.starredMessageIDs ??= {};
							channel.starredMessageIDs[message.id] =
								starboardChannelMessage.id;
						}
					}
				}
			}

			const messageEmbed = message.embeds?.[0]?.data;

			if (
				messageEmbed?.author?.name === `${client.user.username} Poll - Ended` ||
				messageEmbed?.author?.name === `${client.user.username} Poll`
			) {
				const emojisList = (messageEmbed.description as string).match(
					/^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|🔟)/gm,
				) as RegExpMatchArray;

				const member = await guild.members.fetch(user.id);

				const userReactions = message.reactions.cache.filter(
					(reactionData) =>
						reactionData.users.cache.has(member.id) &&
						emojisList.includes(reactionData.emoji.name as string),
				);

				if (
					messageEmbed.author.name === `${client.user.username} Poll - Ended`
				) {
					for (const messageReaction of userReactions.values()) {
						if (messageReaction.emoji.name === reaction.emoji.name) {
							await messageReaction.users.remove(member.id);
						}
					}

					return member.send(new ErrorMessage("Sorry, this poll has ended."));
				}

				if (
					messageEmbed.author.name === `${client.user.username} Poll` &&
					reaction.me &&
					[...reaction.users.cache.values()].map(
						(reactionUser) => reactionUser.id,
					).length !== 1 &&
					RegExp(`^${reaction.emoji.name}.+`, "gm").test(
						messageEmbed.description as string,
					)
				) {
					const requiredRole = (
						/(`None`|(?<=<@&)\d+(?=>))/.exec(
							(messageEmbed.fields as APIEmbedField[])[1].value,
						) as RegExpMatchArray
					)[0];

					if (
						requiredRole !== "`None`" &&
						!member.roles.cache.has(requiredRole)
					) {
						for (const messageReaction of userReactions.values()) {
							await messageReaction.users.remove(member.id);
						}

						const role = guild.roles.cache.get(requiredRole) as Role;

						return member.send(
							new ErrorMessage(
								`You must have the <@&${role.id}> role to participate in this poll!`,
							),
						);
					}

					const memberReactions = [...message.reactions.cache.values()].filter(
						(messageReaction) =>
							emojisList.includes(messageReaction.emoji.name as string) &&
							messageReaction.users.cache.has(member.id),
					).length;

					const maxOptions =
						parseInt(
							(
								/(`Unlimited`|\d+)/.exec(
									(messageEmbed.fields as APIEmbedField[])[1].value,
								) as RegExpMatchArray
							)[0],
						) || 10;

					if (memberReactions > maxOptions) {
						for (const userReaction of userReactions.values()) {
							await userReaction.users.remove(member.id);
						}

						return member.send(
							new ErrorMessage(
								`You may not choose more than **${maxOptions}** option${addSuffix(
									maxOptions,
								)} for this poll!`,
							),
						);
					}

					await message.edit(await new PollMessage().create(reaction, client));
				}
			}

			await GuildDataSchema.updateOne({id: guild.id}, guildData);
		}
	},
};
