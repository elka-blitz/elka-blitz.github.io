import * as THREE from "three";

import {
	getCircle,
	getCube,
	getFloor,
	getRect,
	getSquare,
} from './shapeFunctions';
import { getController, getControllerGrip } from './controllerFunctions';


import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GamepadWrapper } from 'gamepad-wrapper';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Text } from 'troika-three-text';
import { TubePainter } from "three/examples/jsm/misc/TubePainter.js";
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { createText } from 'three/examples/jsm/webxr/Text2D';

let camera, scene, renderer;
let stylus;
let gamepad1;
let gamepadInterface;
let isDrawing = false;
let prevIsDrawing = false;

let wasButtonEntered = false;

let squarePaint, circlePaint1, circlePaint2, rectPaint;
let shapeIndex = 0;

const yellowMaterial = new THREE.MeshBasicMaterial({
	color: 'yellow',
	wireframeLinewidth: '2',
});

const blackMaterial = new THREE.MeshBasicMaterial({
	color: 'black',
	wireframeLinewidth: '2',
});

const greenMaterial = new THREE.MeshBasicMaterial({
	color: 'green',
	wireframeLinewidth: '2',
});

const redMaterial = new THREE.MeshBasicMaterial({
	color: 'red',
	wireframeLinewidth: '2',
});

const cursor = new THREE.Vector3();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// cubes
const cubeButton = getCube(0.07, 0.05, 0.02, '#4B9639')



// Stylus info
let position = new THREE.Vector3();


// Cube Bounding box stuff
let boundingBoxButton = new THREE.Box3();

// Debugging stuff
let debugVar = true
const debugText = new Text();
debugText.fontsize = 0.52
debugText.font = 'assets/SpaceMono-Bold.ttf';
debugText.position.z = -2;
debugText.color = 0xffffff;
debugText.anchorX = 'center';
debugText.anchorY = 'middle';
debugText.text = 'LiveStylusCoords'

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

	const grid = new THREE.GridHelper(4, 1, 0x111111, 0x111111);
	scene.add(grid);

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


	// button
	scene.add(cubeButton)
	cubeButton.position.set(0.15, 1.55, -0.25)
	boundingBoxButton.setFromObject(cubeButton);

	const nextButtonText = createText('Next', 0.02);
	nextButtonText.position.set(0.15, 1.55, -0.235)
	scene.add(nextButtonText);



	// floor
	const floor = getFloor(6, 6, 'grey');
	floor.rotateX(-Math.PI / 2);
	scene.add(floor);

	// paints - might be able to make a loop
	squarePaint = new TubePainter();
	squarePaint.mesh.material = blackMaterial;
	squarePaint.setSize(0.1);

	circlePaint1 = new TubePainter();
	circlePaint1.mesh.material = redMaterial;
	circlePaint1.setSize(0.1);

	circlePaint2 = new TubePainter();
	circlePaint2.mesh.material = greenMaterial;
	circlePaint2.setSize(0.1);

	rectPaint = new TubePainter();
	rectPaint.mesh.material = yellowMaterial;
	rectPaint.setSize(0.1);

	const shapeArray = [squarePaint, circlePaint1, circlePaint2, rectPaint];

	scene.add(squarePaint.mesh);
	scene.add(circlePaint1.mesh);
	scene.add(circlePaint2.mesh);
	scene.add(rectPaint.mesh);

	// square shape
	const squareSize = 0.1
	const xPos = 0
	const yPos = 1.6 // this will have to be height adjusted
	const userDistance = -0.4
	const leanTowards = 0.01
	
	const square = getSquare(
		squareSize,
		xPos,
		yPos,
		userDistance,
		leanTowards,
		true,
		'white',
	);
	
	scene.add(square);
	
	const circle1 = getCircle(0.02);
	const circle2 = getCircle(0.02);
	scene.add(circle1)
	const distanceFromCenter = 0.06
	circle1.position.set(xPos - distanceFromCenter, yPos + 0.04, userDistance);
	
	scene.add(circle2)
	circle2.visible = true;
	circle2.position.set(xPos + distanceFromCenter, yPos + 0.04, userDistance);
	
	const rect = getRect(0.08, 0.02, xPos, yPos - 0.035, userDistance, 0, true, 'white')
	
	scene.add(rect);
	
	const shapeOutlineArray = [square, circle1, circle2, rect];
	
	shapeOutlineArray.forEach((shape, i) => {
		if (i !== 0) {
			shape.visible = false;
		}
})



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

});

// animation functions

function animate() {
	debugText.sync()
  if (gamepad1) {
    prevIsDrawing = isDrawing;
    isDrawing = gamepad1.buttons[5].value > 0;
    debugGamepad(gamepad1);
	try {
		if (boundingBoxButton.containsPoint(stylus.position) && !wasButtonEntered) {
			handleButton(stylus)
		}
		wasButtonEntered = boundingBoxButton.containsPoint(stylus.position);

	} catch (e) {
		console.log(e)
	}
    if (isDrawing && !prevIsDrawing) {
      const painter = stylus.userData.painter;
      painter.moveTo(stylus.position);
    }
  }

  handleDrawing(stylus);

  // Render
  // onFrame();
  renderer.render(scene, camera);
}

function handleDrawing(controller) {
  if (!controller) return;

  const userData = controller.userData;
  const painter = shapeArray[shapeIndex]

  if (gamepad1) {
    cursor.set(stylus.position.x, stylus.position.y, stylus.position.z);
	debugText.text = ('FindMyStylus 📍\n' + 'x: ' + Math.round(stylus.position.x * 100) + '\ny: ' + Math.round(stylus.position.y * 100) + '\nz: ' + Math.round(stylus.position.z * 100))
	// cube.color = adjustColor(0x478293, Math.sqrt( stylus.position.x*cube.position.x + stylus.position.y*cube.position.y ))
    if (userData.isSelecting || isDrawing) {
      painter.lineTo(cursor);
      painter.update();
    }
  }
}

function handleButton(controller) {
	if (!controller) return;

	if (shapeIndex < shapeOutlineArray.length - 1) {
		shapeIndex += 1;
		shapeArray.forEach((paint) => {
			paint.mesh.visible = false;
		});
		shapeOutlineArray.forEach((outline) => {
			outline.visible = false;
		});

		shapeArray[shapeIndex].mesh.visible = true;
		shapeOutlineArray[shapeIndex].visible = true;
	} else {
		shapeArray.forEach((paint) => {
			paint.mesh.visible = true;
		});
		shapeOutlineArray.forEach((outline) => {
			outline.visible = true;
		});
	}
}

// controller functions (for now these are in this file because they manipulate variables in this file, but we can probably figure out a way of moving them)
function onControllerConnected(e) {
  if (e.data.profiles.includes("logitech-mx-ink")) {
    stylus = e.target;
    stylus.userData.painter = shapeArray[0];
    gamepad1 = e.data.gamepad;
	gamepadInterface = new GamepadWrapper(e.data.gamepad)
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
