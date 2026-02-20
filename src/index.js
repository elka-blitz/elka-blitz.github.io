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
import { getController, getControllerGrip } from './controllerFunctions';

import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import  DeskButton  from "./DeskButtons.js";
import  DeskManager  from './DeskManager.js';
import DrawParent from './DrawParent';
import EnvironmentSwitcher from "./environmentSwitcher.js";
import EventLogger from "./eventLogger.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GamepadWrapper } from 'gamepad-wrapper';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import SvgManager from './SvgManager';
import { Text } from 'troika-three-text';
import { TubePainter } from "three/examples/jsm/misc/TubePainter.js";
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';
import { buffer } from "three/examples/jsm/nodes/Nodes.js";
import { createText } from 'three/examples/jsm/webxr/Text2D';
import { getRelativePosition } from './shapeFunctions';
import { gsap } from 'gsap';   
import paintExporter from "./paintExporter.js";
import questionnaireManager from './questionnaireManager.js'
import speedMeter from "./speedMeter.js";
import { textDownload } from './csvFunctions';
import { update } from "three/examples/jsm/libs/tween.module.js";


const BROWSER_TESTING = false // todo remove before deployment
let BROWSER_buttonPressed = false;
let BROWSER_buttonPressed2 = false;
let BROWSER_buttonPressed3 = false;

// MARK: setup declarations
let camera, scene, renderer;
let stylus = null;
let gamepad1;
let gamepadInterface;
let contextText, taskTextPanel, originalText, yourDrawingText;
const cursor = new THREE.Vector3();
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};


// drawing declarations
let isDrawing = false;
let prevIsDrawing = false;
let practice1, practice2, practice3;
let practicePaints = [practice1, practice2, practice3];
let svgPaintsArray;
let isDrawingDisabled = false;
let pracBox,
	task1Box, task1ParentManager,
	task2Box, task2ParentManager,
	task3Box, task3ParentManager,
	task4Box, task4ParentManager;

// todo organise this into a class or something

const practiceSvgArray = [
	'assets/task1/window.svg',
	'assets/task1/door_top.svg',
	'assets/task1/window_curtain.svg',
];

let svgWithPositionsArray = [];

let wasChangeButton = false;
let wasResultButton = false;
let wasNextTaskButton = false;
let shapeIndex = -1;	// workaround for the way i've done the task flow
let taskNum = 1;
let practiceShapeIndex = 0;
const CENTER_POSITION = {x: 0, y : 0};
let deskCoords = CENTER_POSITION;

let isPracticeMode = false;

// Debugging stuff
let interface_text;

// Desk declarations
let isMovingDesk = false;
let prevIsMovingDesk = false;
let desk_set = false
let tableGroup = new THREE.Group()
let backPushed = false
let prevBackPushed = false
let desk_manager, svgManager, originalSvgManager;
let green = new THREE.Color('#80ed99');
let desk_locked = false // Global main process variable, so desklock check method is only run once
let prev_desk_locked = false

// MARK: Buttons
// if adding button to table, don't forget to call hoverButtonByDesk and use offset parameters to move relative to it
let red_button, nextButton, resultButton, nextTaskButton;

// MARK: Sounds
const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();
let scoreSound;


let clickSound = new THREE.PositionalAudio(listener);
audioLoader.load('assets/click_noise.ogg', (buffer) => {
	clickSound.setBuffer(buffer);
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

// MARK: Data Log
let event_logger = new EventLogger() // Global event logger instance, can be used to push data from any function or class

let paint_exporter_instance;

let canvas
let takeScreenshot = false

// MARK: DeltaTime
let accumulatedTime = 0;
let logInterval = 0.2; // 5 times per second
let lastFrameTime = 0

// MARK: Positions
const originalPos = {x: -0.5, y: 0.4, z: 1.01}
const yourDrawingPos = {x: 0.5, y: 0.4, z: 1.01}

// Environment switcher instance
let environment_switcher;

const speed_meter = new speedMeter()

init();

// Screenshot save function. Unfortunately only works in browser window
// Not in VR
// Keep just in case
const saveBlob = (function() {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';
  return function saveData(blob, fileName) {
     const url = window.URL.createObjectURL(blob);
     a.href = url;
     a.download = fileName;
     a.click();
  };
}());

// MARK: INIT FUNC
function init() {
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

	canvas = document.querySelector('canvas.webgl');

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
	environment_switcher = new EnvironmentSwitcher(scene, office_group);
	scene.add(tableGroup);

	// MARK: Desk
	desk_manager = new DeskManager(scene, tableGroup);

	// office_group.scale.set(0.5, 0.5, 0.5)
	office_group.position.set(0, -0.3, 0);
	office_group.rotateY(Math.PI / 5);

	// MARK: Panel
	question_panel = new questionnaireManager(scene, camera, tableGroup); // Load assetes on class initialisation
	question_panel.setQuestionnaireVisibility(false); // Initially set the questionnaire to be invisible until desk is locked in place

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
	document.addEventListener('keydown', function (event) {
		switch (event.keyCode) {
			case 87: // W
				// question_panel.moveInputCubesDown();
				// paint_exporter_instance.screenShotCanvas(canvas)
				takeScreenshot = true;
				break;
			case 65: // A
				// question_panel.resetInputCubes();
				question_panel.refresh();
				break;
		}
	});

	paint_exporter_instance = new paintExporter(scene, camera);

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

	let leftHandModel = handModelFactory.createHandModel(hand1, 'mesh');
	hand1.add(leftHandModel);
	left_hand_container.add(hand1);
	scene.add(left_hand_container);

	// Hand 2
	hand2 = renderer.xr.getHand(1);

	let rightHandModel = handModelFactory.createHandModel(hand2, 'mesh');
	hand2.add(rightHandModel);
	right_hand_container.add(hand2);
	scene.add(right_hand_container);

	// MARK: UI Elements
	interface_text = new UIText(scene);

	const contextTextStr =
		'You are an architect designing buildings for the city.' +
		'\nYour co-worker Sandra is sick and now you have to deal with all her impatient clients.' +
		'\nThe three clients want to build a bakery, a studio and a library.' +
		'\n\nPlease go ahead and draw some practice shapes. After that the tasks will begin. Good luck!';

	const taskTextPanelStr = 'Task 1: The Bakery';

	contextText = new TextPanel(scene, contextTextStr, 0, 1.6, 1.5, 0.6, 1.5);
	taskTextPanel = new TextPanel(scene, taskTextPanelStr, 0, 1.6, 1, 0.3, 1.5);
	originalText = new TextPanel(
		scene,
		'Original',
		originalPos.x,
		originalPos.y + deskCoords.y + 0.3,
		0.5,
		0.1,
		originalPos.z,
	);
	yourDrawingText = new TextPanel(
		scene,
		'Your Drawing',
		yourDrawingPos.x - 0.2,
		yourDrawingPos.y + deskCoords.y + 0.3,
		0.5,
		0.1,
		yourDrawingPos.z,
	);

	// MARK: Buttons
	red_button = new DeskButton(scene);
	red_button.createButton(new THREE.Vector3(0, 0, 0), '#b30000', 'Lock');
	red_button.makeInvisible();

	nextButton = new DeskButton(scene);
	nextButton.createButton(
		new THREE.Vector3(0, 0, 0),
		'#ff7300',
		'Practice 1/3',
		0.07,
	);
	nextButton.makeInvisible();

	resultButton = new DeskButton(scene);
	resultButton.createButton(
		new THREE.Vector3(0, 0, 0),
		'#359743',
		'Show!',
		0.07,
	);
	resultButton.makeInvisible();

	nextTaskButton = new DeskButton(scene);
	nextTaskButton.createButton(
		new THREE.Vector3(0, 0, 0),
		'#0f94e6',
		'Next Task',
		0.09,
	);
	nextTaskButton.makeInvisible();

	// MARK: Drawing and paints setup
	const pracParent = new DrawParent('blue', BROWSER_TESTING);
	pracBox = pracParent.getParent();

	// todo make list?
	task1ParentManager = new DrawParent('red', BROWSER_TESTING);
	task1Box = task1ParentManager.getParent();

	task2ParentManager = new DrawParent('yellow', BROWSER_TESTING);
	task2Box = task2ParentManager.getParent();

	task3ParentManager = new DrawParent('blue', BROWSER_TESTING);
	task3Box = task3ParentManager.getParent();

	task4ParentManager = new DrawParent('green', BROWSER_TESTING);
	task4Box = task4ParentManager.getParent();

	svgManager = new SvgManager();
	svgWithPositionsArray = svgManager.getSVGArray();

	originalSvgManager = new SvgManager();

	svgManager.setupPaints(1, task1Box);
	svgPaintsArray = svgManager.getPaintsArray(1);

	practicePaints.forEach((paint, i) => {
		practicePaints[i] = new TubePainter();
		practicePaints[i].mesh.material = new THREE.LineBasicMaterial({
			color: 'black',
			linewidth: 4,
		});
		practicePaints[i].setSize(0.2);
		pracBox.add(practicePaints[i].mesh);
	});

	desk_manager.addMesh(task1Box);
	desk_manager.addMesh(task2Box);
	desk_manager.addMesh(task3Box);
	desk_manager.addMesh(pracBox);
	task1Box.position.y = 0.82;
	task2Box.position.y = 0.82;
	task3Box.position.y = 0.82;
	pracBox.position.y = 0.82;
}


// MARK: OnFrame
function onFrame(time, frame) {
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
				0.2,
			);
			resultButton.hoverButtonByDesk(camera, desk_manager.getDesk(), scene);
			nextTaskButton.hoverButtonByDesk(camera, desk_manager.getDesk(), scene, 
				0,-0.3);
			deskCoords = desk_manager.getDeskCoordinates();
			interface_text.animateTextToCamera(camera);
			question_panel.refresh();
			// question_panel.spawnBoundingBoxes()
			question_panel.makeCubesTransparent();
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
				child.material.transparent = false;
				// child.material.opacity = 0.5
			}
		});
	}

	question_panel.updateBoxGradientFade();

	desk_locked = desk_manager.getLock(); // Run once and used variable for desklock check, avoids running method multiple times
	if (!desk_locked) {
		// Smooth text animation to camera, prompting user to lock desk
		// interface_text.updateText('Tap desk with stylus to lock')
		interface_text.animateTextToCamera(camera);
	} else if (desk_locked && !prev_desk_locked) {
		// Desk has just been locked, run fly-in animation and text update
		// This code runs once when the desk is locked, and uses the prev_desk_locked variable to check if the desk lock state has just changed
		interface_text.updateText('');

		// Locate text permanently above desk for remainder of session
		interface_text.positionTextRelativeToDesk(desk_manager.getDesk());
	}

	prev_desk_locked = desk_locked; // Framediff for desk lock check

	interface_text.sync();

	// MARK: Gamepad Condition
	if (gamepad1) {
		// MARK: Speed function
		/*
		 		This returns a number representing the stylus speed
				This number can be used to represent stylus speed
				Unsure how best to utilise it. Example below makes a unicode speed bar
		*/

		// let speed = speed_meter.getSpeed(stylus.position)
		// interface_text.updateText('▮'.repeat(speed))

		// MARK: Desk Moving button
		if (!desk_set) {
			prevIsMovingDesk = isMovingDesk;
			isMovingDesk = gamepad1.buttons[5].value > 0;
		}

		question_panel.inputChecker(stylus.position);


		// MARK: Red desk lock button
		if (red_button.returnExists() === true) {
			if (red_button.pressCheck(stylus.position, scene, 'white') === true) {
				buttonFeedback();
				Calibrate();
			}
		}

		// MARK: Practice/Task
		if (nextButton.returnExists() === true) {
			if (
				nextButton.pressCheckReusable(stylus.position, scene, 'white') ===
					true &&
				!wasChangeButton
			) {
				buttonFeedback();
				isPracticeMode ? PracticeMode() : TaskMode();
			}
			wasChangeButton = nextButton.pressCheckReusable(
				stylus.position,
				scene,
				'white',
			);
		}

		// MARK: Show result button
		if (resultButton.returnExists() === true) {
			if (
				resultButton.pressCheck(stylus.position, scene, 'white') === true &&
				!wasResultButton
			) {
				buttonFeedback();
				ShowResultsMode();
			}
			wasResultButton = nextButton.pressCheck(stylus.position, scene, 'white');
		}

		// MARK: Next task button (this will need to lead into questionnaire)
		if (nextTaskButton.returnExists() === true) {
			if (
				nextTaskButton.pressCheck(stylus.position, scene, 'white') === true &&
				!wasNextTaskButton
			) {
				buttonFeedback();

				SetupNextTask();
				TaskMode();
			}
			wasNextTaskButton = nextTaskButton.pressCheck(
				stylus.position,
				scene,
				'white',
			);
		}
		// MARK: Browser Testing Button Input
		if (BROWSER_TESTING) {
			// remove this block
			if (gamepad1.buttons[4].pressed && !BROWSER_buttonPressed) {
				// x
				if (isPracticeMode) {
					PracticeMode();
				}
				// if not practice mode
				else {
					TaskMode();
				}
			}
			if (gamepad1.buttons[5].pressed && !BROWSER_buttonPressed2) {
				// y
				SetupNextTask();
				TaskMode();
			}
			if (gamepad1.buttons[3].pressed && !BROWSER_buttonPressed3) {
				// joystick
				ShowResultsMode();
			}
			BROWSER_buttonPressed = gamepad1.buttons[4].pressed;
			BROWSER_buttonPressed2 = gamepad1.buttons[5].pressed;
			BROWSER_buttonPressed3 = gamepad1.buttons[3].pressed;
		}

		if (backPushed && !prevBackPushed) {
			// MARK: Back Button
			// Back button on controller
			// TODO: Add commented framediff for every button on controller
			clickSound.play();
			interface_text.flashText('#ff0000', 100);

			// Generate CSV and trigger download
			// This is currently done on controller button press, but can be triggered prgrammattically
			// Should be triggered alongside
			// downloadCSV(JSON.stringify(logData));
			event_logger.logEventData('Back button pressed');

			// MARK: Export
			// Export all data
			event_logger.downloadAllData(); // Download stylus and task event data as text files

			// Export Paintings
			// TODO: Error handling for no paint mesh condition
			paint_exporter_instance.downloadJSON();
		}
		prevBackPushed = backPushed;
		backPushed = gamepad1.buttons[1].value > 0;
	}


}

// MARK: Animate Func
function animate(time, frame) {

	// MARK: Stylus Logging
	// Deltatime to prevent 60x log pers seconds
	// Also prevents logging inconsistency due to hardware and framerate
	const deltaTime = (time - lastFrameTime) * 0.001
	lastFrameTime = time

	accumulatedTime += deltaTime

	while (accumulatedTime >= logInterval && stylus != null) {
		accumulatedTime -= logInterval;
		
		event_logger.logStylusData(stylus)

		// TODO: Prevent variable from storing too much and crashing the VRE
		// Periodic export maybe?
		// (╯°□°）╯︵ ┻━┻
	}

	// MARK: drawing logic
	if (desk_set) {
		if (gamepad1) {
			prevIsDrawing = isDrawing;
			isDrawing = gamepad1.buttons[5].value > 0;

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

	// MARK: take screenshot
  if (takeScreenshot === true) {
		canvas.toBlob((blob) => {
			saveBlob(blob, `screencapture-${canvas.width}x${canvas.height}.png`);
		});
		takeScreenshot = false
  }
}


// MARK: Connect Event
function onControllerConnected(e) {
	event_logger.logEventData('Controller Connected')
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

  	// MARK: Browser Testing setup
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
		Calibrate();
		deskCoords = desk_manager.getDeskCoordinates();


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
	//   console.log(this.userData.painter.mesh.geometry.attributes.position.array)
	try {
	paint_exporter_instance.saveMesh(this.userData.painter.mesh) // Save painting with uuid, can be used to reference painting later for export or other functions
	}
	catch (error) {
		console.error("Error saving painting array:", error);
	}
}

// MARK: HandleDrawing
function handleDrawing(controller) {
	if (!controller) return;

	const userData = controller.userData;
	let painter;

	if (isPracticeMode) {
		painter = practicePaints[practiceShapeIndex];
	} else if (shapeIndex === -1) {
		painter = svgPaintsArray[0];
	} else {
		painter = svgPaintsArray[shapeIndex];
	}

	let currentBox;
	switch (taskNum) {
		case 1:
			currentBox = task1Box;
			break;
		case 2:
			currentBox = task2Box;
			break;
		case 3:
			currentBox = task3Box;
			break;
	}

	if (gamepad1) {
		const relativePos = getRelativePosition(stylus, currentBox);
		if (userData.isSelecting || isDrawing) {
			cursor.set(relativePos.x, relativePos.y, relativePos.z);
			painter.lineTo(cursor);
			painter.update();
		} else {
			painter.moveTo(relativePos.x, relativePos.y, relativePos.z); // moves current path to pen
		}
	}
}


// MARK: Button Feedback
function buttonFeedback() {
	interface_text.flashText('#059400', 100); // Flash text briefly #user feedback
	gamepadInterface.getHapticActuator(0).pulse(1.0, 200); // Haptic line - intensity and duration
	clickSound.play(); // Sound effect for button press
}

// MARK: SVG Load Functions
function loadSVG(url, position, isResult) {
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

		isResult ? originalSvgManager.svgSurface(group) :desk_manager.placeSVG(group, position)
	});
}

function loadSVGs(svgObjs) {
	const groups = [];
	const loader = new SVGLoader();

	svgObjs.map((obj, i) => {
		loader.load(obj.url, function (data) {
			const group = new THREE.Group();

			let renderOrder = 0;

			for (const path of data.paths) {
				const strokeColor = path.userData.style.fill;

				const material = new THREE.MeshBasicMaterial({
					color: 'black',
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
					geometry.rotateZ(Math.PI); // rotate right side up

					if (geometry) {
						const mesh = new THREE.Mesh(geometry, material);
						mesh.renderOrder = renderOrder++;

						group.add(mesh);
					}
				}
			}
			desk_manager.placeSVG(group, obj.position, i);
		});
	});
}

// MARK: MODE: Calibrate
const Calibrate = () => {
	desk_manager.lock();
	isPracticeMode = true;
	desk_manager.spawnDrawingSurface();
	scene.background = green;
	red_button.makeInvisible();
	nextButton.makeVisible();
	desk_set = true;
	interface_text.updateText('Draw on the outline!');
	contextText.makeVisible();
	loadSVG(practiceSvgArray[0], CENTER_POSITION);
	stylus.userData.painter = practicePaints[0];
}

// MARK: MODE: Practice
const PracticeMode = () => {
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

	} else {
		isPracticeMode = false;
		isDrawingDisabled = true;
		pracBox.visible = false;

		desk_manager.clearSurface();
		practicePaints.forEach((paint) => {
			paint.mesh.visible = false;
		});

		nextButton.changeColor('#359743');
		nextButton.updateLabel("Begin");
		contextText.makeInvisible();
		taskTextPanel.makeVisible();

	}

}

// MARK: MODE: Task
const TaskMode = () => {
	if (shapeIndex < svgWithPositionsArray.length - 1) {
		isDrawingDisabled = false;
		shapeIndex += 1;
		desk_manager.clearSurface();
		loadSVG(svgWithPositionsArray[shapeIndex].url, CENTER_POSITION);
		nextButton.updateLabel(
			`Next ${shapeIndex + 1}/${svgWithPositionsArray.length}`,
		);

		svgPaintsArray.forEach((paint) => {
			paint.mesh.visible = false;
		});

		svgPaintsArray[shapeIndex].mesh.visible = true;
	}
	// end of task
	else {
		isDrawingDisabled = true;
		nextButton.makeInvisible();
		resultButton.makeVisible();
		desk_manager.clearSurface();
		desk_manager.makeSurfaceInvisible();
		svgPaintsArray.forEach((paint) => {
			paint.mesh.visible = false;
		});
		taskTextPanel.updateText(
			`Task ${taskNum} complete` + '\nAre you ready to see your drawing?',
		);
	}
}

// MARK: MODE: Show Results
const ShowResultsMode = () => {
	isDrawingDisabled = true;

	desk_manager.clearSurface();
	desk_manager.makeSurfaceInvisible()
	taskTextPanel.makeInvisible();

	// text
	originalText.makeVisible();
	originalText.setPosition({
		x: originalPos.x,
		y: originalPos.y + desk_manager.getDeskCoordinates().y + 0.2,
		z: originalPos.z,
	});

	yourDrawingText.makeVisible();
	yourDrawingText.setPosition({
		x: yourDrawingPos.x,
		y: yourDrawingPos.y + desk_manager.getDeskCoordinates().y + 0.2,
		z: yourDrawingPos.z,
	});

	// original svg
	originalSvgManager.clearSurface();
	originalSvgManager.makeSurfaceVisible();
	const original = originalSvgManager.getSurface();
	scene.add(original);
	original.position.set(
		originalPos.x,
		originalPos.y + desk_manager.getDeskCoordinates().y,
		-originalPos.z,
	);

	switch (taskNum) {
		case 1:
			loadSVG('assets/task1/task1.svg', CENTER_POSITION, true);
			original.rotateY(Math.PI); // flip it only the first time
			task1ParentManager.makeVertical();
			break;
		case 2:
			loadSVG('assets/task2/task2.svg', CENTER_POSITION, true);
			task2ParentManager.makeVertical();
			break;
		case 3:
			loadSVG('assets/task3/task3.svg', CENTER_POSITION, true);
			task3ParentManager.makeVertical();
			break;
	}

	svgWithPositionsArray.forEach((obj, i) => {
		// svgPaintsArray[i].mesh.rotateX(-Math.PI / 3);
		svgPaintsArray[i].mesh.position.x = obj.position.x;
		svgPaintsArray[i].mesh.position.y = obj.position.y;
		svgPaintsArray[i].mesh.visible = true;
	});

	nextButton.makeInvisible();
	nextTaskButton.makeVisible();

}

const SetupNextTask = () => {
	svgWithPositionsArray.forEach((obj, i) => {
		svgPaintsArray[i].mesh.visible = false;
	});


	desk_manager.makeSurfaceVisible()
	nextButton.makeVisible();

	shapeIndex = -1;
	taskNum += 1;

	svgWithPositionsArray = svgManager.getTaskArray(taskNum);
	svgPaintsArray = svgManager.getPaintsArray(taskNum);

	desk_manager.makeSurfaceVisible();
	nextButton.makeVisible();
	taskTextPanel.makeVisible();
	originalText.makeInvisible();
	originalSvgManager.makeSurfaceInvisible();
	yourDrawingText.makeInvisible();
	scene.remove(svgManager.getSurface());

	switch (taskNum) {
		case 1: break;
		case 2:
			taskTextPanel.updateText('Task 2: Florist');
			task1ParentManager.makeInvisible();
			svgManager.setupPaints(2, task2Box);
			break;
		case 3:
			taskTextPanel.updateText('Task 3: Studio');
			task2ParentManager.makeInvisible();
			svgManager.setupPaints(3, task3Box);
	}
}