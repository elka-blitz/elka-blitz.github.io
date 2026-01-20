import * as THREE from "three";

export const getController = (index, renderer, onControllerConnected, onSelectStart, onSelectEnd) => {
	let controller = renderer.xr.getController(index);
	controller.addEventListener('connected', onControllerConnected);
	controller.addEventListener('selectstart', onSelectStart);
	controller.addEventListener('selectend', onSelectEnd);

	const geometry = new THREE.BufferGeometry().setFromPoints([
	  new THREE.Vector3(0, 0, 0),
	  new THREE.Vector3(0, 0, -1)
	]);
	const line = new THREE.Line(geometry);
	line.scale.z = 10; // Initial length
	controller.add(line)

	return controller
}

export const getControllerGrip = (index, renderer, controllerModelFactory) => {
	let controllerGrip = renderer.xr.getControllerGrip(index);
	controllerGrip.add(
		controllerModelFactory.createControllerModel(controllerGrip),
	);
	return controllerGrip
};