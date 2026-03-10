import * as THREE from 'three';
import {degreesObj, taskOrder, isHorizontalSurface} from "./experimentConfig";

export default class DrawParent {
	constructor(surfaceDimensions) {
		const boxGeometry =  new THREE.PlaneGeometry(surfaceDimensions.width, surfaceDimensions.height);
		this.drawingBox = new THREE.Mesh(
			boxGeometry,
			new THREE.MeshBasicMaterial({
				color: '#f0f0f0',
				side: THREE.DoubleSide, // optional, shows both sides
				transparent: true,
				opacity: 1,
				visible: false,
			}),
		);
		// making its origin in the center of the cube
		boxGeometry.computeBoundingBox();
		const boxCenter = boxGeometry.boundingBox.getCenter(new THREE.Vector3());
		boxGeometry.translate(-boxCenter.x, -boxCenter.y, -boxCenter.z);
		this.drawingBox.position.set(boxCenter.x, boxCenter.y, boxCenter.z);
		this.drawingBox.rotateY(Math.PI / 2);

		degreesObj.isHorizontal
			? this.drawingBox.rotateX(degreesObj.horizontal)
			: this.drawingBox.rotateX(degreesObj.vertical)

	}

	getParent() {
		return this.drawingBox;
	}

	makeVertical(x, y, z) {
		this.drawingBox.material.visible = true;
		this.drawingBox.position.set(x, y, z)

		if (isHorizontalSurface) {
			this.drawingBox.rotateY(THREE.MathUtils.degToRad(180))
			// this.drawingBox.rotateZ(THREE.MathUtils.degToRad(180));

			this.drawingBox.rotateX(-degreesObj.horizontal)
		} else {
			this.drawingBox.rotateX(-degreesObj.vertical)
			this.drawingBox.rotateZ(THREE.MathUtils.degToRad(180));

		}
	}

	makeInvisible() {
		this.drawingBox.material.visible = false;
	}
}
