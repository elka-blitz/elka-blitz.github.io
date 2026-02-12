import * as THREE from 'three';

import { gsap } from 'gsap';   

export default class DeskManager {
	// Class to manage desk movement, drawzone spawning and interaction
	constructor(scene, desk_asset_instance) {
		this.coordinates;
		this.scene = scene;

		// adding to the instance adds to the group, so any positions are relevant to the desk model's
		// center (x and z are in the center, y is on the floor so add 0.75 as the model's height)
		this.desk_asset_instance = desk_asset_instance; // Of THREE.group() nature

		// TODO: Set back to false after testing 
		desk_asset_instance.visible = true;


		// Get model height
		const box = new THREE.Box3().setFromObject(desk_asset_instance);
		const size = box.getSize(new THREE.Vector3());
		this.height = size.y;

		// 3D drawing zone instance variables
		this.drawingzone_identifier = '';
		this.current_desk_quaternion = new THREE.Quaternion();
		this.spawnDrawingAreaOnDesk(0.5, 0.5, 0.5, '#ffffff', desk_asset_instance);

		// Sequence control variables
		this.desk_positioned = false;
		this.desk_positioning_confirmed = false;
		this.desk_locked_in_place = false;

		// Set up drawing zone
		// Transparent cube
		const drawing_zone = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 0.5, 0.5),
			new THREE.MeshStandardMaterial({
				color: '#ffffff',
				transparent: true,
				opacity: 0.3,
			}),
		);
		drawing_zone.position.y = 1;
		drawing_zone.name = 'drawing_zone';
		drawing_zone.visible = false;
		desk_asset_instance.add(drawing_zone);

		// drawing surface
		const rectGeometry = new THREE.PlaneGeometry(0.5, 0.2);
		const rectMaterial = new THREE.MeshBasicMaterial({
			color: '#B3B3B3',
			side: THREE.DoubleSide, // optional, shows both sides
			transparent: true,
			opacity: 0.3,
		});

		const drawingSurface = new THREE.Mesh(rectGeometry, rectMaterial);
		drawingSurface.position.y = 0.82; // slightly above model
		drawingSurface.rotateY(Math.PI / 2);
		drawingSurface.rotateX(Math.PI / 3);	// angle towards


		desk_asset_instance.add(drawingSurface);
		drawingSurface.visible = false;

		this.surface = drawingSurface;
	}

	lock() {
		this.desk_locked_in_place = true;
	}

	getLock() {
		return this.desk_locked_in_place;
	}

	getDesk() {
		return this.desk_asset_instance;
	}


	isDeskPositioned() {
		return this.desk_positioned;
	}

	getDeskCoordinates() {
		return this.desk_asset_instance.position;
	}

	getDeskQuaternion() {
		return this.desk_asset_instance.quaternion
	}

	slideToCamera(camera, stylus, table_group) {
		table_group.visible = true;

		const position = new THREE.Vector3();
		const rotation = new THREE.Quaternion();
		const scale = new THREE.Vector3();

		camera.matrixWorld.decompose(position, rotation, scale);

		// Need to rotate glb model 90deg
		const offsetQuaternion = new THREE.Quaternion().setFromAxisAngle(
			new THREE.Vector3(0, 1, 0),
			Math.PI / 2, // 90 degrees in radians
		);

		// Quaternion modify according to hmd position
		const quaternion_mod = new THREE.Quaternion();
		const euler = new THREE.Euler(0, 0, 0, 'YXZ');
		const yOnlyQuaternion = new THREE.Quaternion();

		quaternion_mod.copy(rotation);

		euler.setFromQuaternion(quaternion_mod);

		euler.x = 0;
		euler.z = 0;

		yOnlyQuaternion.setFromEuler(euler);
		yOnlyQuaternion.multiply(offsetQuaternion);

		// Animate move to stylus position
		gsap.to(table_group.position, {
			x: stylus.position.x,
			y: stylus.position.y - 0.75, // Model height
			z: stylus.position.z - 0.25,
			duration: 1,
		});

		// Apply modified quaternion to the table
		this.current_desk_quaternion = yOnlyQuaternion;
		table_group.quaternion.copy(yOnlyQuaternion);
		this.desk_asset_instance = table_group; // Update instance
	}

	slideToFront(camera, stylus, table_group) {
		// slide in front (for testing)
		table_group.visible = true;

		const position = new THREE.Vector3();
		const rotation = new THREE.Quaternion();
		const scale = new THREE.Vector3();
		//
		camera.matrixWorld.decompose(position, rotation, scale);

		// Need to rotate glb model 90deg
		const offsetQuaternion = new THREE.Quaternion().setFromAxisAngle(
			new THREE.Vector3(0, 1, 0),
			Math.PI / 2, // 90 degrees in radians
		);

		// Quaternion modify according to hmd position
		const quaternion_mod = new THREE.Quaternion();
		const euler = new THREE.Euler(0, 0, 0, 'YXZ');
		const yOnlyQuaternion = new THREE.Quaternion();

		quaternion_mod.copy(rotation);

		euler.setFromQuaternion(quaternion_mod);

		euler.x = 0;
		euler.z = 0;

		yOnlyQuaternion.setFromEuler(euler);
		yOnlyQuaternion.multiply(offsetQuaternion);

		// Animate move to stylus position
		gsap.to(table_group.position, {
			x: 0,
			y: 1.4 - 0.75, // Model height
			z: -0.5,
			duration: 1,
		});

		// Apply modified quaternion to the table
		this.current_desk_quaternion = yOnlyQuaternion;
		table_group.quaternion.copy(yOnlyQuaternion);
		this.desk_asset_instance = table_group; // Update instance
	}

	animateMove(end_position_vector) {
		gsap.to(this.desk_asset_instance.position, {
			x: end_position_vector.x,
			y: end_position_vector.y,
			z: end_position_vector.z,
			duration: 0.25,
		});
	}

	spawnDrawingAreaOnDesk(width, height, depth, colour, desk_model) {
		// Spawn a 3D area on desk wherein the user may draw
		// Possibly follow with the object to trace within the drawing zone

		// Transparent cube
		// const drawing_zone = new THREE.Mesh(
		// 	new THREE.BoxGeometry(width, height, depth),
		// 	new THREE.MeshStandardMaterial({
		// 		color: colour,
		// 		transparent: true,
		// 		opacity: 0.3,
		// 	}),
		// );
		//
		// // Store uuid of drawing zone for visibility toggle
		// this.drawingzone_identifier = drawing_zone.uuid;
		//
		// this.scene.add(drawing_zone);
		// drawing_zone.position.set(
		// 	desk_model.position.x,
		// 	desk_model.position.y + 1,
		// 	desk_model.position.z - 3,
		// );
		//
		// // Rotate the cube in accordance with the desk's rotation
		// drawing_zone.quaternion.copy(this.current_desk_quaternion);
		// drawing_zone.visible = false;

	}
	spawnDrawingSurface() {
		this.surface.visible = true;
	}

	placeSVG(svgGroup, position) {
		const box = new THREE.Box3().setFromObject(svgGroup);
		const size = box.getSize(new THREE.Vector3());

		const scale = Math.min(
			this.surface.geometry.parameters.width  / size.x,
			this.surface.geometry.parameters.height / size.y,
		);

		svgGroup.scale.setScalar(scale);

		// centering
		box.setFromObject(svgGroup);
		const center = box.getCenter(new THREE.Vector3());
		svgGroup.position.sub(center);
		svgGroup.position.z = -0.01;
		svgGroup.position.x -= position.x;	// negative because it's flipped
		svgGroup.position.y -= position.y;

		this.surface.add(svgGroup);

	}

	clearSurface() {
		this.surface.clear()
	}
}

