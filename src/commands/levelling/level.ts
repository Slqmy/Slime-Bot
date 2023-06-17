import {AttachmentBuilder, Guild, SlashCommandBuilder} from "discord.js";
import {DisplayAvatarURLOptions, ErrorMessage} from "../../utility.js";
import {Command} from "types";
import Decimal from "decimal.js";
import UserDataSchema from "../../schemas/UserDataSchema.js";
import canvacord from "canvacord";

export const level: Command = {
	data: new SlashCommandBuilder()
		.setName("level")
		.setDescription("⏫ Check your, or another user's level.")
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

		const userData = await UserDataSchema.findOne({id: user.id});

		if (!userData) {
			return interaction.reply(
				new ErrorMessage("There is no data for this user!"),
			);
		}

		const userExperience = userData.experience?.[guildId]?.experience ?? 0;
		const userLevel = new Decimal(-1.5)
			.plus(new Decimal(userExperience).plus(56.25).sqrt().dividedBy(5))
			.floor()
			.toNumber();

		const userLevelRequiredXP = 25 * userLevel ** 2 + 75 * userLevel;
		const nextLevelRequiredXP =
			25 * (userLevel + 1) ** 2 + 75 * (userLevel + 1);

		const currentLevelProgress =
			(userData.experience?.[guildId]?.experience ?? 0) - userLevelRequiredXP;

		const userAvatar = user.displayAvatarURL(DisplayAvatarURLOptions);

		const guildMember = await (guild as Guild).members.fetch(user.id);

		const levelCard = await new canvacord.Rank()
			.setAvatar(userAvatar)
			.setLevel(userLevel)
			.setCurrentXP(currentLevelProgress)
			.setRequiredXP(nextLevelRequiredXP - userLevelRequiredXP)
			.setStatus(guildMember.presence?.status ?? "online")
			.setProgressBar("#10df50", "COLOR")
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
