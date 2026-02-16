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

	}
	getSVGArray() {
		return this.array;
	}
}