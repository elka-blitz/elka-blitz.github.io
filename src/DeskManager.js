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
		this.desk_asset_instance = desk_asset_instance // Of THREE.group() nature
		desk_asset_instance.visible = false

		// Get model height
		const box = new THREE.Box3().setFromObject(desk_asset_instance)
		const size = box.getSize(new THREE.Vector3())
		this.height = size.y

		// 3D drawing zone instance variables
		this.drawingzone_identifier = ''
		this.current_desk_quaternion = new THREE.Quaternion()
		this.spawnDrawingAreaOnDesk(0.5, 0.5, 0.5, '#ffffff', desk_asset_instance)

		// Sequence control variables
		this.desk_positioned = false
		this.desk_positioning_confirmed = false
		this.desk_locked_in_place = false

		// Set up drawing zone
		// Transparent cube
		const drawing_zone = new THREE.Mesh(
			new THREE.BoxGeometry(0.5, 0.5, 0.5),
			new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.3 }),
		);
		drawing_zone.position.y = 1
		drawing_zone.name = 'drawing_zone'
		drawing_zone.visible = false
		desk_asset_instance.add(drawing_zone)
		

		// Set up a button
		// const geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 32);
		// geometry.computeBoundingBox()
		// const material = new THREE.MeshBasicMaterial({ color: '#b30000'});
		// const button1 = new THREE.Mesh(geometry, material);
		// button1.name = 'button'
		// this.button_bb = geometry.boundingBox //new THREE.Box3().setFromObject(button1) // Button bounding box
		// this.boxHelper = new THREE.BoxHelper(button1, '#ffff00')
		// scene.add(this.boxHelper)
		// desk_asset_instance.add(button1)
		// button1.position.y = 0.77 // On top of desk
		// this.button1 = button1
		// this.prevDeskPositioned = false // Framediff
	}

	setDesk(coordinates) {
		// Place at vector coordinates
		console.log(coordinates)
		this.desk_asset_instance.position.set(coordinates.x, coordinates.y, coordinates.z)
	}

	lock() {
		this.desk_locked_in_place = true
	}

	getLock() {
		return this.desk_locked_in_place
	}

	getDesk() {
		return this.desk_asset_instance
	}

	updateButton(stylusposition) {
		// Not update, just checking if stylus is in bounding box
		if (this.button_bb.containsPoint(stylusposition)) {
			console.log('Buttonpress')
		}
	}

	getPositionForButton() {
		try{
			// Return the location, relative to the desk, where the button should be
			// As a vector 3
			console.log(this.desk_asset_instance.position)
			let desk_x_pos = this.desk_asset_instance.position.x
			let desk_y_pos = this.desk_asset_instance.position.y
			let desk_z_pos = this.desk_asset_instance.position.z

			// Get current desk centerpoint
			const current_desk_vector = new THREE.Vector3(desk_x_pos, desk_y_pos, desk_z_pos)
			console.log(current_desk_vector)
			// Place coordpoint on desk surface
			current_desk_vector.y = current_desk_vector.y + 0.8 // Assuming that the centerpoint is actually the centre of the model 

			console.log(current_desk_vector)
			// Identify button location to left of desk
			current_desk_vector.x = current_desk_vector.x +0.2 
			current_desk_vector.z = current_desk_vector.z + 0.5

			console.log(current_desk_vector)

			// Apply quaternion
			current_desk_vector.applyQuaternion(this.current_desk_quaternion)//this.desk_asset_instance.quaternion)
			
			// I mean, generate a new quaternion and apply the deskual translation
			let button_position_quaternion = new THREE.Quaternion()

			// Return vector
			console.log(this.desk_asset_instance.quaternion)
			return current_desk_vector

		} catch (e) {
			console.log(e)
		}
	}

	getButton() {
		return this.scene.getObjectByProperty('uuid', this.button_id)
	}

	isDeskPositioned(){
		return this.desk_positioned
	}

	getDeskCoordinates() {
		return this.desk_asset_instance.position
	}

	slideToCamera(camera, stylus, table_group) {

		table_group.visible = true

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
			y: stylus.position.y - 0.75, // Model height
			z: stylus.position.z - 0.25,
			duration: 1,
		});

		// Apply modified quaternion to the table
		this.current_desk_quaternion = yOnlyQuaternion
		table_group.quaternion.copy(yOnlyQuaternion)
		this.desk_asset_instance = table_group // Update instance
	}

	animateMove(end_position_vector) {
		gsap.to(this.desk_asset_instance.position, {
			x: end_position_vector.x,
			y: end_position_vector.y,
			z: end_position_vector.z,
			duration: 0.25
		})
	}

	spawnDrawingAreaOnDesk(width, height, depth, colour, desk_model) {
		// Spawn a 3D area on desk wherein the user may draw
		// Possibly follow with the object to trace within the drawing zone
		
		// Transparent cube
		const drawing_zone = new THREE.Mesh(
			new THREE.BoxGeometry(width, height, depth),
			new THREE.MeshStandardMaterial({ color: colour, transparent: true, opacity: 0.3 }),
		);

		// Store uuid of drawing zone for visibility toggle
		this.drawingzone_identifier = drawing_zone.uuid

		this.scene.add(drawing_zone)
		drawing_zone.position.set(desk_model.position.x, desk_model.position.y + 1, desk_model.position.z -3)

		// Rotate the cube in accordance with the desk's rotation
		drawing_zone.quaternion.copy(this.current_desk_quaternion)
		drawing_zone.visible = false
	}
}

