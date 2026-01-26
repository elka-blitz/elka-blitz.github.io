import * as THREE from 'three';

import { gsap } from 'gsap';   

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
		console.log(coordinates)
		this.desk_asset.position.set(coordinates.x, coordinates.y, coordinates.z)
	}

	animateMoveTo(coordinates) {
		gsap.to(this.desk_asset.position, {
			x: coordinates.x,
			y: coordinates.y,
			z: coordinates.z,
			duration: 2,
			ease: 'power2.out'
		});   
	}
}

