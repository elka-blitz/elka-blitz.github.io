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
	t3paint8;
const inkColor = new THREE.Color('#002C42');

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
	constructor(surfaceDimensions) {
		this.array = [
			{ url: 'assets/task1/base.svg', position: { x: 0.005, y: 0 } },
			{ url: 'assets/task1/banner_long.svg', position: { x: 0, y: -0.1 } },
			{ url: 'assets/task1/banner_short.svg', position: { x: 0, y: -0.116 } },
			{ url: 'assets/task1/door_top.svg', position: { x: -0.06, y: -0.032 } },
			{ url: 'assets/task1/window.svg', position: { x: 0.065, y: -0.015 } },
			{ url: 'assets/task1/window2.svg', position: { x: 0.065, y: 0.055 } },
			{ url: 'assets/task1/door_bottom.svg', position: { x: -0.06, y: 0.088 } },
			{ url: 'assets/task1/window_curtain.svg', position: { x: 0.065, y: -0.027 } },
		];

		this.t2Array = [
			{ url: 'assets/task2/cup.svg', position: { x: -0.01, y: 0.03 } },
			{ url: 'assets/task2/plate1.svg', position: { x: -0.01, y: 0.085 } },
			{ url: 'assets/task2/plate2.svg', position: { x: -0.01, y: 0.073 } },
			{ url: 'assets/task2/rim.svg', position: { x: -0.01, y: -0.021 } },
			{ url: 'assets/task2/tea.svg', position: { x: -0.01, y: -0.023 } },
			{ url: 'assets/task2/steam.svg', position: { x: -0.014, y: -0.1 } },
			{ url: 'assets/task2/handle.svg', position: { x: 0.097, y:0.015 } },
			{ url: 'assets/task2/teabag.svg', position: { x: -0.005, y: 0.038 } },
		];

		this.t3Array = [
			{ url: 'assets/task3/cake_side.svg', position: { x: -0.035, y: 0.02 }, },
			{ url: 'assets/task3/cake_top.svg', position: { x: -0.04, y: -0.045 } },
			{ url: 'assets/task3/top_icing.svg', position: { x: -0.04, y: 0 }, },
			{ url: 'assets/task3/layer_icing.svg', position: { x: -0.0425, y: 0.028 } },
			{ url: 'assets/task3/spoon_top.svg', position: { x: 0.082, y: 0.038 } },
			{ url: 'assets/task3/spoon_handle.svg', position: { x: 0, y: 0.1 } },
			{ url: 'assets/task3/cherry.svg', position: { x: -0.020, y: -0.09 } },
			{ url: 'assets/task3/icing_blob.svg', position: { x: -0.008, y: -0.073 } },
		];


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

		const rectGeometry = new THREE.PlaneGeometry(surfaceDimensions.width, surfaceDimensions.height);
		const rectMaterial = new THREE.MeshBasicMaterial({
			color: '#f0f0f0',
			side: THREE.DoubleSide, // optional, shows both sides
			transparent: true,
			opacity: 1,
		});

		this.surface = new THREE.Mesh(rectGeometry, rectMaterial);
	}
	getSVGArray() {
		return this.array;
	}

	getTaskArray(taskName) {
		switch (taskName) {
			case "Storefront":
				return this.array;
			case "Cup of Tea":
				return this.t2Array;
			case "Cake":
				return this.t3Array;
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
		}
	}

	setupPaints(taskNum, box) {
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
		}
		paintArray.forEach((paint, i) => {
			paintArray[i] = new TubePainter();
			paintArray[i].mesh.material = new THREE.LineBasicMaterial({
				color: inkColor,
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
	}
}