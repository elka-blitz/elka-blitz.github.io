window.addEventListener('unload', function () {
  document.documentElement.innerHTML = '';
});   

import * as THREE from "three";

import { getController, getControllerGrip } from './controllerFunctions';

import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import  DeskButton  from "./DeskButtons.js";
import  DeskManager  from './DeskManager.js'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GamepadWrapper } from 'gamepad-wrapper';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Text } from 'troika-three-text';
import { TubePainter } from "three/examples/jsm/misc/TubePainter.js";
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { gsap } from 'gsap';

let camera, scene, renderer;
let stylus;
let gamepad1;
let gamepadInterface;
let isDrawing = false;
let prevIsDrawing = false;

let isMovingDesk = false;
let prevIsMovingDesk = false;

let wasChangeButton = false;

let blackPaint, redPaint, greenPaint, yellowPaint;
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

// UI
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
let deskCoords;
let tableGroup = new THREE.Group()
let prevBack = false
let backPushed = false
let desk_manager
let green = new THREE.Color('#0d9b00')

// Button stuff
let red_button;
let yellowButton;

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
	// UI text
	scene.add(UIText);
	UIText.position.set(0, 1, -2.5);
	UIText.rotateX(-Math.PI / 3.3);
	UIText.text = 'Tap desk with stylus to start'

	// Initialise desk manager
	desk_manager = new DeskManager(scene, tableGroup)

	// buttons
	red_button = new DeskButton(scene)
	red_button.createButton(new THREE.Vector3(0,0,0), '#b30000', 'Lock')

	yellowButton = new DeskButton(scene)
	yellowButton.createButton(new THREE.Vector3(0.5,0,0), '#359743', 'Change', 0.07)
	yellowButton.makeInvisible();

	// paints
	blackPaint = new TubePainter();
	blackPaint.mesh.material = blackMaterial;
	blackPaint.setSize(0.1);

	redPaint = new TubePainter();
	redPaint.mesh.material = redMaterial;
	redPaint.setSize(0.1);

	greenPaint = new TubePainter();
	greenPaint.mesh.material = greenMaterial;
	greenPaint.setSize(0.1);

	yellowPaint = new TubePainter();
	yellowPaint.mesh.material = yellowMaterial;
	yellowPaint.setSize(0.1);

	const paintArray = [blackPaint, redPaint, greenPaint, yellowPaint];

	scene.add(blackPaint.mesh);
	scene.add(redPaint.mesh);
	scene.add(greenPaint.mesh);
	scene.add(yellowPaint.mesh);

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

	  // desk lock event
	  if (red_button.returnExists() === true) {
		if (
			red_button.pressCheck(stylus.position, scene, 'white') === true &&
			!stylus.userData.isSelecting	// should reduce accidental pressing
		) {
			desk_manager.lock();
			scene.background = green;
			stylus.userData.painter = paintArray[0];
			deskCoords = desk_manager.getDeskCoordinates();
			yellowButton.makeVisible();
			desk_set = true;
		}
	}
	  // change material
	  if (yellowButton.returnExists() === true) {
		  if (yellowButton.pressCheckReusable(stylus.position, scene, "white") === true && !wasChangeButton) {
			  handleButton();
		  }
		  wasChangeButton = yellowButton.pressCheckReusable(stylus.position, scene, "white")
	  }

    prevIsMovingDesk = isMovingDesk;
		isMovingDesk = gamepad1.buttons[5].value > 0;


	// Desk setup logic: before allowing draw, desk must be set up
	if (prevIsMovingDesk && isMovingDesk && !desk_manager.getLock()) {
		if (!desk_manager.isDeskPositioned()) {
			// Desk fly-in
			desk_manager.slideToCamera(camera, stylus, tableGroup);

			// Hover button in front of user
			// Instead of doing offset
			red_button.hoverButtonByDesk(camera, desk_manager.getDesk(), scene);
			yellowButton.hoverButtonByDesk(camera, desk_manager.getDesk(), scene, 0.2);
		}
	}

	if (!prevIsMovingDesk && isMovingDesk && !desk_manager.getLock()) {
		tableGroup.traverse((child) => {
			if (child.material) {
				child.material.transparent = true;
				child.material.opacity = 0.5;
			}
		});
	}

	if (prevIsMovingDesk && !isMovingDesk) {
		tableGroup.traverse((child) => {
			if (child.material) {
				child.material.transparent = false 
				// child.material.opacity = 0.5
			}
		})
	}
  }

}

function animate() {
	UIText.sync()
	// if desk is locked, initiate ability to draw
	if (desk_set) {
		if (gamepad1) {
			prevIsDrawing = isDrawing;
			isDrawing = gamepad1.buttons[5].value > 0;
			// debugGamepad(gamepad1, gamepad1.buttons[5].pressed);

			if (isDrawing && !prevIsDrawing) {
				const painter = stylus.userData.painter;
				painter.moveTo(stylus.position);
			}
		}
		handleDrawing(stylus);

	}
	gsap.ticker.tick()
  // Render
  onFrame();
  renderer.render(scene, camera);
}

function handleDrawing(controller) {
  if (!controller) return;

  const userData = controller.userData;
  const painter = paintArray[shapeIndex];

  if (gamepad1) {
    cursor.set(stylus.position.x, stylus.position.y, stylus.position.z);
    if (userData.isSelecting || isDrawing) {
      painter.lineTo(cursor);
      painter.update();
    }
  }
}

function handleButton() {

	if (shapeIndex < paintArray.length - 1) {
		shapeIndex += 1;
		UIText.text = shapeIndex;
		paintArray.forEach((paint) => {
			paint.mesh.visible = false;
		});
		// shapeOutlineArray.forEach((outline) => {
		// 	outline.visible = false;
		// });

		paintArray[shapeIndex].mesh.visible = true;
		stylus.userData.painter = paintArray[shapeIndex];
		// shapeOutlineArray[shapeIndex].visible = true;
	} else {
		paintArray.forEach((paint) => {
			paint.mesh.visible = true;
		});
		// shapeOutlineArray.forEach((outline) => {
		// 	outline.visible = true;
		// });
	}
}

// controller functions
function onControllerConnected(e) {
  if (e.data.profiles.includes("logitech-mx-ink")) {
    stylus = e.target;
    stylus.userData.painter = paintArray[0];
    gamepad1 = e.data.gamepad;
	gamepadInterface = new GamepadWrapper(e.data.gamepad)
  }
}

function onSelectStart(e) {
  if (e.target !== stylus || !desk_set) return;

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
