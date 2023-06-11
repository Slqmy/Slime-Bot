import {Schema, model} from "mongoose";

const GuildSettingsSchema = new Schema({
	id: String,
	youtube: {
		channels: [
			{
				youtubeChannelID: String,
				youtubeChannelProfilePictureURL: String,
				latestVideoID: String,
				discordChannelID: String,
				pingRoleID: String,
			},
		],
	},
	starboard: {
		channels: [
			{
				channelID: String,
				pingRoleID: String,
				emojiID: String,
				// While the "emoji ID" technically isn't an ID in all cases, it's still more clear to call the variable 'emojiID' rather than 'emojiIDOrName', and simply calling it 'emoji' could cause some confusion.
				emojiCount: Number,
				starredMessageIDs: {
					type: Object,
					of: String,
				},
			},
		],
	},
	counting: {
		channels: [{channelID: String, count: Number, latestCountAuthorID: String}],
	},
});

export default model("Guild Settings", GuildSettingsSchema, "Guild Settings");
