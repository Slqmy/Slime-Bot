import {ClientEvent, MongooseDocument} from "types";
import GuildDataSchema, {
	IGuildDataSchema,
} from "../../../schemas/GuildDataSchema.js";

export const guildMemberRemove: ClientEvent<"guildMemberRemove"> = {
	async execute(_client, member) {
		const {guild} = member;

		const guildData = (await GuildDataSchema.findOne({
			id: guild.id,
		})) as MongooseDocument<IGuildDataSchema>;

		for (const key in guildData.userExperienceData) {
			if (key === member.id) delete guildData.userExperienceData[key];
		}
	},
};
