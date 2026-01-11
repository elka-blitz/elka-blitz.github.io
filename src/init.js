/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as THREE from 'three';

import { XRDevice, metaQuest3 } from 'iwer';

import { DevUI } from '@iwer/devui';
import { GamepadWrapper } from 'gamepad-wrapper';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let stylus;
let painter1;
let gamepad1;
let isDrawing = false;
let prevIsDrawing = false;

const material = new THREE.MeshNormalMaterial({
  flatShading: true,
  side: THREE.DoubleSide,
});

const cursor = new THREE.Vector3();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

export async function init(setupScene = () => {}, onFrame = () => {}) {
	// iwer setup
	const canvas = document.querySelector("canvas.webgl");
	let nativeWebXRSupport = false;
	if (navigator.xr) {
		nativeWebXRSupport = await navigator.xr.isSessionSupported('immersive-vr');
	}
	if (!nativeWebXRSupport) {
		const xrDevice = new XRDevice(metaQuest3);
		xrDevice.installRuntime();
		xrDevice.fovy = (75 / 180) * Math.PI;
		xrDevice.ipd = 0;
		window.xrdevice = xrDevice;
		xrDevice.controllers.right.position.set(0.15649, 1.43474, -0.38368);
		xrDevice.controllers.right.quaternion.set(
			0.14766305685043335,
			0.02471366710960865,
			-0.0037767395842820406,
			0.9887216687202454,
		);
		xrDevice.controllers.left.position.set(-0.15649, 1.43474, -0.38368);
		xrDevice.controllers.left.quaternion.set(
			0.14766305685043335,
			0.02471366710960865,
			-0.0037767395842820406,
			0.9887216687202454,
		);
		new DevUI(xrDevice);
	}

	const container = document.createElement('div');
	document.body.appendChild(container);

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x178787);

	const camera = new THREE.PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.1,
		100,
	);
	camera.position.set(0, 1.6, 3);

	const controls = new OrbitControls(camera, container);
	controls.target.set(0, 1.6, 0);
	controls.update();

	const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.xr.enabled = true;
	renderer.setAnimationLoop(animate);
	container.appendChild(renderer.domElement);

	const environment = new RoomEnvironment(renderer);
	const pmremGenerator = new THREE.PMREMGenerator(renderer);
	scene.environment = pmremGenerator.fromScene(environment).texture;

	const player = new THREE.Group();
	scene.add(player);
	player.add(camera);

	const controllerModelFactory = new XRControllerModelFactory();
	controller1 = renderer.xr.getController(0);
	controller1.addEventListener("connected", onControllerConnected);
	controller1.addEventListener("selectstart", onSelectStart);
	controller1.addEventListener("selectend", onSelectEnd);
	controllerGrip1 = renderer.xr.getControllerGrip(0);
	controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
	scene.add(controllerGrip1);
	scene.add(controller1);

	controller2 = renderer.xr.getController(1);
	controller2.addEventListener("connected", onControllerConnected);
	controller2.addEventListener("selectstart", onSelectStart);
	controller2.addEventListener("selectend", onSelectEnd);
	controllerGrip2 = renderer.xr.getControllerGrip(1);
	controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
	scene.add(controllerGrip2);
	scene.add(controller2);

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	window.addEventListener('resize', onWindowResize);

	const globals = {
		scene,
		camera,
		renderer,
		player,
	};

	setupScene(globals);

	function animate() {

		if (gamepad1) {
			prevIsDrawing = isDrawing;
			isDrawing = gamepad1.buttons[5].value > 0;
			// debugGamepad(gamepad1);

			if (isDrawing && !prevIsDrawing) {
			const painter = stylus.userData.painter;
			painter.moveTo(stylus.position);
			}
		}

		handleDrawing(stylus);	

		renderer.render(scene, camera);
	}

	renderer.setAnimationLoop(animate);

	document.body.appendChild(VRButton.createButton(renderer));
}

function handleDrawing(controller) {
  if (!controller) return;

  const userData = controller.userData;
  const painter = userData.painter;

  if (gamepad1) {
    cursor.set(stylus.position.x, stylus.position.y, stylus.position.z);

    if (userData.isSelecting || isDrawing) {
      painter.lineTo(cursor);
      painter.update();
    }
  }
}

function onControllerConnected(e) {
  if (e.data.profiles.includes("logitech-mx-ink")) {
    stylus = e.target;
    stylus.userData.painter = painter1;
    gamepad1 = e.data.gamepad;
  }
}

function onSelectStart(e) {
  if (e.target !== stylus) return;
  const painter = stylus.userData.painter;
  painter.moveTo(stylus.position);
  this.userData.isSelecting = true;
}

function onSelectEnd() {
  this.userData.isSelecting = false;
}

function debugGamepad(gamepad) {
  gamepad.buttons.forEach((btn, index) => {
    if (btn.pressed) {
      console.log(`BTN ${index} - Pressed: ${btn.pressed} - Touched: ${btn.touched} - Value: ${btn.value}`);
    }

    if (btn.touched) {
      console.log(`BTN ${index} - Pressed: ${btn.pressed} - Touched: ${btn.touched} - Value: ${btn.value}`);
    }
  });
}
