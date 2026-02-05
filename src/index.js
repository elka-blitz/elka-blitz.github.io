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
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { Text } from 'troika-three-text';
import { TubePainter } from "three/examples/jsm/misc/TubePainter.js";
import UIText from "./UIText.js";
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';
import { createText } from 'three/examples/jsm/webxr/Text2D';
import { gsap } from 'gsap';   
import { update } from "three/examples/jsm/libs/tween.module.js";

let camera, scene, renderer;
let stylus;
let gamepad1;
let gamepadInterface;
let isDrawing = false;
let prevIsDrawing = false;

let isMovingDesk = false;
let prevIsMovingDesk = false;

let wasChangeButton = false;
let paint1, paint2, paint3, paint4, paint5, paint6, paint7, paint8;
let svgPaintsArray = [paint1, paint2, paint3, paint4, paint5, paint6, paint7, paint8]
let shapeIndex = 0;

const yellowMaterial = new THREE.LineBasicMaterial({
	color: 'yellow',
	linewidth: 5,
});

const blackMaterial = new THREE.LineBasicMaterial({
	color: 'black',
	linewidth: 4,
});

const greenMaterial = new THREE.MeshBasicMaterial({
	color: 'green',
	wireframeLinewidth: '2',
});

const redMaterial = new THREE.LineBasicMaterial({
	color: 'red',
	linewidth: 3,
});

const blueMaterial = new THREE.MeshBasicMaterial({
	color: 'blue',
	wireframeLinewidth: '2',
});

const whiteMaterial = new THREE.MeshBasicMaterial({
	color: 'white',
	wireframeLinewidth: '2',
});

const purpleMaterial = new THREE.MeshBasicMaterial({
	color: 'purple',
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

// Debugging stuff
let debugVar = true
let interface_text;
// const UIText = new Text();
// UIText.fontsize = 0.52
// UIText.font = 'assets/SpaceMono-Bold.ttf';
// UIText.position.z = -2;
// UIText.color = 0xffffff;
// UIText.anchorX = 'center';
// UIText.anchorY = 'middle';
// UIText.text = 'LiveStylusCoords'
// UIText declarations
// TODO: Remember sync method
// TODO: Move to function call

// Desk stuff
let desk_set = false
let tableGroup = new THREE.Group()
let desk_manager
let green = new THREE.Color('#80ed99');
let desk_locked = false // Global main process variable, so desklock check method is only run once
let prev_desk_locked = false

// Button stuff
// if adding button to table, don't forget to call hoverButtonByDesk and use offset parameters to move relative to it
let red_button;
let nextButton;

// Noise feedback declaration
const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();
let scoreSound;
let laserSound;

laserSound = new THREE.PositionalAudio(listener);
audioLoader.load('assets/laser.ogg', (buffer) => {
	laserSound.setBuffer(buffer);
});

scoreSound = new THREE.PositionalAudio(listener);
audioLoader.load('assets/score.ogg', (buffer) => {
	scoreSound.setBuffer(buffer);
});

init();

function init() {
	// scene setup
	scene = new THREE.Scene();
	scene.background = new THREE.Color('#38a3a5');
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

	tableGroup.position.set(0, -3, 0)

	red_button = new DeskButton(scene)
	red_button.createButton(new THREE.Vector3(0,0,0), '#b30000', 'Lock')
	
	// red_button.moveButton(new THREE.Vector3(0,2,1))
	// red_button.placeButton(new THREE.Vector3(0,2,1), scene)
	// console.log('result', desk_manager.getPositionForButton())

	// tableGroup.add(red_button_object)
	// red_button.moveButton(new THREE.Vector3(-0.25,-0.25,-0.25))
	
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
	renderer.shadowMap.enabled = true;
	renderer.xr.enabled = true;

	document.body.appendChild(VRButton.createButton(renderer));
	renderer.setAnimationLoop(animate);

	// controller setup
	const controllerModelFactory = new XRControllerModelFactory();
	scene.add(getControllerGrip(0, renderer, controllerModelFactory));
	scene.add(getController(0, renderer, onControllerConnected, onSelectStart, onSelectEnd));

	scene.add(getControllerGrip(1, renderer, controllerModelFactory));
	scene.add(getController(1, renderer, onControllerConnected, onSelectStart, onSelectEnd,),);

	// Add text initialisation
	interface_text = new UIText(scene)
}
	// Debugging text
	// scene.add(UIText);
	// UIText.position.set(0, 1, -2.5);
	// UIText.rotateX(-Math.PI / 3.3);
	// UIText.text = 'Tap desk with stylus to start'
	// TODO: Replace with class method call
	

	// Initialise desk manager
	desk_manager = new DeskManager(scene, tableGroup)

	// buttons
	red_button = new DeskButton(scene)
	red_button.createButton(new THREE.Vector3(0,0,0), '#b30000', 'Lock')

	nextButton = new DeskButton(scene)
	nextButton.createButton(new THREE.Vector3(0,0,0), '#359743', 'Next', 0.07)
	nextButton.makeInvisible();



	svgPaintsArray.forEach((paint, i) => {
		svgPaintsArray[i] = new TubePainter();
		svgPaintsArray[i].mesh.material = blackMaterial;
		svgPaintsArray[i].setSize(0.2);
		scene.add(svgPaintsArray[i].mesh);
	})

	const paintArray = svgPaintsArray;


	const svgArray = [
		'assets/banner_long.svg',
		'assets/window.svg',
		'assets/window2.svg',
		'assets/window_curtain.svg',
		'assets/banner_short.svg',
		'assets/door_bottom.svg',
		'assets/door_top.svg',
		'assets/base.svg'
	]

	loadSVG(svgArray[0]);

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


	// Animation method cleanup
	gsap.ticker.remove(gsap.updateRoot);

	interface_text.updateText('Resized window to: ' + sizes.width + 'x' + sizes.height)
});


// animation functions
function onFrame(timestamp, frame) {

	desk_locked = desk_manager.getLock() // Run once and used variable for desklock check, avoids running method multiple times
	if (!desk_locked) {
		// Smooth text animation to camera, prompting user to lock desk
		interface_text.updateText('Tap desk with stylus to lock')
		interface_text.animateTextToCamera(camera)
	}
	else if (desk_locked && !prev_desk_locked) {
		// Desk has just been locked, run fly-in animation and text update
		// This code runs once when the desk is locked, and uses the prev_desk_locked variable to check if the desk lock state has just changed
		interface_text.updateText('Desk Locked!')

		// Locate text permanently above desk for remainder of session
		interface_text.positionTextRelativeToDesk(desk_manager.getDesk())
	}

	prev_desk_locked = desk_locked // Framediff for desk lock check

	interface_text.sync()

  if (gamepad1) {

	  // desk lock event
	  if (red_button.returnExists() === true) {
		if (
			red_button.pressCheck(stylus.position, scene, 'white') === true &&
			gamepadInterface.getHapticActuator(0).pulse(1.0, 200); // Haptic line - intensity and duration
			laserSound.play(); // Sound effect for button press
			// TODO: Find click .ogg sound file to use instead of a laser sound
			!stylus.userData.isSelecting	// should reduce accidental pressing
		) {
			desk_manager.lock();
			desk_manager.spawnDrawingSurface()
			scene.background = green;
			stylus.userData.painter = paintArray[0];
			nextButton.makeVisible();
			desk_set = true;
			UIText.text = "Draw on the outline!";
		}
	}
	  // change material
	  if (nextButton.returnExists() === true) {
		  if (nextButton.pressCheckReusable(stylus.position, scene, "white") === true && !wasChangeButton) {
			  handleButton();
		  }
		  wasChangeButton = nextButton.pressCheckReusable(stylus.position, scene, "white")
	  }

	  //  // todo: this is for testing in browser
	  // if (gamepad1.buttons[5].pressed && !wasChangeButton) {
		//   handleButton()
		//   nextButton.makeVisible();
		//   nextButton.hoverButtonByDesk(camera, desk_manager.getDesk(), scene, 0.3, 0.2);
		//
	  // }
	  // wasChangeButton = gamepad1.buttons[5].pressed;


    prevIsMovingDesk = isMovingDesk;
		isMovingDesk = gamepad1.buttons[5].value > 0;


	// Desk setup logic: before allowing draw, desk must be set up
	if (prevIsMovingDesk && isMovingDesk && !desk_locked) {
		if (!desk_manager.isDeskPositioned()) {
			// Desk fly-in
			desk_manager.slideToCamera(camera, stylus, tableGroup);

			// Hover button in front of user
			// Instead of doing offset
			red_button.hoverButtonByDesk(camera, desk_manager.getDesk(), scene);
			nextButton.hoverButtonByDesk(
				camera,
				desk_manager.getDesk(),
				scene,
				0.3,
				0.2
			);
			interface_text.animateTextToCamera(camera)
		}
	}

	if (!prevIsMovingDesk && isMovingDesk && !desk_locked) {
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

	prevBack = backPushed
	backPushed = gamepad1.buttons[1].value > 0

	if (backPushed && !prevBack && desk_locked) {
		// Back button on controller
		// TODO: Add commented framediff for every button on controller
		laserSound.play();	
		interface_text.flashText('#ff0000', 100) 
	}
  }

}

function animate() {
	// UIText.sync()
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

	if (shapeIndex < svgArray.length - 1) {
		shapeIndex += 1;
		paintArray.forEach((paint) => {
			paint.mesh.visible = false;
		});
		desk_manager.clearSurface();
		loadSVG(svgArray[shapeIndex]);

		paintArray[shapeIndex].mesh.visible = true;
		stylus.userData.painter = paintArray[shapeIndex];

	} else {
		desk_manager.clearSurface();
		nextButton.makeInvisible();
		const deskCoords = desk_manager.getDeskCoordinates();

		paintArray.forEach((paint) => {
			// paint.mesh.position.set(
			// 	deskCoords.x,
			// 	deskCoords.y + 0.1,SSS
			// 	deskCoords.z - 0.2,
			// );

			paint.mesh.visible = true;
		});
	}
}

// controller functions
function onControllerConnected(e) {
  if (e.data.profiles.includes("logitech-mx-ink")) {
    stylus = e.target;
    stylus.userData.painter = paintArray[0];
    gamepad1 = e.data.gamepad;
	gamepadInterface = new GamepadWrapper(e.data.gamepad)

	//   // todo this is temporary for placing drawing area in browser testing
	// desk_manager.slideToFront(camera, stylus, tableGroup);
	//   desk_manager.lock();
	//   desk_set = true;
	//   desk_manager.spawnDrawingSurface()


  }
  // todo else do raycasting
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

// svg function
function loadSVG(url) {
	const loader = new SVGLoader();

	loader.load(url, function (data) {
		const group = new THREE.Group();

		let renderOrder = 0;

		for (const path of data.paths) {
			const strokeColor = path.userData.style.stroke;

			const material = new THREE.MeshBasicMaterial({
				// color: new THREE.Color().setStyle(strokeColor),
				color: "black",
				opacity: path.userData.style.strokeOpacity,
				transparent: true,
				side: THREE.DoubleSide,
				depthWrite: false,
			});

			for (const subPath of path.subPaths) {
				const geometry = SVGLoader.pointsToStroke(
					subPath.getPoints(),
					path.userData.style,
				);
				geometry.rotateZ( Math.PI ) // rotate right side up

				if (geometry) {
					const mesh = new THREE.Mesh(geometry, material);
					mesh.renderOrder = renderOrder++;

					group.add(mesh);
				}
			}
		}

		desk_manager.placeSVG(group)
	});
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
