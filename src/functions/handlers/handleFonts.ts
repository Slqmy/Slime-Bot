import {BotClient} from "types";
import {loopFolders} from "../../utility.js";
import {registerFont} from "canvas";

export default (client: BotClient) => {
	client.handleFonts = async () =>
		loopFolders("../fonts", (_exports, fontName, fontFilePath) =>
			registerFont(fontFilePath.slice(3), {family: fontName}),
		);
};
