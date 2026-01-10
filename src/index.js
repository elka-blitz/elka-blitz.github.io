/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Text } from 'troika-three-text';
import { XR_BUTTONS } from 'gamepad-wrapper';
import { gsap } from 'gsap';
import { init } from './init.js';

const floorGeometry = new THREE.PlaneGeometry(6, 6);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 'white' });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);


function setupScene({ scene, camera, renderer, player, controllers }) {

	floor.rotateX(-Math.PI / 2);
	scene.add(floor);

	const coneGeometry = new THREE.ConeGeometry(0.6, 1.5);
	const coneMaterial = new THREE.MeshStandardMaterial({ color: 'purple' });
	const cone = new THREE.Mesh(coneGeometry, coneMaterial);
	scene.add(cone);
	cone.position.set(0.4, 0.75, -1.5);

	// const gltfLoader = new GLTFLoader();

	// gltfLoader.load('assets/spacestation.glb', (gltf) => {
	// 	scene.add(gltf.scene);
	// });

	// gltfLoader.load('assets/blaster.glb', (gltf) => {
	// 	blasterGroup.add(gltf.scene);
	// });

	// gltfLoader.load('assets/target.glb', (gltf) => {
	// 	for (let i = 0; i < 3; i++) {
	// 		const target = gltf.scene.clone();
	// 		target.position.set(
	// 			Math.random() * 10 - 5,
	// 			i * 2 + 1,
	// 			-Math.random() * 5 - 5,
	// 		);
	// 		scene.add(target);
	// 		targets.push(target);
	// 	}
	// });

	// scene.add(scoreText);
	// scoreText.position.set(0, 0.67, -1.44);
	// scoreText.rotateX(-Math.PI / 3.3);
	// updateScoreDisplay();

	// // Load and set up positional audio
	// const listener = new THREE.AudioListener();
	// camera.add(listener);

	// const audioLoader = new THREE.AudioLoader();
	// laserSound = new THREE.PositionalAudio(listener);
	// audioLoader.load('assets/laser.ogg', (buffer) => {
	// 	laserSound.setBuffer(buffer);
	// 	blasterGroup.add(laserSound);
	// });

	// scoreSound = new THREE.PositionalAudio(listener);
	// audioLoader.load('assets/score.ogg', (buffer) => {
	// 	scoreSound.setBuffer(buffer);
	// 	scoreText.add(scoreSound);
	// });
}

function onFrame(
	delta,
	time,
	{ scene, camera, renderer, player, controllers },
) {
	
}

init(setupScene, onFrame);
