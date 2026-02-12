
/*
File structure:
	- event listeners
	- imports
	- declarations
	- init function
	- onFrame function (events)
	- animate function (drawing)
	- handleDrawing
	- handleButton
	- controller functions (onControllerConnected, onSelectStart, onSelectEnd
	- loadSVG
	- debugGamepad
*/

// event listeners
window.addEventListener('unload', function () {
  document.documentElement.innerHTML = '';
});

window.addEventListener('resize', () => {
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

	interface_text.updateText(
		'Resized window to: ' + sizes.width + 'x' + sizes.height,
	);
});

import * as THREE from "three";

import { TextPanel, UIText } from './UIText.js';
import { csvMaker, downloadCSV } from './csvFunctions';
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
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';
import { createText } from 'three/examples/jsm/webxr/Text2D';
import { getFilledRect } from './shapeFunctions';
import { gsap } from 'gsap';   
import questionnaireManager from './questionnaireManager.js'
import { update } from "three/examples/jsm/libs/tween.module.js";

const BROWSER_TESTING = false // todo remove before deployment
let BROWSER_buttonPressed = false;

// setup declarations
let camera, scene, renderer;
let stylus;
let gamepad1;
let gamepadInterface;
let contextText, task1Text;
const cursor = new THREE.Vector3();
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};


// drawing declarations
let isDrawing = false;
let prevIsDrawing = false;
let paint1, paint2, paint3, paint4, paint5, paint6, paint7, paint8, practice1, practice2, practice3;
let svgPaintsArray = [paint1, paint2, paint3, paint4, paint5, paint6, paint7, paint8];
let practicePaints = [practice1, practice2, practice3];
let isDrawingDisabled = false;

// todo organise this into a class or something
const coloursArray = [
	'red',
	'orange',
	'yellow',
	'green',
	'blue',
	'cyan',
	'purple',
];

const svgArray = [
	'assets/base.svg',
	'assets/door_bottom.svg',
	'assets/door_top.svg',
	'assets/window.svg',
	'assets/window2.svg',
	'assets/window_curtain.svg',
	'assets/banner_short.svg',
	'assets/banner_long.svg',
];

const practiceSvgArray = [
	'assets/window.svg',
	'assets/door_top.svg',
	'assets/window_curtain.svg',
];

const svgWithPositionsArray = [
	{ url: 'assets/base.svg', position: { x: 0, y: 0 } },
	{ url: 'assets/door_bottom.svg', position: { x: -0.05, y: 0.06 } },
	{ url: 'assets/door_top.svg', position: { x: -0.05, y: -0.015 } },
	{ url: 'assets/window.svg', position: { x: 0.04, y: -0.02 } },
	{ url: 'assets/window2.svg', position: { x: 0.04, y: 0.03 } },
	{ url: 'assets/window_curtain.svg', position: { x: 0.04, y: -0.025 } },
	{ url: 'assets/banner_short.svg', position: { x: 0, y: -0.08 } },
	{ url: 'assets/banner_long.svg', position: { x: 0, y: -0.075 } },
];

let wasChangeButton = false;
let shapeIndex = -1;	// workaround for the way i've done the task flow
let practiceShapeIndex = 0;
const CENTER_POSITION = {x: 0, y : 0};

let isPracticeMode = false;

// Stylus info
let position = new THREE.Vector3();

// Debugging stuff
let debugVar = true
let interface_text;

// Desk declarations
let isMovingDesk = false;
let prevIsMovingDesk = false;
let desk_set = false
let tableGroup = new THREE.Group()
let backPushed = false
let prevBackPushed = false
let desk_manager
let green = new THREE.Color('#80ed99');
let desk_locked = false // Global main process variable, so desklock check method is only run once
let prev_desk_locked = false

// MARK: Buttons
// if adding button to table, don't forget to call hoverButtonByDesk and use offset parameters to move relative to it
let red_button;
let nextButton;

// MARK: Sounds
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


// MARK: Environment
let office_group = new THREE.Group()


// MARK: Hands
let hand1, hand2;
const handModels = {
	left: null,
	right: null
};

// Keep references to hand models that persist
const persistentHandModels = {
  left: null,
  right: null
};

// MARK: Questionnaire
let question_panel;

let debugging_text;

let controllerGrip1, controllerGrip2;

let mx_ink_connected = false; 
let left_hand_override = false; 
let right_hand_override = false; 
const left_hand_container = new THREE.Group();
const right_hand_container = new THREE.Group();

let logData = []

init();

function init() {
	// MARK: Scene Setup
	scene = new THREE.Scene();
	scene.background = new THREE.Color('#38a3a5');
	camera = new THREE.PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.01,
		50,
	);

	camera.position.set(0, 1.6, 3);

	const player = new THREE.Group();
	scene.add(player);
	player.add(camera);

	const canvas = document.querySelector('canvas.webgl');

	const controls = new OrbitControls(camera, canvas);
	controls.target.set(0, 1.6, 0);
	controls.update();

	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath(
		'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/libs/draco/',
	);

	const gltfLoader = new GLTFLoader();
	gltfLoader.setDRACOLoader(dracoLoader);

	gltfLoader.load('./assets/Desk.glb', (gltf) => {
		tableGroup.add(gltf.scene);
	});

	gltfLoader.load(
		'./assets/office_environment.glb',
		function (gltf) {
			office_group.add(gltf.scene);
		},
		undefined,
		function (error) {
			console.error(error);
		},
	);

	// MARK: Model setup
	scene.add(tableGroup)
	scene.add(office_group)

	// MARK: Desk
	desk_manager = new DeskManager(scene, tableGroup)


	// office_group.scale.set(0.5, 0.5, 0.5)
	office_group.position.set(0, -0.3, 0)
	office_group.rotateY(Math.PI / 5)

	tableGroup.position.set(0, -3, 0)


	// MARK: Panel
	question_panel = new questionnaireManager(scene, camera, tableGroup) // Load assetes on class initialisation
	question_panel.setQuestionnaireVisibility(false) // Initially set the questionnaire to be invisible until desk is locked in place

	scene.add(new THREE.HemisphereLight(0x888877, 0x777788, 3));
	const light = new THREE.DirectionalLight(0xffffff, 1.5);
	light.position.set(0, 4, 0);
	scene.add(light);

	// Initialise desk manager
	desk_manager = new DeskManager(scene, tableGroup);

	tableGroup.position.set(0, -3, 0);
	office_group.position.set(0, -0.3, 0);
	office_group.rotateY(Math.PI / 5);

	// rendering setup
	renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
	renderer.setPixelRatio(window.devicePixelRatio, 2);
	renderer.setSize(sizes.width, sizes.height);
	renderer.shadowMap.enabled = true;
	renderer.xr.enabled = true;

	// MARK: Session Init
	const sessionInit = {
		requiredFeatures: ['hand-tracking'],
	};

	document.body.appendChild(VRButton.createButton(renderer, sessionInit));

	// MARK: Key Input
	// Keyboard buttonpress listener for testing in browser
	document.addEventListener('keydown', function(event) {
		switch (event.keyCode) {
			case 87: // W
				question_panel.moveInputCubesDown();	
				break;
			case 65: // A
			 	question_panel.resetInputCubes();
				break;
		}
	});

	renderer.setAnimationLoop(animate);

	// controller setup
	const controllerModelFactory = new XRControllerModelFactory();

	const handModelFactory = new XRHandModelFactory();

	controllerGrip1 = getControllerGrip(0, renderer, controllerModelFactory);
	scene.add(controllerGrip1);
	scene.add(
		getController(
			0,
			renderer,
			onControllerConnected,
			onSelectStart,
			onSelectEnd,
		),
	);

	controllerGrip2 = getControllerGrip(1, renderer, controllerModelFactory);
	scene.add(controllerGrip2);
	scene.add(
		getController(
			1,
			renderer,
			onControllerConnected,
			onSelectStart,
			onSelectEnd,
		),
	);

	// MARK: Hand Setup
	hand1 = renderer.xr.getHand(0);

	let leftHandModel = handModelFactory.createHandModel(hand1, 'boxes');
	hand1.add(leftHandModel);
	left_hand_container.add(hand1);
	scene.add(left_hand_container);

	// Hand 2
	hand2 = renderer.xr.getHand(1);

	let rightHandModel = handModelFactory.createHandModel(hand2, 'boxes');
	hand2.add(rightHandModel);
	right_hand_container.add(hand2);
	scene.add(right_hand_container);

	// Add text initialisation
	interface_text = new UIText(scene);

	const contextTextStr =
		'You are an architect designing buildings for the city.' +
		'\nYour co-worker Sandra is sick and now you have to deal with all her impatient clients.' +
		'\nThe three clients want to build a bakery, a studio and a library.' +
		'\n\nPlease go ahead and draw some practice shapes. After that the tasks will begin. Good luck!';

	const task1TextStr = 'Task 1: The Bakery';

	contextText = new TextPanel(scene, contextTextStr, 0, 1.6, 1.5, 0.6, 1.5);
	task1Text = new TextPanel(scene, task1TextStr, 0, 1.6, 1, 0.3, 1.5);

	// Initialise desk manager
	desk_manager = new DeskManager(scene, tableGroup);

	// buttons
	red_button = new DeskButton(scene);
	red_button.createButton(new THREE.Vector3(0, 0, 0), '#b30000', 'Lock');
	red_button.makeInvisible();

	nextButton = new DeskButton(scene);
	nextButton.createButton(new THREE.Vector3(0, 0, 0), '#ff7300', 'Practice 0/3', 0.07);
	nextButton.makeInvisible();

	// drawing
	svgPaintsArray.forEach((paint, i) => {
		svgPaintsArray[i] = new TubePainter();
		svgPaintsArray[i].mesh.material = new THREE.LineBasicMaterial({
			color: coloursArray[i],
			linewidth: 4,
		});
		svgPaintsArray[i].setSize(0.2);
		scene.add(svgPaintsArray[i].mesh);
	});

	practicePaints.forEach((paint, i) => {
		practicePaints[i] = new TubePainter();
		practicePaints[i].mesh.material = new THREE.LineBasicMaterial({
			color: coloursArray[i],
			linewidth: 4,
		});
		practicePaints[i].setSize(0.2);
		scene.add(practicePaints[i].mesh);
	});

}


// MARK: OnFrame
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
		interface_text.updateText('')

		// Locate text permanently above desk for remainder of session
		interface_text.positionTextRelativeToDesk(desk_manager.getDesk())
	}

	prev_desk_locked = desk_locked // Framediff for desk lock check

	interface_text.sync()

	// MARK: Gamepad Condition
	if (gamepad1) {

	// Stylus logging
	// Get positional data for timestamp
	logData.push({
		t: Date.now(),
		s: stylus ? stylus.position.clone() : null,
		// deskLocked: desk_locked
		// TODO: Buttonpushed variable
	});
	
	  // desk lock event		calibration > practice mode
	  if (red_button.returnExists() === true) {
		if (
			red_button.pressCheck(stylus.position, scene, 'white') === true
		) {
			desk_manager.lock();
			isPracticeMode = true;
			desk_manager.spawnDrawingSurface();
			scene.background = green;
			red_button.makeInvisible();
			nextButton.makeVisible();
			desk_set = true;
			interface_text.updateText("Draw on the outline!");
			contextText.makeVisible();
			loadSVG(practiceSvgArray[0], CENTER_POSITION);
			stylus.userData.painter = practicePaints[0];

				interface_text.flashText('#059400', 100); // Flash text briefly #user feedback
				gamepadInterface.getHapticActuator(0).pulse(1.0, 200); // Haptic line - intensity and duration
				laserSound.play(); // Sound effect for button press
				// TODO: Find click .ogg sound file to use instead of a laser sound
			}
		}

		question_panel.inputChecker(stylus.position)

	  // change material
	  if (nextButton.returnExists() === true) {
		  if (nextButton.pressCheckReusable(stylus.position, scene, "white") === true && !wasChangeButton) {
			  handleButton();
			
				// User feedback for button press
				interface_text.flashText('#059400', 100) // Flash text briefly #user feedback
				gamepadInterface.getHapticActuator(0).pulse(1.0, 200); // Haptic line - intensity and duration
				laserSound.play(); // Sound effect for button press
		  }
		  wasChangeButton = nextButton.pressCheckReusable(stylus.position, scene, "white")


	  }

		if (BROWSER_TESTING){
			// remove this block
			if (gamepad1.buttons[4].pressed && !BROWSER_buttonPressed) {
				handleButton();
			}
			BROWSER_buttonPressed = gamepad1.buttons[4].pressed;
		}

		if (!desk_set){
				prevIsMovingDesk = isMovingDesk;
			isMovingDesk = gamepad1.buttons[5].value > 0;
		}
	  // MARK: Desk Calibration
	// Desk setup logic: before allowing draw, desk must be set up
	if (prevIsMovingDesk && isMovingDesk && !desk_locked) {
		if (!desk_manager.isDeskPositioned()) {
			// Desk fly-in
			desk_manager.slideToCamera(camera, stylus, tableGroup);

			// Hover button in front of user instead of doing offset
			red_button.makeVisible();
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

			question_panel.makeCubesTransparent();
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

	prevBackPushed = backPushed;
	backPushed = gamepad1.buttons[1].value > 0

	if (backPushed && !prevBackPushed) {
		// MARK: Back Button
		// Back button on controller
		// TODO: Add commented framediff for every button on controller
		laserSound.play();	
		interface_text.flashText('#ff0000', 100) 

		// Generate CSV and trigger download
		// This is currently done on controller button press, but can be triggered prgrammattically
		// Should be triggered alongside 
		downloadCSV(JSON.stringify(logData));
		// questionnaire_instance.setQuestionnaireSlide(2)
		question_panel.nextQuestionnaireSlide()
		// console.log(desk_manager.getDeskCoordinates(), desk_manager.getDeskQuaternion())
		// question_panel.setPos(desk_manager.getDeskCoordinates(), desk_manager.getDeskQuaternion())
	}
  }

  question_panel.updateBoxGradientFade()
}

// MARK: Animate Function
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
		if (!isDrawingDisabled) {
			handleDrawing(stylus);
		}

	}
	gsap.ticker.tick()
  // Render
  onFrame();

  renderer.render(scene, camera);
}

function handleDrawing(controller) {
  if (!controller) return;

  const userData = controller.userData;
  const painter = isPracticeMode ? practicePaints[practiceShapeIndex] : svgPaintsArray[shapeIndex];

  if (gamepad1) {
    cursor.set(stylus.position.x, stylus.position.y, stylus.position.z);
    if (userData.isSelecting || isDrawing) {
      painter.lineTo(cursor);
      painter.update();
    }
  }
}

function handleButton() {
	// if practice mode, use practice objects
	if (isPracticeMode) {
		// iterating
		if (practiceShapeIndex < practiceSvgArray.length - 1) {
			practiceShapeIndex += 1;
			desk_manager.clearSurface();
			loadSVG(practiceSvgArray[practiceShapeIndex], CENTER_POSITION);
			nextButton.updateLabel(
				`Practice ${practiceShapeIndex +1}/${practiceSvgArray.length}`,
			);

			practicePaints.forEach((paint) => {
				paint.mesh.visible = false;
			});
			practicePaints[practiceShapeIndex].mesh.visible = true;
			stylus.userData.painter = practicePaints[practiceShapeIndex];

		} else {
			isPracticeMode = false;
			isDrawingDisabled = true;

			desk_manager.clearSurface();
			practicePaints.forEach((paint) => {
				paint.mesh.visible = false;
			});

			nextButton.changeColor('#359743');
			nextButton.updateLabel("Begin");
			contextText.makeInvisible();
			task1Text.makeVisible();

		}
	}
	// if not practice mode
	else {
		// task1
		if (shapeIndex < svgArray.length - 1) {
			isDrawingDisabled = false;
			shapeIndex += 1;
			desk_manager.clearSurface();
			loadSVG(svgArray[shapeIndex], CENTER_POSITION);
			nextButton.updateLabel(`Next ${shapeIndex + 1}/${svgArray.length}`);


			svgPaintsArray.forEach((paint) => {
				paint.mesh.visible = false;
			});

			svgPaintsArray[shapeIndex].mesh.visible = true;
			stylus.userData.painter = svgPaintsArray[shapeIndex];


		}
		// end of task 1
		else {
			isDrawingDisabled = true;
			nextButton.makeInvisible();
			desk_manager.clearSurface();
			task1Text.updateText("Task 1 Complete");

			// todo move paints

			// make all paints visible for full drawing
			svgPaintsArray.forEach((paint) => {
				paint.mesh.visible = true;
			});

		}
	}
}

// MARK: Connect Event
function onControllerConnected(e) {
	console.log('Controller connected:', e.data);
  if (e.data.profiles.includes("logitech-mx-ink")) {
		// Set mx_ink_connected to true
		mx_ink_connected = true;
		// Depending on the MX Ink's reported handedness, set the hand booleans accordingly.
		if (e.data.handedness === 'left') {
			// Stylus is in left hand, override left hand model logic
			left_hand_override = true;
			right_hand_override = false;
		} else if (e.data.handedness === 'right') {
			right_hand_override = true;
			left_hand_override = false; // Reset right hand variable
		}

		stylus = e.target;
		stylus.userData.painter = practicePaints[0];
		gamepad1 = e.data.gamepad;
		gamepadInterface = new GamepadWrapper(e.data.gamepad);
	}

	if (BROWSER_TESTING) {
		// normal setup
		stylus = e.target;
		stylus.userData.painter = practicePaints[0];
		gamepad1 = e.data.gamepad;
		gamepadInterface = new GamepadWrapper(e.data.gamepad);

		// desk lock event simulation
		desk_manager.slideToFront(camera, stylus, tableGroup);
		desk_manager.lock();
		nextButton.hoverButtonByDesk(
			camera,
			desk_manager.getDesk(),
			scene,
			0.3,
			0.2,
		);
		isPracticeMode = true;
		desk_manager.spawnDrawingSurface();
		scene.background = green;
		red_button.makeInvisible();
		nextButton.makeVisible();
		desk_set = true;
		interface_text.updateText('Draw on the outline!');
		contextText.makeVisible();
		loadSVG(practiceSvgArray[practiceShapeIndex], CENTER_POSITION);



	}

  // If hand, add hand model and store reference in persistentHandModels
  if (e.data.profiles.includes("oculus-hand")) {
	console.log(e.data.handedness)
	// const hand = e.target;
	// const handedness = e.data.handedness; // 'left' or 'right'
	// const handModelFactory = new XRHandModelFactory();
	// const handModel = handModelFactory.createHandModel(hand, 'boxes');
	// hand.add(handModel);
	// persistentHandModels[handedness] = handModel; // Store reference to the hand model
	debugging_text = "\nHand connected:" + e.data.handedness + debugging_text
  }

  // todo else do raycasting
}

// MARK: Front Button Push
function onSelectStart(e) {
  if (e.target !== stylus || !desk_set) return;

	const painter = stylus.userData.painter;
	painter.moveTo(stylus.position);
	this.userData.isSelecting = true;
}

// MARK: Front Button Release
function onSelectEnd() {
  this.userData.isSelecting = false;
}

// MARK: SVG Function
function loadSVG(url, position) {
	const loader = new SVGLoader();

	loader.load(url, function (data) {
		const group = new THREE.Group();

		let renderOrder = 0;

		for (const path of data.paths) {
			const strokeColor = path.userData.style.fill;

			const material = new THREE.MeshBasicMaterial({
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

		desk_manager.placeSVG(group, position)
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

