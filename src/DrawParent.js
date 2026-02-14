import * as THREE from 'three';

export default class DrawParent {
	constructor(color, BROWSER_TESTING) {		// todo remove because both are just for testing purposes
		const boxGeometry = new THREE.PlaneGeometry(0.5, 0.2);
		this.drawingBox = new THREE.Mesh(
			boxGeometry,
			new THREE.MeshStandardMaterial({
				color: color,
				transparent: true,
				side: THREE.DoubleSide, // optional, shows both sides
				opacity: 0.2,
				visible: BROWSER_TESTING,
			}),
		);
		// making its origin in the center of the cube
		boxGeometry.computeBoundingBox();
		const boxCenter = boxGeometry.boundingBox.getCenter(new THREE.Vector3());
		boxGeometry.translate(-boxCenter.x, -boxCenter.y, -boxCenter.z);
		this.drawingBox.position.set(boxCenter.x, boxCenter.y, boxCenter.z);
		this.drawingBox.rotateY(Math.PI / 2);
		this.drawingBox.rotateX(Math.PI / 3); // angle towards
	}

	getParent() {
		return this.drawingBox;
	}

	makeVertical() {
		this.drawingBox.rotateX(-Math.PI / 3);
		this.drawingBox.rotateZ(THREE.MathUtils.degToRad(180));
		this.drawingBox.position.x += 0.2;
		this.drawingBox.position.y += 0.2;
	}
}
