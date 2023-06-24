import {BotClient} from "types";
import {loopFolders} from "../../utility.js";
import {registerFont} from "canvas";

export default (client: BotClient) => {
	client.handleFonts = async () =>
		// The two trailing periods and slash at the start of the file path are necessary, as by default the loopFolders function starts in the src directory, so the function needs to go one layer out.
		// Exports is actually of type "never", as files for fonts (those ending with ".otf", ".ttf", and possibly other font file extensions) obviously don't have any exports. Exports isn't used here anyway, so the parameter should be ignored.
		loopFolders("../fonts", (_exports, fontName, fontFilePath) =>
			// The fontFilePath variable is sliced to get rid of the trailing periods and slash of "../fonts".
			// This is necessary as the file path is treated as if it starts from the root of the project folder.
			// The name of the font file is used as the font family.
			registerFont(fontFilePath.slice(8), {family: fontName}),
		);
};
