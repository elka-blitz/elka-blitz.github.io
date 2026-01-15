let previous_button_map = []

export const getController = (index, renderer, onControllerConnected, onSelectStart, onSelectEnd) => {
	let controller = renderer.xr.getController(index);
	controller.addEventListener('connected', onControllerConnected);
	controller.addEventListener('selectstart', onSelectStart);
	controller.addEventListener('selectend', onSelectEnd);
	return controller
}

export const getControllerGrip = (index, renderer, controllerModelFactory) => {
	let controllerGrip = renderer.xr.getControllerGrip(index);
	controllerGrip.add(
		controllerModelFactory.createControllerModel(controllerGrip),
	);
	return controllerGrip
};

// Wrapper for buttons, to differentiate press and release
export const gamePadWrapper = (button_map, index_to_check_for_update) => {

	const current_button_state = button_map

        if (buttons[index_to_check_for_update].pressed && !prevButtons[index_to_check_for_update]) {
          console.log(`Button ${index_to_check_for_updaten} pressed`);
        }
        if (!buttons[index_to_check_for_update].pressed && prevButtons[index_to_check_for_update]) {
          console.log(`Button ${index_to_check_for_update} released`);
        }
	
		previous_button_map = current_button_state

	return button_frame_diff_state
}