import {Emojis, ImageURLs} from "../../utility.js";
import {BotClient} from "types";
import GuildDataSchema from "../../schemas/GuildDataSchema.js";
import Parser from "rss-parser";
import {AttachmentBuilder, TextChannel} from "discord.js";

const parser = new Parser();

export default (client: BotClient) => {
	client.checkUploads = async () => {
		const guilds = await GuildDataSchema.find();

		for (const guildData of guilds) {
			const {settings} = guildData;

			if (settings?.youtube?.channels.length && !settings?.youtube?.disabled) {
				let index = 0;
				for (const channel of settings.youtube.channels) {
					const channelData = await parser.parseURL(
						`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.youtubeChannelID}`,
					);

					const channelPage = await fetch(
						`https://www.youtube.com/channel/${channel.youtubeChannelID}`,
					);

					const channelPageHTML = await channelPage.text();

					const channelProfilePictureURLs = channelPageHTML.match(
						/(?<=\{"url":"https:\/\/yt3\.googleusercontent\.com\/)(ytc\/)?[a-zA-Z_=\d-]+(?=","width":\d+,"height":\d+\})/g,
					);

					const channelProfilePictureURL =
						channelProfilePictureURLs?.[channelProfilePictureURLs?.length - 1];

					const latestVideoID = channelData.items[0].id.slice(9);

					if (channel.latestVideoID !== latestVideoID) {
						settings.youtube.channels[index].latestVideoID = latestVideoID;

						const discordGuild = await client.guilds.fetch(guildData.id);

						// When the owner or an admin adds a channel, the bot would have checked that the channel is not of type CategoryChannel or type ForumChannel.
						// That means that the assertion that the channel is of type TextChannel is safe.
						const discordChannel = (await discordGuild.channels.fetch(
							channel.discordChannelID,
						)) as TextChannel;

						const {title, link, author, isoDate} = channelData.items[0];
						const {pingRoleID} = channel;

						await discordChannel.send({
							content: `${Emojis.YouTubeLogo} ${
								pingRoleID
									? pingRoleID === "everyone"
										? "@everyone "
										: `<@&${pingRoleID}> `
									: ""
							}**${author}** has uploaded a new video!`,
							embeds: [
								{
									title,
									url: link,
									color: 0xff0000,
									timestamp: isoDate,
									image: {
										url: `https://img.youtube.com/vi/${latestVideoID}/maxresdefault.jpg`,
									},
									author: {
										name: author,
										icon_url: `https://yt3.googleusercontent.com/${channelProfilePictureURL}`,
										url: `${channelData.link}/?sub_confirmation=1`,
									},
									footer: {
										text: "YouTube",
										icon_url: `attachment://YouTube-Logo.png`,
									},
								},
							],
							files: [
								new AttachmentBuilder(
									"./images/png/standard/emojis/YouTube-Logo.png",
									{name: "YouTube-Logo.png"},
								),
							],
						});
					}

					index++;
				}

				await GuildDataSchema.updateOne({id: guildData.id}, guildData);
			}
		}
	};
};
