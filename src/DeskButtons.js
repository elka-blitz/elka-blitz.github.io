import * as THREE from 'three'

import { createText } from 'three/examples/jsm/webxr/Text2D';

export default class DeskButton {
	constructor(scene) {
		this.scene = scene;
		this.exists = true;
		this.max_height;
		this.min_height;
		this.inititial_height;

		this.button;
		this.button_bb;
		this.hovering;
	}

	returnExists() {
		// return this.exists
		return this.cylinder.visible;
	}

	createButton(position, colour, label, radius) {

		// drawing button to scene
		this.geometry = new THREE.CylinderGeometry(
			radius || 0.05,
			radius || 0.05,
			0.05,
			32,
		);
		this.geometry.computeBoundingBox();
		this.cyl_material = new THREE.MeshBasicMaterial({ color: colour });
		this.cylinder = new THREE.Mesh(this.geometry, this.cyl_material);

		this.scene.add(this.cylinder);
		this.cylinder.position.set(position.x, position.y, position.z);

		this.max_height =
			this.cylinder.position.y + this.cylinder.geometry.boundingBox.max.y / 2;
		this.min_height =
			this.cylinder.position.y - this.cylinder.geometry.boundingBox.max.y / 2;
		this.inititial_height = this.cylinder.position.y;

		this.cylinder_bb = new THREE.Box3().setFromObject(this.cylinder);

		this.cylinder.updateMatrixWorld();

		// Return object and boundingbox
		this.button = this.cylinder;
		this.button_bb = this.cylinder_bb;

		// Add label
		if (label != null) {
			this.button_label_text = createText(label, 0.04);
			this.button_label_text.rotateX(-1.570796); // -90deg
			this.cylinder.add(this.button_label_text);
			this.button_label_text.position.y = 0.03; // Hardcoded
		}

		return this.cylinder;
	}

	updateLabel(newLabel) {
		this.cylinder.remove(this.button_label_text);
		this.button_label_text = createText(newLabel, 0.04);
		this.button_label_text.rotateX(-1.570796); // -90deg
		this.cylinder.add(this.button_label_text);
		this.button_label_text.position.y = 0.03; // Hardcoded
	}

	hoverButtonByDesk(camera, desk, scene, xOffset, zOffset) {
		this.cylinder.position.copy(desk.position);
		this.cylinder.quaternion.copy(desk.quaternion);

		const offset = new THREE.Vector3(xOffset || 0, 0.8, zOffset || 0);
		this.cylinder.position.add(offset);

		const target = new THREE.Vector3();
		camera.getWorldPosition(target);
		target.y = this.cylinder.position.y;
		this.cylinder.lookAt(target);

		// Update button attrs
		this.cylinder_bb.setFromObject(this.cylinder);

		// Pseudo bounding logic? For press detect
		this.max_height =
			this.cylinder.position.y + this.cylinder.geometry.boundingBox.max.y / 2;
		this.min_height =
			this.cylinder.position.y - this.cylinder.geometry.boundingBox.max.y / 2;
		this.inititial_height = this.cylinder.position.y;
	}


	makeInvisible() {
		this.exists = false;
		this.cylinder.visible = false;
	}

	makeVisible() {
		this.exists = true;
		this.cylinder.visible = true;
	}

	changeColor(color) {
		this.cylinder.material.color.set(color)
	}

	pressCheck(stylus_position_vector, scene, color) {
		this.cylinder_bb.setFromObject(this.cylinder);
		if (
			this.cylinder_bb.containsPoint(stylus_position_vector) &&
			stylus_position_vector.y < this.max_height
		) {

			// Move cyl vertically when stylus in bb
			this.cylinder.position.y =
				this.inititial_height - (this.max_height - stylus_position_vector.y); //(this.cylinder.geometry.parameters.height) / 2

			// Condition: Button is more than 50% pressed
			// The desk should lock before the pen hits the surface
			// - Otherwise the desk will reset before lock?
			// So trigger desk lock at 50% depression
			// Feature/ play a noise?

			if (stylus_position_vector.y < this.inititial_height - 0.02) {
				// cyl pos is mid i.e 50%
				this.cylinder.visible = false;
				return true;
			}

			return false; // Return is used to fix desk
		} else {
			this.cylinder.position.y = this.inititial_height
			return null;
		}
	}

	forceButtonUp(stylus_position) {
		// Call onframe
		if (!this.cylinder_bb.containsPoint(stylus_position)) {
			this.cylinder.position.y = this.inititial_height
		}
	}

	pressCheckReusable(stylus_position_vector, scene, color) {
		// same as pressCheck method except it doesn't make the button invisible after it is pressed

		this.forceButtonUp(stylus_position_vector)

		this.cylinder_bb.setFromObject(this.cylinder);
		if (
			this.cylinder_bb.containsPoint(stylus_position_vector) &&
			stylus_position_vector.y < this.max_height
		) {

			// Move cyl vertically when stylus in bb
			this.cylinder.position.y =
				this.inititial_height - (this.max_height - stylus_position_vector.y);

            return stylus_position_vector.y < this.inititial_height - 0.02; // true if in, false if not


		} else {
			return null;
		}
	}
}