import {BotClient} from "types";
import {Emojis} from "../../utility.js";
import GuildSettingsSchema from "../../schemas/GuildSettingsSchema.js";
import Parser from "rss-parser";
import {TextChannel} from "discord.js";

const parser = new Parser();

export default (client: BotClient) => {
	client.checkUploads = async () => {
		const guilds = await GuildSettingsSchema.find();

		for (const guild of guilds) {
			if (guild.youtube?.channels.length) {
				let index = 0;
				for (const channel of guild.youtube.channels) {
					const channelData = await parser.parseURL(
						`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.youtubeChannelID}`,
					);

					const channelPage = await fetch(
						`https://www.youtube.com/channel/${channel.youtubeChannelID}`,
					);

					const channelPageHTML = await channelPage.text();

					const channelProfilePictureURLs = channelPageHTML.match(
						/(?<=\{"url":"https:\/\/yt3\.googleusercontent\.com\/)(ytc\/)?[a-zA-Z_=0-9-]+(?=","width":\d+,"height":\d+\})/g,
					);

					const channelProfilePictureURL =
						channelProfilePictureURLs?.[channelProfilePictureURLs?.length - 1];

					const latestVideoID = channelData.items[0].id.slice(9);

					if (channel.latestVideoID !== latestVideoID) {
						guild.youtube.channels[index].latestVideoID = latestVideoID;

						const discordGuild = await client.guilds.fetch(guild.id);

						// When the owner or an admin adds a channel, the bot would have checked that the channel is not of type CategoryChannel or type ForumChannel.
						// That means that the assertion that the channel is of type TextChannel is safe.
						const discordChannel = (await discordGuild.channels.fetch(
							channel.discordChannelID as string,
						)) as TextChannel;

						const {title, link, author, isoDate} = channelData.items[0];
						const {pingRoleID} = channel;

						await discordChannel.send({
							content: `<:_:${Emojis.YouTubeLogo}> ${
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
										icon_url:
											"https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1024px-YouTube_full-color_icon_%282017%29.svg.png",
									},
								},
							],
						});
					}
					index++;
				}

				await GuildSettingsSchema.updateOne(
					{id: guild.id},
					{youtube: guild.youtube},
				);
			}
		}
	};
};
