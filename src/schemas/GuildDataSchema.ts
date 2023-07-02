import mongoose, {Schema, model} from "mongoose";

export interface IGuildDataSchema {
	_id: mongoose.Types.ObjectId;
	id: string;
	settings?: {
		youtube?: {
			disabled?: boolean;
			channels: {
				youtubeChannelID: string;
				latestVideoID: string;
				discordChannelID: string;
				pingRoleID?: string;
			}[];
		};
		starboard?: {
			disabled?: boolean;
			channels: {
				channelID: string;
				pingRoleID?: string;
				emoji?: string;
				emojiCount?: number;
				starredMessageIDs?: {[key: string]: string};
			}[];
		};
		counting?: {
			disabled?: boolean;
			channels: {
				channelID: string;
				count?: number;
				latestCountAuthorID?: string;
			}[];
		};
		levelling?: {
			disabled?: boolean;
			// The minimum and maximum number of XP that a user can get from a message.
			minMessageXP?: number;
			maxMessageXP?: number;
			// The amount of time (in seconds) that a user needs to wait before being able to gain experience from sending messages again.
			coolDown?: number;
			// Different XP bonuses that the user can receive from a message.
			punctuationBonus?: number; // Default: 1
			characterBonus?: number; // Default: 0.1
			sentenceBonus?: number; // Default: 2
			lineBonus?: number; // Default: 3
			paragraphBonus?: number; // Default: 4
			wordBonus?: number; // Default: 0.1
			linkBonus?: number; // Default: 1
			attachmentBonus?: number; // Default: 3
			// Minimum and maximum random XP.
			minRandomXP?: number; // Default: 5
			maxRandomXP?: number; // Default: 10
		};
	};
	userExperienceData?: {
		[key: string]: {
			experience: number;
			// There could be no last message timestamp, specifically for users who haven't sent any messages yet.
			lastMessageTimestamp?: number;
		};
	};
	statisticsChannels?: {
		[key: string]: {type: string; extraData?: unknown};
	};
}

const GuildDataSchema = new Schema<IGuildDataSchema>({
	_id: mongoose.Types.ObjectId,
	id: {type: String, required: true},
	settings: {
		youtube: {
			disabled: Boolean,
			channels: [
				{
					youtubeChannelID: {type: String, required: true},
					latestVideoID: {type: String, required: true},
					discordChannelID: {type: String, required: true},
					pingRoleID: String, // There may be no ping role.
				},
			],
		},
		starboard: {
			disabled: Boolean,
			channels: [
				{
					channelID: {type: String, required: true},
					pingRoleID: String, // There may be no ping role.
					emoji: {type: String}, // Default: "⭐"
					emojiCount: {type: Number}, // Default: 3
					starredMessageIDs: {
						type: Object,
						of: {type: String, required: true},
					}, // There may be no starred messages.
				},
			],
		},
		counting: {
			disabled: Boolean,
			channels: [
				{
					channelID: {type: String, required: true},
					count: Number, // Default: 0
					// There may be no latest count (the counting channel has just been set up).
					latestCountAuthorID: String,
				},
			],
		},
		levelling: {
			disabled: Boolean,
			// The minimum and maximum number of XP that a user can get from a message.
			minMessageXP: Number,
			maxMessageXP: Number,
			// The amount of time (in seconds) that a user needs to wait before being able to gain experience from sending messages again.
			coolDown: Number,
			// Different XP bonuses that the user can receive from a message.
			punctuationBonus: Number, // Default: 1
			characterBonus: Number, // Default: 0.1
			sentenceBonus: Number, // Default: 2
			lineBonus: Number, // Default: 3
			paragraphBonus: Number, // Default: 4
			wordBonus: Number, // Default: 0.1
			linkBonus: Number, // Default: 1
			attachmentBonus: Number, // Default: 3
			// Minimum and maximum random XP.
			minRandomXP: Number, // Default: 5
			maxRandomXP: Number, // Default: 10
		},
	},
	userExperienceData: {
		type: Object,
		of: {
			type: {
				experience: {type: Number, required: true},
				lastMessageTimestamp: {type: Number},
			},
			required: true,
		},
	},
	statisticsChannels: {
		type: Object,
		of: {type: {type: String, required: true}, extraData: Schema.Types.Mixed},
	},
});

export default model("Guild Settings", GuildDataSchema, "Guild Settings");
