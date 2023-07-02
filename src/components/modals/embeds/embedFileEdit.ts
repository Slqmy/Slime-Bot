import {ErrorMessage, EmbedFileMessageBuilder} from "../../../classes.js";
import EmbedSchema from "../../../schemas/EmbedSchema.js";

export default {
	data: {
		name: "embedFileEdit",
	},
	async execute(interaction, client) {
		const input = interaction.fields.getTextInputValue("name");

		const count = parseInt(
			interaction.message.embeds[0].data.footer.text.match(/\d+/)[0],
		);

		const embedProfile = await EmbedSchema.findOne({
			author: interaction.user.id,
			customID: count,
		});
		let index = -1;
		for (const file of embedProfile.files.map((e) => e.name)) {
			const reg = new RegExp(input, "ig");
			if (reg.test(file)) {
				index = embedProfile.files.map((e) => e.name).indexOf(file);
				break;
			}
		}

		if (index !== -1) {
			await interaction.deferUpdate();
			await interaction.message.edit(
				new EmbedFileMessageBuilder(embedProfile, index, client),
			);
		} else {
			await interaction.reply(new ErrorMessage("File not found."));
		}
	},
};
