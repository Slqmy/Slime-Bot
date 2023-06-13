import {BotClient} from "types";
import chalk from "chalk";
import {loopFolders} from "../../utility.js";
import {registerFont} from "canvas";

const {bold, redBright} = chalk;

export default (client: BotClient) => {
	client.handleFonts = async () =>
		loopFolders("../fonts", (_exports, fontFilePath) => {
			const fontName = /[a-z ]+(?=\..+)/i.exec(fontFilePath)?.[0];

			if (!fontName) {
				console.log(
					redBright(
						`\n${bold("[Fonts]")} Invalid Font Name: ${fontFilePath}.\n`,
					),
				);
			} else {
				registerFont(fontFilePath.replace(/^\.\/\./, ""), {family: fontName});
			}
		});
};
