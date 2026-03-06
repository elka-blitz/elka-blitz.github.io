import * as THREE from 'three';

export default class DrawParent {
	constructor(degreesObj) {
		const boxGeometry = new THREE.PlaneGeometry(0.5, 0.3);
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

		this.degreesObj = degreesObj;
	}

	getParent() {
		return this.drawingBox;
	}

	makeVertical() {
		this.drawingBox.material.visible = true;
		this.degreesObj.isHorizontal
			? this.drawingBox.rotateX(- this.degreesObj.horizontal)
			: this.drawingBox.rotateX(- this.degreesObj.vertical)

		this.drawingBox.rotateZ(THREE.MathUtils.degToRad(180));
		this.drawingBox.position.x += 0.5; // x and z are flipped
		this.drawingBox.position.z += 0.5;
		this.drawingBox.position.y += 0.35;
	}

	makeInvisible() {
		this.drawingBox.material.visible = false;
	}
}
