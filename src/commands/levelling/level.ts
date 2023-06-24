import {AttachmentBuilder, Guild, SlashCommandBuilder} from "discord.js";
import {
	ColourHexStrings,
	DisplayAvatarURLOptions,
	ErrorMessage,
	experienceToLevel,
	levelToExperience,
} from "../../utility.js";
import {Command} from "types";
import GuildDataSchema from "../../schemas/GuildDataSchema.js";
import canvacord from "canvacord";

export const level: Command = {
	data: new SlashCommandBuilder()
		.setName("level")
		.setDescription("⏫ Check your or another user's level.")
		.addUserOption((option) =>
			option
				.setName("user")
				.setDescription(
					"The user to check the level of. Leave blank to check your own level.",
				),
		),
	usage: ["", "user:the user to check the level of"],
	async execute(interaction) {
		const {options, guild, guildId} = interaction;

		if (!guildId) {
			return interaction.reply(
				new ErrorMessage("You must be in a guild to perform this command!"),
			);
		}

		const user = options.getUser("user") ?? interaction.user;

		const guildData = await GuildDataSchema.findOne({id: guildId});

		const levels = guildData?.userExperienceData;

		let levelArray: {
			userID: string;
			experience: number;
			lastMessageTimestamp?: number;
		}[] = [];

		for (const key in levels) {
			levelArray.push({userID: key, ...levels[key]});
		}

		levelArray = levelArray.sort((a, b) => b.experience - a.experience);

		const rank = levelArray.map((data) => data.userID).indexOf(user.id) + 1;

		const userExperience = levels?.[user.id]?.experience ?? 0;

		const userLevel = experienceToLevel(userExperience);

		const userLevelRequiredXP = levelToExperience(userLevel);
		const nextLevelRequiredXP = levelToExperience(userLevel + 1);

		const currentLevelProgress = userExperience - userLevelRequiredXP;

		const userAvatar = user.displayAvatarURL(DisplayAvatarURLOptions);

		const guildMember = await (guild as Guild).members.fetch(user.id);

		const levelCard = await new canvacord.Rank()
			.setAvatar(userAvatar)
			.setLevel(userLevel)
			.setCurrentXP(currentLevelProgress)
			.setRank(rank)
			.setRequiredXP(nextLevelRequiredXP - userLevelRequiredXP)
			.setStatus(guildMember.presence?.status ?? "online")
			.setProgressBar(
				[ColourHexStrings.Lime, ColourHexStrings.OceanBlue],
				"GRADIENT",
			)
			.setUsername(user.username)
			.setDiscriminator(user.discriminator)
			.build();

		const attachment = new AttachmentBuilder(levelCard, {
			name: `level-card-${user.id}-${Date.now()}.png`,
		});

		await interaction.reply({
			files: [attachment],
		});
	},
};
