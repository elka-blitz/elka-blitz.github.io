import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';   

export default class Desk {
	constructor(scene, desk_asset) {
		// There should only be one desk at a time
		this.coordinates; 
		this.scene = scene
		this.identifier = desk_asset.uuid // defined after placement
		this.desk_asset = desk_asset // Of THREE.group() nature
		
		// At init, add desk to scene and get uuid
		scene.add(desk_asset)
		console.log(this.identifier)
	}

	setDesk(coordinates) {
		// Move to vector coordinates
		this.desk_asset.position.set(coordinates)
	}

	animateMoveTo(coordinates) {
		// Include Tween.js library
		new TWEEN.Tween(this.desk_asset.position)
		.to({ x: coordinates.x, y: coordinates.y, z: coordinates.z }, 1000) // Move to (10, 0, 0) over 1 second
		.easing(TWEEN.Easing.Quadratic.Out)
		.onComplete(() => console.log("Animation complete"))
		.start();
	}
}

