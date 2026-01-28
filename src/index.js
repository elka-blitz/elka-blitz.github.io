import * as THREE from "three";

import { getController, getControllerGrip } from './controllerFunctions';
import {
	getCube,
	getDashedLine,
	getFloor,
	getSquare,
} from './shapeFunctions';

import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import DeskButton from "./DeskButtons.js";
import DeskManager from './DeskManager.js'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GamepadWrapper } from 'gamepad-wrapper';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Text } from 'troika-three-text';
import { TubePainter } from "three/examples/jsm/misc/TubePainter.js";
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { gsap } from 'gsap';   
import { update } from "three/examples/jsm/libs/tween.module.js";

let camera, scene, renderer;
let stylus;
let gamepad1;
let gamepadInterface;
let isDrawing = false;
let prevIsDrawing = false;
let painter1;

const material = new THREE.MeshNormalMaterial({
  flatShading: true,
  side: THREE.DoubleSide,
});

const cursor = new THREE.Vector3();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// cubes
const cube = getCube(0.5, 0.5, 0.5, '#27F527');
const cube2 = getCube(0.3, 0.3, 0.3, '#F54927');
const cube3 = getCube(0.5, 0.3, 0.5, '#27e7f5ff');

// Stylus info
let position = new THREE.Vector3();

// Debugging stuff
let debugVar = true
const UIText = new Text();
UIText.fontsize = 0.52
UIText.font = 'assets/SpaceMono-Bold.ttf';
UIText.position.z = -2;
UIText.color = 0xffffff;
UIText.anchorX = 'center';
UIText.anchorY = 'middle';
UIText.text = 'LiveStylusCoords'

// Desk stuff
let desk_set = false
let tableGroup = new THREE.Group()
let prevBack = false
let backPushed = false
let desk_manager

// Button stuff
let red_button;
let white_button;

init();

function init() {
	// scene setup
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x1f0091);
	camera = new THREE.PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.01,
		50,
	);

	camera.position.set(0, 1.6, 3);
	const canvas = document.querySelector('canvas.webgl');

	const controls = new OrbitControls(camera, canvas);
	controls.target.set(0, 1.6, 0);
	controls.update();

	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath('/draco/');

	const gltfLoader = new GLTFLoader();
	gltfLoader.setDRACOLoader(dracoLoader);

	gltfLoader.load('./assets/Desk.glb', (gltf) => {
		tableGroup.add(gltf.scene);
	});

	scene.add(tableGroup)

	// Initialise desk manager
	desk_manager = new DeskManager(scene, tableGroup)

	tableGroup.position.set(0, 0, -3)

	red_button = new DeskButton(scene)
	red_button.createButton(new THREE.Vector3(0,0,0), '#b30000')
	red_button.moveButton(new THREE.Vector3(-0.25,-0.25,-0.25))

	// white_button = new DeskButton(scene)
	// white_button.createButton(new THREE.Vector3(1,1,1), '#ffffff')
	// white_button.moveButton(new THREE.Vector3(0.25,0.25,0.25))

	scene.add(new THREE.HemisphereLight(0x888877, 0x777788, 3));

	const light = new THREE.DirectionalLight(0xffffff, 1.5);
	light.position.set(0, 4, 0);
	scene.add(light);

	const player = new THREE.Group();
	scene.add(player);
	player.add(camera);

	// rendering setup
	renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
	renderer.setPixelRatio(window.devicePixelRatio, 2);
	renderer.setSize(sizes.width, sizes.height);

	renderer.xr.enabled = true;

	document.body.appendChild(VRButton.createButton(renderer));
	renderer.setAnimationLoop(animate);


	// controller setup
	const controllerModelFactory = new XRControllerModelFactory();
	scene.add(getControllerGrip(0, renderer, controllerModelFactory));
	scene.add(getController(0, renderer, onControllerConnected, onSelectStart, onSelectEnd));

	scene.add(getControllerGrip(1, renderer, controllerModelFactory));
	scene.add(getController(1, renderer, onControllerConnected, onSelectStart, onSelectEnd,),);
}
	// Debugging text
	scene.add(UIText);
	UIText.position.set(0, 1, -2.5);
	UIText.rotateX(-Math.PI / 3.3);
	UIText.text = 'Tap desk with stylus to start'

	// drawing paint
	painter1 = new TubePainter();
	painter1.mesh.material = material;
	painter1.setSize(0.1);

	scene.add(painter1.mesh);

	// // square shape
	// const squareSize = 0.4
	// const xPos = 0
	// const yPos = 1.6 // this will have to be height adjusted
	// const userDistance = -0.2
	// const leanTowards = 0.05

	// scene.add(getSquare(squareSize, xPos, yPos, userDistance, leanTowards, true, 'white'));

	window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

	gsap.ticker.remove(gsap.updateRoot);

	// desk_manager.spawnDrawingAreaOnDesk(0.5, 0.5, 0.5, '#ffffff')
});


// animation functions
function onFrame(timestamp, frame) {


  if (gamepad1) {

	if (red_button.returnExists() == true) {
		red_button.pressCheck(stylus.position)	
	}

	// if (cylinder_bb.containsPoint(stylus.position)) {
	// 	console.log('Secondary buttonpress')
	// }
	// desk_manager.updateButton(stylus.position)

	// if (this.scene.getObjectByProperty('uuid', desk_manager.getButton()).containsPoint(stylus.position)) {

	

	if (desk_manager.isDeskPositioned()) {
		desk_manager.updateButton(stylus.position)
	}

    prevIsDrawing = isDrawing;
    isDrawing = gamepad1.buttons[5].value > 0;
	// Before allowing draw, desk must be set up
	if (prevIsDrawing && isDrawing ){
		if (!desk_manager.isDeskPositioned()) {
			// Desk fly-in
			desk_manager.slideToCamera(camera, stylus, tableGroup)
		}
	}



	if (!prevIsDrawing && isDrawing) {
		tableGroup.traverse((child) => {
			if (child.material) {
				child.material.transparent = true
				child.material.opacity = 0.5
			}
		})
	}

	if (prevIsDrawing && !isDrawing) {
		tableGroup.traverse((child) => {
			if (child.material) {
				child.material.transparent = false 
				// child.material.opacity = 0.5
			}
		})
	}

	prevBack = backPushed
	backPushed = gamepad1.buttons[1].value > 0

	if (prevBack && !backPushed) { 
		// desk_manager.slideToCamera(camera, stylus, tableGroup)
		red_button.createButton(stylus.position, '#ffffff')

		// desk_manager.spawnDrawingAreaOnDesk(0.5, 0.5, 0.5, '#ffffff')
	}

  }

}

function animate() {
	UIText.sync()
//   handleDrawing(stylus);
	gsap.ticker.tick()
  // Render
  onFrame();
  renderer.render(scene, camera);
}

function handleDrawing(controller) {
  if (!controller) return;

  const userData = controller.userData;
  const painter = userData.painter;

  if (gamepad1) {
    cursor.set(stylus.position.x, stylus.position.y, stylus.position.z);
	// debugText.text = ('FindMyStylus 📍\n' + 'x: ' + Math.round(stylus.position.x * 100) + '\ny: ' + Math.round(stylus.position.y * 100) + '\nz: ' + Math.round(stylus.position.z * 100))
	// cube.color = adjustColor(0x478293, Math.sqrt( stylus.position.x*cube.position.x + stylus.position.y*cube.position.y ))
    if (userData.isSelecting || isDrawing) {
      painter.lineTo(cursor);
      painter.update();
    }
  }
}

// controller functions (for now these are in this file because they manipulate variables in this file, but we can probably figure out a way of moving them)
function onControllerConnected(e) {
  if (e.data.profiles.includes("logitech-mx-ink")) {
    stylus = e.target;
    stylus.userData.painter = painter1;
    gamepad1 = e.data.gamepad;
	gamepadInterface = new GamepadWrapper(e.data.gamepad)
  }
}

function onSelectStart(e) {

//   if (e.target !== stylus) return;
	if (desk_set) {
		const painter = stylus.userData.painter;
		painter.moveTo(stylus.position);
		this.userData.isSelecting = true;
	}
	else {
		return
	}
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
