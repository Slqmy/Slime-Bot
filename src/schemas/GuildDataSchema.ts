import {Schema, model} from "mongoose";

const GuildDataSchema = new Schema({
	id: String,
	youtube: {
		channels: [
			{
				youtubeChannelID: {type: String, required: true},
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
	levels: {
		// The minimum and maximum number of XP that a user can get from a message.
		minMessageXP: Number,
		maxMessageXP: Number,
		// The amount of time (in seconds) that a user needs to wait before being able to gain experience from sending messages again.
		coolDown: Number,
		// Different XP bonuses that the user can receive from a message.
		punctuationBonus: Number,
		characterBonus: Number,
		sentenceBonus: Number,
		lineBonus: Number,
		paragraphBonus: Number,
		wordBonus: Number,
		linkBonus: Number,
		attachmentBonus: Number,
		// Minimum and maximum random XP.
		minRandomXP: Number,
		maxRandomXP: Number,
	},
});

export default model("Guild Settings", GuildDataSchema, "Guild Settings");
