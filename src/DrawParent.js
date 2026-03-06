import * as THREE from 'three';

export default class DrawParent {
	constructor() {
		const boxGeometry = new THREE.PlaneGeometry(0.5, 0.3);
		this.drawingBox = new THREE.Mesh(
			boxGeometry,
			new THREE.MeshBasicMaterial({
				color: '#c6c6c6',
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
		this.drawingBox.rotateX(Math.PI / 3); // angle towards
	}

	getParent() {
		return this.drawingBox;
	}

	makeVertical(isHorizontalSurface) {
		this.drawingBox.material.visible = true;
		isHorizontalSurface
			? this.drawingBox.rotateX(- (Math.PI / 2) - (Math.PI / 12))
			: this.drawingBox.rotateX(-Math.PI / 36)

		this.drawingBox.rotateZ(THREE.MathUtils.degToRad(180));
		this.drawingBox.position.x += 0.5; // x and z are flipped
		this.drawingBox.position.z += 0.5;
		this.drawingBox.position.y += 0.35;
	}

	makeInvisible() {
		this.drawingBox.material.visible = false;
	}
}
