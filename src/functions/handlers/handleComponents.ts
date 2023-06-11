import {BotClient, Button, Modal, SelectMenu} from "types";
import {loopFolders} from "../../utility.js";

export default (client: BotClient) => {
	client.handleComponents = async () => {
		const {buttons, selectMenus, modals} = client;

		await loopFolders("components/buttons", (button) => {
			const typedButton = button as Button;

			buttons.set(typedButton.name, typedButton);
		});

		await loopFolders("components/selectMenus", (menu) => {
			const typedMenu = menu as SelectMenu;

			selectMenus.set(typedMenu.name, typedMenu);
		});

		await loopFolders("components/modals", (modal) => {
			const typedModal = modal as Modal;

			modals.set(typedModal.name, typedModal);
		});
	};
};
