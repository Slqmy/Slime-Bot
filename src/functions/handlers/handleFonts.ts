import {BotClient} from "types";
import chalk from "chalk";
import {loopFolders} from "../../utility.js";
import {registerFont} from "canvas";

const {bold, redBright} = chalk;

export default (client: BotClient) => {
	client.handleFonts = async () =>
		loopFolders("../fonts", (_font, fontPath) => {
			const fontName = /[a-z ]+(?=\..+)/i.exec(fontPath)?.[0];

			if (!fontName) {
				console.log(
					redBright(`\n${bold("[Fonts]")} Invalid Font Name: ${fontPath}.\n`),
				);
			} else {
				registerFont(fontPath.replace(/^\.\/\./, ""), {family: fontName});
			}
		});
};
