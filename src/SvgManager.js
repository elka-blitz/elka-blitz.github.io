import * as THREE from 'three';

import { TubePainter } from 'three/examples/jsm/misc/TubePainter';

let paint1,
	paint2,
	paint3,
	paint4,
	paint5,
	paint6,
	paint7,
	paint8,
	t2paint1,
	t2paint2,
	t2paint3,
	t2paint4,
	t2paint5,
	t2paint6,
	t2paint7,
	t2paint8,
	t3paint1,
	t3paint2,
	t3paint3,
	t3paint4,
	t3paint5,
	t3paint6,
	t3paint7,
	t3paint8,
	t4paint1,
	t4paint2,
	t4paint3,
	t4paint4,
	t4paint5,
	t4paint6,
	t4paint7,
	t4paint8;

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
			{ url: 'assets/task1/base.svg', position: { x: 0, y: 0 } },
			{ url: 'assets/task1/door_bottom.svg', position: { x: -0.05, y: 0.06 } },
			{ url: 'assets/task1/door_top.svg', position: { x: -0.05, y: -0.015 } },
			{ url: 'assets/task1/window.svg', position: { x: 0.04, y: -0.02 } },
			{ url: 'assets/task1/window2.svg', position: { x: 0.04, y: 0.03 } },
			{ url: 'assets/task1/window_curtain.svg', position: { x: 0.04, y: -0.025 } },
			{ url: 'assets/task1/banner_short.svg', position: { x: 0, y: -0.08 } },
			{ url: 'assets/task1/banner_long.svg', position: { x: 0, y: -0.075 } },
		];

		this.t2Array = [
			{ url: 'assets/task2/outline.svg', position: { x: 0, y: 0.025 } },
			{ url: 'assets/task2/awning.svg', position: { x: 0, y: -0.047 } },
			{ url: 'assets/task2/bush.svg', position: { x: 0, y: -0.08 } },
			{ url: 'assets/task2/door.svg', position: { x: 0.038, y: 0.04 } },
			{ url: 'assets/task2/door_window.svg', position: { x: 0.036, y: 0.015 } },
			{ url: 'assets/task2/flower.svg', position: { x: 0.036, y: 0.015 } },
			{ url: 'assets/task2/window.svg', position: { x: -0.032, y: 0.012 } },
			{ url: 'assets/task2/windowsill.svg', position: { x: -0.032, y: 0.045 } },
		];

		this.t3Array = [
			{ url: 'assets/task3/extension_outline.svg', position: { x: -0.022, y: 0.04 }, },
			{ url: 'assets/task3/main_outline.svg', position: { x: 0.02, y: 0.022 } },
			{ url: 'assets/task3/big_window.svg', position: { x: -0.02, y: 0.04 } },
			{ url: 'assets/task3/side_window.svg', position: { x: 0.07, y: 0.032 } },
			{ url: 'assets/task3/top_window.svg', position: { x: 0, y: -0.03 } },
			{ url: 'assets/task3/roof_slant.svg', position: { x: 0.04, y: -0.071 } },
			{ url: 'assets/task3/roof_window.svg', position: { x: 0.007, y: -0.07 } },
			{ url: 'assets/task3/triangle_roof.svg', position: { x: 0.04, y: -0.075 }, },
		];

		this.t4Array = [
			{ url: 'assets/task4/outline.svg', position: { x: 0.002, y: 0.01 } },
			{ url: 'assets/task4/column.svg', position: { x: 0.068, y: 0.02 } },
			{ url: 'assets/task4/column_end.svg', position: { x: 0.068, y: 0.09 } },
			{ url: 'assets/task4/column_top.svg', position: { x: 0.068, y: -0.053 } },
			{ url: 'assets/task4/door.svg', position: { x: 0.004, y: 0.047 } },
			{ url: 'assets/task4/door_panels.svg', position: { x: 0.004, y: 0.048 } },
			{ url: 'assets/task4/top.svg', position: { x: 0.002, y: -0.085 } },
			{ url: 'assets/task4/window.svg', position: { x: 0.002, y: -0.023 } },

			// { url: 'assets/task4/column.svg', position: 	{ x: -0.0619, y: 0.02 } },
			// { url: 'assets/task4/column_end.svg', position: { x: -0.0619, y: 0.09 } },
			// { url: 'assets/task4/column_top.svg', position: { x: -0.0619, y: -0.053 } },
		];
		shuffle(this.array);
		shuffle(this.t2Array);
		shuffle(this.t3Array);
		shuffle(this.t4Array);

		this.t1Paints = [
			paint1,
			paint2,
			paint3,
			paint4,
			paint5,
			paint6,
			paint7,
			paint8,
		];
		this.t2Paints = [
			t2paint1,
			t2paint2,
			t2paint3,
			t2paint4,
			t2paint5,
			t2paint6,
			t2paint7,
			t2paint8,
		];
		this.t3Paints = [
			t3paint1,
			t3paint2,
			t3paint3,
			t3paint4,
			t3paint5,
			t3paint6,
			t3paint7,
			t3paint8,
		];
		this.t4Paints = [
			t4paint1,
			t4paint2,
			t4paint3,
			t4paint4,
			t4paint5,
			t4paint6,
			t4paint7,
			t4paint8
		];

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

	getTaskArray(taskNum) {
		switch (taskNum) {
			case 1:
				return this.array;
			case 2:
				return this.t2Array;
			case 3:
				return this.t3Array;
			case 4:
				return this.t4Array;
		}
	}
	getPaintsArray(taskNum) {
		switch (taskNum) {
			case 1:
				return this.t1Paints;
			case 2:
				return this.t2Paints;
			case 3:
				return this.t3Paints;
			case 4:
				return this.t4Paints;
		}
	}

	setupPaints(taskNum, box) {
		const colorArray = ['red', 'yellow', 'blue'];
		let paintArray = [];
		switch (taskNum) {
			case 1:
				paintArray = this.t1Paints;
				break;
			case 2:
				paintArray = this.t2Paints;
				break;
			case 3:
				paintArray = this.t3Paints;
				break;
			case 4:
				paintArray = this.t4Paints;
				break;
		}
		paintArray.forEach((paint, i) => {
			paintArray[i] = new TubePainter();
			paintArray[i].mesh.material = new THREE.LineBasicMaterial({
				color: "black",
				linewidth: 4,
			});
			paintArray[i].setSize(0.2);
			box.add(paintArray[i].mesh);
		});
	}

	svgSurface(svgGroup, scene) {
		const box = new THREE.Box3().setFromObject(svgGroup);
		const size = box.getSize(new THREE.Vector3());
		const padding = 0.04;

		const scale = Math.min(
			(this.surface.geometry.parameters.width - padding) / size.x,
			(this.surface.geometry.parameters.height - padding) / size.y,
		);

		svgGroup.scale.setScalar(scale);

		// centering
		box.setFromObject(svgGroup);
		const center = box.getCenter(new THREE.Vector3());
		svgGroup.position.sub(center);
		svgGroup.position.z = -0.01;

		this.surface.add(svgGroup);

		console.log('Hello from deskmanager. svgGroup:', svgGroup)

		// for (const dash in svgGroup.children) {
		// 	// console.log(svgGroup.children[dash].castShadow)
		// 	let dash_details = svgGroup.children[dash]
		// 	// console.log(dash_details.position)

		// 	let worldPosition = new THREE.Vector3();
		// 	dash_details.getWorldPosition(worldPosition);
		// 	console.log(dash_details.uuid, worldPosition); // Outputs the global position (x, y, z)
		// }

	}

	getSurface() {
		return this.surface;
	}

	makeSurfaceInvisible() {
		this.surface.visible = false;
	}

	makeSurfaceVisible() {
		this.surface.visible = true;
	}

	clearSurface() {
		this.surface.clear();
	}

	makeAllPaintsVisible() {
		this.t1Paints.forEach((paint, i) => {
			paint.mesh.visible = true;
		})
		this.t2Paints.forEach((paint, i) => {
			paint.mesh.visible = true;
		})
		this.t3Paints.forEach((paint, i) => {
			paint.mesh.visible = true;
		})
		this.t4Paints.forEach((paint, i) => {
			paint.mesh.visible = true;
		})
	}
}