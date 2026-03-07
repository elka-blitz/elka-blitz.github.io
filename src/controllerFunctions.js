export const getController = (index, renderer, onControllerConnected, onSelectStart, onSelectEnd, onSwitchController) => {
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

// todo make these either work or get rid of them
export function hideControllerModel(controller) {
	if (controller.children.length > 0) {
		const model = controller.children[0]; // Access the first child (the model)
		model.visible = false;  // Hides the model
	}
}
export function showControllerModel(controller) {
	if (controller.children.length > 0) {
		const model = controller.children[0]; // Access the first child (the model)
		model.visible = false;  // Hides the model
	}
}