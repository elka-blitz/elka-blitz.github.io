import * as THREE from 'three';

import { gsap } from 'gsap';
import {getRoundedRect} from "./shapeFunctions";

export default class DeskManager {
	// Class to manage desk movement, drawzone spawning and interaction
	constructor(scene, desk_asset_instance, isHorizontalSurface) {
		this.coordinates;
		this.scene = scene;

		// adding to the instance adds to the group, so any positions are relevant to the desk model's
		// center (x and z are in the center, y is on the floor so add 0.75 as the model's height)
		this.desk_asset_instance = desk_asset_instance; // Of THREE.group() nature

		// TODO: Set back to false after testing 
		desk_asset_instance.visible = true;


		// Get model height
		// const box = new THREE.Box3().setFromObject(desk_asset_instance);
		// const size = box.getSize(new THREE.Vector3());
		// this.height = size.y;

		// 3D drawing zone instance variables
		this.drawingzone_identifier = '';
		this.current_desk_quaternion = new THREE.Quaternion();

		// Sequence control variables
		this.desk_positioned = false;
		this.desk_positioning_confirmed = false;
		this.desk_locked_in_place = false;

		// drawing surface
		const rectGeometry = getRoundedRect(0.42, 0.29, 0.01, 2)
		const rectMaterial = new THREE.MeshBasicMaterial({
			color: '#F0F0F0',
			side: THREE.DoubleSide, // optional, shows both sides
			transparent: true,
			opacity: 1,
		});

		const scaleRectGeometry = new THREE.PlaneGeometry(0.5, 0.2);
		this.scaleRect = new THREE.Mesh(scaleRectGeometry, rectMaterial);

		const drawingSurface = new THREE.Mesh(rectGeometry, rectMaterial);
		drawingSurface.rotateY(Math.PI / 2);

		if (isHorizontalSurface) {
			drawingSurface.rotateX((Math.PI / 2) - (Math.PI / 12)) 		// 15 degrees
			drawingSurface.position.y = 0.778; // slightly above model

		} else {
			drawingSurface.rotateX(Math.PI / 36) // 85 degrees
			drawingSurface.position.y = 1.1;

		}


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
		return {
			x:  this.desk_asset_instance.position.x,
			y:  this.desk_asset_instance.position.y + 0.75,
			z:  this.desk_asset_instance.position.z,
		};
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

	spawnDrawingSurface() {
		this.surface.visible = true;
	}

	placeSVG(svgGroup, position) {
		const box = new THREE.Box3().setFromObject(svgGroup);
		const size = box.getSize(new THREE.Vector3());

		const scale = Math.min(
			this.scaleRect.geometry.parameters.width  / size.x,
			this.scaleRect.geometry.parameters.height / size.y,
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

	addMesh(mesh) {
		this.desk_asset_instance.add(mesh)
	}

	makeSurfaceInvisible() {
		this.surface.visible = false;
	}
	makeSurfaceVisible() {
		this.surface.visible = true;
	}

}

