import * as THREE from 'three';

import {
	getCube,
	getDashedLine,
	getFloor,
	getSquare,
} from './shapeFunctions';

import { gsap } from 'gsap';   

export default class DeskManager {
	// Class to manage desk movement, drawzone spawning and interaction
	constructor(scene, desk_asset_instance) {
		this.coordinates; 
		this.scene = scene
		this.identifier = desk_asset_instance.uuid // defined after placement
		this.desk_asset_instance = desk_asset_instance // Of THREE.group() nature
		console.log(this.identifier)
		this.drawingzone_identifier = ''
	}

	setDesk(coordinates) {
		// Place at vector coordinates
		console.log(coordinates)
		this.desk_asset_instance.position.set(coordinates.x, coordinates.y, coordinates.z)
	}

	getDeskCoordinates() {
		return (this.desk_asset_instance.position).toString()
	}

	slideToCamera(camera, stylus, table_group) {

		const position = new THREE.Vector3();
		const rotation = new THREE.Quaternion();
		const scale = new THREE.Vector3();

		camera.matrixWorld.decompose(position, rotation, scale)

		// Need to rotate glb model 90deg
		const offsetQuaternion = new THREE.Quaternion().setFromAxisAngle(
			new THREE.Vector3(0, 1, 0),
			Math.PI / 2  // 90 degrees in radians
		);

		// Quaternion modify according to hmd position
		const quaternion_mod = new THREE.Quaternion();
		const euler = new THREE.Euler(0, 0, 0, 'YXZ')
		const yOnlyQuaternion = new THREE.Quaternion()

		quaternion_mod.copy(rotation)

		euler.setFromQuaternion(quaternion_mod)

		euler.x = 0
		euler.z = 0

		yOnlyQuaternion.setFromEuler(euler)
		yOnlyQuaternion.multiply(offsetQuaternion)

		// Animate move to stylus position
		gsap.to(table_group.position, {
			x: stylus.position.x,
			y: stylus.position.y - 0.78, // Model height
			z: stylus.position.z - 0.25,
			duration: 2,
		});

		// Apply modified quaternion to the table
		table_group.quaternion.copy(yOnlyQuaternion)
	}

	spawnDrawingAreaOnDesk(width, height, depth, colour) {
		// Spawn a 3D area on desk wherein the user may draw
		// Possibly follow with the object to trace within the drawing zone
		const table = this.desk_asset_instance
		
		// Transparent cube, log uuid
		const drawing_zone = new THREE.Mesh(
		new THREE.BoxGeometry(width, height, depth),
		new THREE.MeshStandardMaterial({ color: colour, transparent: true, opacity: 0.3 }),
	);

		this.scene.add(drawing_zone)
		drawing_zone.position.set(table.position.x, table.position.y + 0.7, table.position.z)
	
	}
}

