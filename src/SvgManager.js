import * as THREE from 'three';

import { gsap } from 'gsap';

function shuffle(array) {
	let currentIndex = array.length;

	// While there remain elements to shuffle...
	while (currentIndex !== 0) {
		// Pick a remaining element...
		let randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex],
		];
	}
}

export default class SvgManager {
	// Class to manage desk movement, drawzone spawning and interaction
	constructor() {
		this.array = [
			{ url: 'assets/base.svg', position: { x: 0, y: 0 } },
			{ url: 'assets/door_bottom.svg', position: { x: -0.05, y: 0.06 } },
			{ url: 'assets/door_top.svg', position: { x: -0.05, y: -0.015 } },
			{ url: 'assets/window.svg', position: { x: 0.04, y: -0.02 } },
			{ url: 'assets/window2.svg', position: { x: 0.04, y: 0.03 } },
			{ url: 'assets/window_curtain.svg', position: { x: 0.04, y: -0.025 } },
			{ url: 'assets/banner_short.svg', position: { x: 0, y: -0.08 } },
			{ url: 'assets/banner_long.svg', position: { x: 0, y: -0.075 } },
		];
		shuffle(this.array);

		const rectGeometry = new THREE.PlaneGeometry(0.5, 0.2);
		const rectMaterial = new THREE.MeshBasicMaterial({
			color: '#c6c6c6',
			side: THREE.DoubleSide, // optional, shows both sides
			transparent: true,
			opacity: 1,
		});

		this.surface = new THREE.Mesh(rectGeometry, rectMaterial);


	}
	getSVGArray() {
		return this.array;
	}

	svgSurface(svgGroup, scene) {
	
		const box = new THREE.Box3().setFromObject(svgGroup);
		const size = box.getSize(new THREE.Vector3());
		const padding = 0.04

		const scale = Math.min(
			(this.surface.geometry.parameters.width - padding )/size.x,
			(this.surface.geometry.parameters.height - padding )/size.y,
		);

		svgGroup.scale.setScalar(scale);

		// centering
		box.setFromObject(svgGroup);
		const center = box.getCenter(new THREE.Vector3());
		svgGroup.position.sub(center);
		svgGroup.position.z = -0.01;

		this.surface.add(svgGroup);
		this.surface.rotateY(Math.PI);
	}
	
	getSurface() {
		return this.surface;
	}
}