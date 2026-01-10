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
const floorMaterial = new THREE.MeshStandardMaterial({ color: 'black' });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
var cubeRotation = 0
const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x89F336});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

function setupScene({ scene, camera, renderer, player, controllers }) {

	floor.rotateX(-Math.PI / 2);
	scene.add(floor);


	
	scene.add(cube);
	cube.position.set(-2, 1, -1.5);
	cube.rotateY((Math.PI / 4) + cubeRotation);

	const light = new THREE.PointLight(0x89F336, 20, 100, 0.1);
	light.position.copy(cube.position);
	scene.add(light);
}

function onFrame(
	delta,
	time,
	{ scene, camera, renderer, player, controllers }, 
) {
	cubeRotation += 2
	cube.rotateX(0.01)
	cube.rotateY (0.01)
}

init(setupScene, onFrame);
