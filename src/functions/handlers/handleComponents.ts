import {BotClient, Button, Modal, SelectMenu} from "types";
import {loopFolders} from "../../utility.js";

export default (client: BotClient) => {
	client.handleComponents = async () => {
		const {buttons, selectMenus, modals} = client;

		await loopFolders("components/buttons", (button, customID) => {
			const typedButton = button as Button;

			buttons.set(customID, typedButton);
		});

		await loopFolders("components/selectMenus", (menu, customID) => {
			const typedMenu = menu as SelectMenu;

			selectMenus.set(customID, typedMenu);
		});

		await loopFolders("components/modals", (modal, customID) => {
			const typedModal = modal as Modal;

			modals.set(customID, typedModal);
		});
	};
};
