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