/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Text } from 'troika-three-text';
import { TubePainter } from "three/examples/jsm/misc/TubePainter";
import { XR_BUTTONS } from 'gamepad-wrapper';
import { createText } from 'three/addons/webxr/Text2D.js';
import { gsap } from 'gsap';
import { init } from './init.js';

const floorGeometry = new THREE.PlaneGeometry(6, 6);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 'black' });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
let cubeRotation = 0
const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x89F336});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
const cube2 = new THREE.Mesh(
	new THREE.BoxGeometry(0.3, 0.3, 0.3),
	new THREE.MeshStandardMaterial({ color: '#F54927' }),
);
const drawMaterial = new THREE.MeshNormalMaterial({
	flatShading: true,
	side: THREE.DoubleSide,
});


let painter1;



function setupScene({
	scene,
	camera,
	renderer,
	player,
	controller1,
	controller2,
	controllerGrip1,
	controllerGrip2,
}) {
	floor.rotateX(-Math.PI / 2);
	scene.add(floor);

	scene.add(cube);
	cube.position.set(0, 1, -1.5);
	cube.rotateY(Math.PI / 4 + cubeRotation);

	scene.add(cube2);
	cube2.position.set(0, 2, -1.5);

	const light = new THREE.PointLight(0x89f336, 20, 100, 0.1);
	light.position.copy(cube.position);
	scene.add(light);

	const text = createText('Check out my spinning cubes!', 0.09);
	text.position.set(0, 1.6, -1);
	scene.add(text);

	painter1 = new TubePainter();
	painter1.mesh.material = drawMaterial;
	painter1.setSize(0.1);

	scene.add(painter1.mesh);

	scene.add(controller1);
	scene.add(controller2);
	scene.add(controllerGrip1);
	scene.add(controllerGrip2);
}

function onFrame(
	delta,
	time,
	{ scene, camera, renderer, player, controllers },
) {
	cubeRotation += 2
	cube.rotateX(0.01)
	cube.rotateY (0.01)
	cube2.rotateY(0.05)
	cube2.rotateX(0.05)

}

init(setupScene, onFrame);
