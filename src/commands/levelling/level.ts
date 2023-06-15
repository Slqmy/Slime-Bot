import {AttachmentBuilder, SlashCommandBuilder} from "discord.js";
import {Image, createCanvas} from "canvas";
import {Command} from "types";
import {ErrorMessage} from "../../utility.js";
import UserDataSchema from "../../schemas/UserDataSchema.js";

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
	async execute(interaction, client) {
		const {options, guildId} = interaction;

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

		if (!userData.experience?.[guildId]) {
			return interaction.reply(
				new ErrorMessage("This user has no experience in this guild!"),
			);
		}

		const levelCard = new Image();
		levelCard.src = "../../../images/level-card.png";

		// Matches the level card dimensions.
		const canvas = createCanvas(934, 282);
		const context = canvas.getContext("2d");

		context.drawImage(levelCard, 0, 0);

		const attachment = new AttachmentBuilder(canvas.toBuffer(), {
			name: `level-card-${user.tag}-${Date.now()}`,
		});

		await interaction.reply({
			files: [attachment],
		});
	},
};
