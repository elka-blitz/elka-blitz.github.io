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

});

import * as THREE from "three";

import { TextPanel, UIText } from './UIText.js';
import { getController, getControllerGrip, hideControllerModel, showControllerModel} from './controllerFunctions';

import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import  DeskButton  from "./DeskButtons.js";
import  DeskManager  from './DeskManager.js';
import DrawParent from './DrawParent';
import EventLogger from "./eventLogger.js";
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GamepadWrapper } from 'gamepad-wrapper';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import QuestionnaireManager from "./QuestionnaireManager";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import SvgManager from './SvgManager';
import ThreeMeshUI from 'three-mesh-ui';
import { TubePainter } from "three/examples/jsm/misc/TubePainter.js";
import {ResultsUI, StoryUI, UiElementsManager } from "./uiElement";
import { VRButton } from 'three/addons/webxr/VRButton.js';
import VRControllerManager from "./VRControllerManager";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';
import { getRelativePosition } from './shapeFunctions';
import { gsap } from 'gsap';
import {isHorizontalSurface, taskOrder} from "./experimentConfig";
import paintExporter from "./paintExporter.js";
import speedMeter from "./speedMeter.js";
import accuracyHelper from "./accuracyHelper.js";

// MARK: Conditions
const BROWSER_TESTING = false; // todo remove before deployment

let BROWSER_buttonPressed = false;
let BROWSER_buttonPressed2 = false;
let BROWSER_buttonPressed3 = false;

let selectState = false;

const raycaster = new THREE.Raycaster();
const objsToTest1 = [];
const objsToTest2 = [];
const objsToTest3 = [];

// MARK: setup declarations
let camera, scene, renderer, vrControl;
let stylus = null;
let stylusPos;
let gamepad1;
let gamepadInterface;
let taskTextPanel,  uiManager, storyUIManager, resultsUIManager;
const cursor = new THREE.Vector3();
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};
const surfaceDimensions = {
	width: 0.42,
	height: 0.29
}

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
	questionnaire1,
	questionnaire2,
	questionnaire3;
const inkColor = new THREE.Color('#002C42');
const outlineColor = new THREE.Color('#52a0c6')

const practiceSvgArray = [
	'assets/task1/window.svg',
	'assets/task2/rim.svg',
	'assets/task1/window_curtain.svg',
];

let svgWithPositionsArray = [];

let wasChangeButton = false;
let wasResultButton = false;
let wasNextTaskButton = false;
let wasSurveyButton = false;
let isPreTask = true;
let shapeIndex = -1;	// workaround for the way i've done the task flow
let taskNum = 1;
let practiceShapeIndex = 0;
const CENTER_POSITION = {x: 0, y : 0};
let deskCoords = CENTER_POSITION;

let isPracticeMode = false;
let isQuestionnaireMode = false;


// Desk declarations
let isMovingDesk = false;
let prevIsMovingDesk = false;
let desk_set = false
let tableGroup = new THREE.Group()
let backPushed = false
let prevBackPushed = false
let desk_manager, svgManager, originalSvgManager;

let desk_locked = false // Global main process variable, so desklock check method is only run once
let prev_desk_locked = false

// MARK: Buttons
// if adding button to table, don't forget to call hoverButtonByDesk and use offset parameters to move relative to it
let red_button, nextButton, resultButton, nextTaskButton, repeatPracticeButton;

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

// Moderate stimulation environment global
let environmentModel = new THREE.Group()

// MARK: Hands
let hand1, hand2;

let controller1, controllerGrip1;

let mx_ink_connected = false;
const left_hand_container = new THREE.Group();
const right_hand_container = new THREE.Group();

// MARK: Data Log
let event_logger = new EventLogger() // Global event logger instance, can be used to push data from any function or class

let paint_exporter_instance;

let canvas

// MARK: DeltaTime
let accumulatedTime = 0;
let logInterval = 0.2; // 5 times per second
let lastFrameTime = 0

// MARK: Positions
const originalPos = {x: -0.5, y: 0.4, z: 1.01}
const yourDrawingPos = {x: 0.5, y: 0.4, z: 1.01}

// Environment switcher instance
let environment_switcher;
let envMap

const speed_meter = new speedMeter()

let accuracy_helper, currentAccuracy;
let svg_points = []
let running_mean
let user_is_drawing_track_accuracy_now = false

// Button cooldown
let button_cooled_down = true
let button_cooldown_count = 0


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
	// scene.background = new THREE.Color('#38a3a5');
	camera = new THREE.PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.01,
		50,
	);

	camera.position.set(0, 1, 0);

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

	gltfLoader.load('./assets/deskModel.glb', (gltf) => {
		gltf.scene.traverse((child) => {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});

		tableGroup.add(gltf.scene);
	});

	gltfLoader.load(
		'./assets/roomModel.glb',
		function (gltf) {
			gltf.scene.traverse((child) => {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});

			environmentModel.add(gltf.scene);
		},
		undefined,
		function (error) {
			console.error(error);
		},
	);

	scene.add(environmentModel)

	// Minimal environment (Just floor for pilot)
	// Can be made more plain, adding lines for some differentiation
	// Floor for void environment

	const minimalEnvironmentFloorGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
	const floorMaterial = new THREE.MeshBasicMaterial({ color: '#4a4a4a', side: THREE.DoubleSide });
	const floor = new THREE.Mesh(minimalEnvironmentFloorGeometry, floorMaterial);
	floor.rotation.x = -Math.PI / 2; // Rotate to lie flat on the XZ plane
	 
	const minimalEnvironment = new THREE.GridHelper(50, 30, 0x0000ff, 0x888888);
	minimalEnvironment.add(floor)
	minimalEnvironment.name = 'MinimalEnv'
	floor.position.y = -0.5; // Position below the camera

	// MARK: Model setup

	environmentModel.position.set(0.2,0.5,-0.8)

	scene.add(tableGroup);

	// MARK: Desk
	desk_manager = new DeskManager(scene, tableGroup, surfaceDimensions);

	// Lighting
	const ambientLight = new THREE.AmbientLight(0xFFE7CE, 2);
	scene.add(ambientLight);

	const directionalLight = new THREE.DirectionalLight(0xFFE7CE, 10);
	directionalLight.position.set(0.7, 1.8, 1);
	directionalLight.castShadow = true;
	scene.add(directionalLight);
	scene.add(directionalLight.target);

	directionalLight.target.position.set(0.45, 1.67, -1);

	directionalLight.shadow.mapSize.set(1024, 1024);
	directionalLight.shadow.bias = -0.0001;


	tableGroup.position.set(0, -3, 0);
	// office_group.position.set(0, -0.3, 0);
	// office_group.rotateY(Math.PI / 5);

	// rendering setup
	renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
	renderer.setPixelRatio(window.devicePixelRatio, 2);
	renderer.setSize(sizes.width, sizes.height);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.xr.enabled = true;

// HDRI
	const pmrem = new THREE.PMREMGenerator(renderer);
	pmrem.compileEquirectangularShader();

	new RGBELoader().load('/assets/skyEnvMap.hdr', (hdrTex) => {
		hdrTex.mapping = THREE.EquirectangularReflectionMapping;

		const envMap = pmrem.fromEquirectangular(hdrTex).texture;

		scene.environment = envMap;
		scene.background = hdrTex;

		// rotate lighting and bg image
		scene.environmentRotation.y = Math.PI / 2;
		scene.backgroundRotation.y = Math.PI / 4;

		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 0.35;

		hdrTex.dispose();
		pmrem.dispose();
	});


	// MARK: Session Init
	const sessionInit = {
		requiredFeatures: ['hand-tracking'],
	};

	const htmlVRButton = VRButton.createButton(renderer, sessionInit);
	htmlVRButton.style.cssText = "position: absolute; " +
		"bottom: 20px; " +
		"border-radius: 4px; " +
		"background: rgb(200, 0, 0); " +
		"background: rgb(200, 0, 0); " +
		"color: rgb(255, 255, 255); " +
		"font: 13px sans-serif; " +
		"text-align: center; " +
		"opacity: 1; " +
		"outline: none; " +
		"z-index: 10; " +
		"height: 100px;" +
		"width: 100px;" +
		"cursor: pointer; " +
		"border-radius: 16px;" +
		"left: calc(50% - 50px);"

	document.body.appendChild(htmlVRButton);

	// MARK: Key Input
	// Keyboard buttonpress listener for testing in browser
	document.addEventListener('keydown', function (event) {
		switch (event.keyCode) {
			case 87: // W
				// question_panel.moveInputCubesDown();
				// paint_exporter_instance.screenShotCanvas(canvas)
				// takeScreenshot = true;
				// environment_switcher.loadNextEnvironmentCondition()
				// event_logger.logEventData('Environment Changed' + environment_switcher.loadNextEnvironmentCondition())

				
				// Flash the sky by changing its color to the specified color and then back to white after the duration

				setTimeout(() => {
					scene.background = envMap
				}, 500); 

				break;
			case 65: // A
				// question_panel.resetInputCubes();
				break;
		}
	});

	paint_exporter_instance = new paintExporter(scene, camera);

	renderer.setAnimationLoop(animate);

	// MARK: controller setup
	const controllerModelFactory = new XRControllerModelFactory();

	const handModelFactory = new XRHandModelFactory();

	// should only ever be one controller able to give input
	controllerGrip1 = getControllerGrip(0, renderer, controllerModelFactory);
	controller1 = getController(
		0,
		renderer,
		onControllerConnected,
		onSelectStart,
		onSelectEnd,
	)
	scene.add(controllerGrip1);
	scene.add(controller1);


	controller1.name = 'controller-right';

	vrControl = new VRControllerManager( renderer, controller1, controllerGrip1 );

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


	const taskTextPanelStr = `Task 1: The ${taskOrder[taskNum - 1].name}`;

	taskTextPanel = new TextPanel(scene, taskTextPanelStr, 0, 2, 1, 0.3, 1.5);

	uiManager = new UiElementsManager(scene);
	storyUIManager = new StoryUI(scene);
	resultsUIManager = new ResultsUI(scene);

	accuracy_helper = new accuracyHelper()

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

	repeatPracticeButton = new DeskButton(scene);
	repeatPracticeButton.createButton(
		new THREE.Vector3(0, 0, 0),
		'#ff7300',
		'Practice',
		0.07,
	);
	repeatPracticeButton.makeInvisible();

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
	const pracParent = new DrawParent(surfaceDimensions);
	pracBox = pracParent.getParent();

	// todo make list?
	task1ParentManager = new DrawParent(surfaceDimensions);
	task1Box = task1ParentManager.getParent();

	task2ParentManager = new DrawParent(surfaceDimensions);
	task2Box = task2ParentManager.getParent();

	task3ParentManager = new DrawParent(surfaceDimensions);
	task3Box = task3ParentManager.getParent();

	svgManager = new SvgManager(surfaceDimensions);
	svgWithPositionsArray = svgManager.getTaskArray(taskOrder[0].name);

	originalSvgManager = new SvgManager(surfaceDimensions);

	svgManager.setupPaints(1, task1Box);
	svgPaintsArray = svgManager.getPaintsArray(1);

	practicePaints.forEach((paint, i) => {
		practicePaints[i] = new TubePainter();
		practicePaints[i].mesh.material = new THREE.LineBasicMaterial({
			color: inkColor,
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

	// // MARK: Questionnaire
	// questionnaire1 = new QuestionnaireManager(scene, objsToTest1);
	// questionnaire2 = new QuestionnaireManager(scene, objsToTest2);
	// questionnaire3 = new QuestionnaireManager(scene, objsToTest3);

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
			repeatPracticeButton.hoverButtonByDesk(
				camera,
				desk_manager.getDesk(),
				scene,
				-0.3,
				0.2,
			);
			resultButton.hoverButtonByDesk(camera, desk_manager.getDesk(), scene);
			nextTaskButton.hoverButtonByDesk(camera, desk_manager.getDesk(), scene, 
				0,0.3);
			deskCoords = desk_manager.getDeskCoordinates();
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
				child.material.transparent = false;
				// child.material.opacity = 0.5
			}
		});
	}

	desk_locked = desk_manager.getLock(); // Run once and used variable for desklock check, avoids running method multiple times
	if (!desk_locked) {
		// Smooth text animation to camera, prompting user to lock desk
	} else if (desk_locked && !prev_desk_locked) {
		// Desk has just been locked, run fly-in animation and text update
		// This code runs once when the desk is locked, and uses the prev_desk_locked variable to check if the desk lock state has just changed

	}

	prev_desk_locked = desk_locked; // Framediff for desk lock check


	// MARK: Gamepad Condition
	if (gamepad1) {
		// MARK: Speed function
		/*
		 		This returns a number representing the stylus speed
				This number can be used to represent stylus speed
				Unsure how best to utilise it. Example below makes a unicode speed bar
		*/

		// let speed = speed_meter.getSpeed(stylusPos)

		// MARK: Desk Moving button
		if (!desk_set) {
			prevIsMovingDesk = isMovingDesk;
			isMovingDesk = gamepad1.buttons[5].value > 0;
		}


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
				!wasChangeButton && button_cooled_down == true
			) {
				buttonFeedback();
				isPracticeMode ? PracticeMode() : TaskMode();
				button_cooled_down = false
			}
			wasChangeButton = nextButton.pressCheckReusable(
				stylus.position,
				scene,
				'white',
			);
		}

		// MARK: Repeat Practice
		if (repeatPracticeButton.returnExists() === true) {
			if (
				repeatPracticeButton.pressCheck(stylus.position, scene, 'white') ===
					true &&
				!wasChangeButton
			) {
				buttonFeedback();
				isPracticeMode = true;
				isDrawingDisabled = false;
				storyUIManager.practicePromptInvisible();


				practiceShapeIndex = -1;
				desk_manager.spawnDrawingSurface();
				uiManager.practiceMode(deskCoords);

				// loadSVG(practiceSvgArray[0], CENTER_POSITION);
				repeatPracticeButton.makeInvisible();

				const pracParent = new DrawParent(surfaceDimensions);
				pracBox = pracParent.getParent();
				pracBox.visible = true;
				desk_manager.addMesh(pracBox);
				pracBox.position.y = 0.82;



				practicePaints.forEach((paint, i) => {
					practicePaints[i] = new TubePainter();
					practicePaints[i].mesh.material = new THREE.LineBasicMaterial({
						color: inkColor,
						linewidth: 4,
					});
					practicePaints[i].setSize(0.2);
					pracBox.add(practicePaints[i].mesh);
				});
				stylus.userData.painter = practicePaints[0];

				PracticeMode();
			}
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


		// MARK: Next task button
		if (nextTaskButton.returnExists() === true) {
			if (
				nextTaskButton.pressCheck(stylus.position, scene, 'white') === true &&
				!wasNextTaskButton && button_cooled_down
			) {
				buttonFeedback();

				if (taskNum !== 3) {
					SetupNextTask();
					TaskMode();
				} else {
					FinishMode();
				}
				button_cooled_down = false

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
				if (taskNum !== 3) {
					SetupNextTask();
					TaskMode();
				} else {
					FinishMode();
				}
			}
			if (gamepad1.buttons[3].pressed && !BROWSER_buttonPressed3) {
				// joystick
				storyUIManager.finishVisible();

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

			// Generate CSV and trigger download
			// This is currently done on controller button press, but can be triggered prgrammattically
			// Should be triggered alongside
			// downloadCSV(JSON.stringify(logData));
			event_logger.logEventData('Back button pressed');
			//event_logger.downloadUnityData()
			//
			// MARK: Export
			// Export all data
			// event_logger.downloadAllData(); // Download stylus and task event data as text files

			// Export Paintings
			// TODO: Error handling for no paint mesh condition
			// paint_exporter_instance.downloadJSON();
			// paint_exporter_instance.compressAndDownload()
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

		try {
			nextButton.forceButtonUp(stylus.position)
		} catch {

		}

		try {
			accuracy_helper.calculateAccuracy()
		} catch {

		}

		// Reset button cooldown
		if (!button_cooled_down && button_cooldown_count >= 15) { // 3 second cooldown
			button_cooled_down = true	
			button_cooldown_count = 0
		}

		// Increment if button not cooled down
		// After buttonpress, set button_cooldown to false
		// Adding button cooldown false to buttonpress logic
		if (!button_cooled_down) {
			button_cooldown_count += 1	
		}


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
				const painter = stylus?.userData.painter;
				painter.moveTo(stylusPos);
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
	ThreeMeshUI.update();
	updateButtons();


}


// MARK: Connect Event
function onControllerConnected(e) {
	event_logger.logEventData(e.data.profiles[0] + ' ControllerConnected-handedness=' + e.data.handedness)
	console.log('Controller connected:' + e.data.profiles);

	if (e.data.profiles[0] === ("logitech-mx-ink")) {
		// Set mx_ink_connected to true
		mx_ink_connected = true;

		stylus = e.target;
		stylusPos = e.target.position
		stylus.userData.painter = practicePaints[0];
		gamepad1 = e.data.gamepad;
		gamepadInterface = new GamepadWrapper(e.data.gamepad);

	}
	else if (e.data.profiles[0] === ("meta-quest-touch-plus")){ // if controller

		stylus = e.target;
		stylusPos = {
			x: e.target.position.x,
			y: e.target.position.y,
			z: e.target.position.z - 0.07,
		}
		stylus.userData.painter = practicePaints[0];
		gamepad1 = e.data.gamepad;
		gamepadInterface = new GamepadWrapper(e.data.gamepad);

	}

  	// MARK: Browser Testing setup
	if (BROWSER_TESTING) {

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
		deskCoords = {x: 0, y: 1, z: -0.5}
		Calibrate();
	}

}

// MARK: Front Button Push
function onSelectStart(e) {
  if (e.target !== stylus || !desk_set) return;
	selectState = true;

	const painter = stylus.userData.painter;
	painter.moveTo(stylusPos);
	this.userData.isSelecting = true;

	accuracy_helper.startAccuracyTracking()
	event_logger.logEventData('stylus_draw_button_pressed')
}

// MARK: Front Button Release
function onSelectEnd() {
  this.userData.isSelecting = false;
	selectState = false;

	try {
	paint_exporter_instance.saveMesh(this.userData.painter.mesh) // Save painting with uuid, can be used to reference painting later for export or other functions
	}
	catch (error) {
		console.error("Error saving painting array:", error);
	}
	accuracy_helper.stopAccuracyTracking()

	event_logger.logEventData('stylus_draw_button_released')
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
		const brush = vrControl.getBrush();
		const relativePos = brush ? getRelativePosition(brush, currentBox) : getRelativePosition(stylus, currentBox);
		if (userData.isSelecting || isDrawing) {
			cursor.set(relativePos.x, relativePos.y, relativePos.z);
			painter.lineTo(cursor);
			painter.update();
		} else {
			painter.moveTo(relativePos.x, relativePos.y, relativePos.z); // moves current path to pen
		}
	}
}

function getCurrentObjs() {
	let currentObj = objsToTest1;
	switch (taskNum) {
		case 2:
			currentObj = objsToTest2;
			break;
		case 3:
			currentObj = objsToTest3;
			break;
	}
	return currentObj
}


// MARK: Raycast function
function raycast() {
	const objsToTest = getCurrentObjs();

	return objsToTest.reduce( ( closestIntersection, obj ) => {
		const intersection = raycaster.intersectObject( obj, true );

		if ( !intersection[ 0 ] ) return closestIntersection;

		if ( !closestIntersection || intersection[ 0 ].distance < closestIntersection.distance ) {
			intersection[ 0 ].object = obj;
			return intersection[ 0 ];
		}

		return closestIntersection;

	}, null );

}
// MARK: Survey buttons intersection
function updateButtons() {


	// Find closest intersecting object
	let intersect;
	const objsToTest = getCurrentObjs();

	if ( renderer.xr.isPresenting && isQuestionnaireMode) {

		vrControl.setFromController(raycaster.ray);
		intersect = raycast();

		// Position the little white dot at the end of the controller pointing ray
		if ( intersect ) vrControl.setPointerAt(intersect.point);

	}

	// Update targeted button state (if any)
	if ( intersect && intersect.object.isUI ) {
		if ( selectState ) {
			// Component.setState internally call component.set with the options you defined in component.setupState
			intersect.object.setState( 'selected' );
		} else {
			intersect.object.setState( 'hovered' );
		}
	}

	// Update non-targeted buttons state
	objsToTest.forEach( ( obj ) => {
		if ( ( !intersect || obj !== intersect.object ) && obj.isUI ) {
			// Component.setState internally call component.set with the options you defined in component.setupState
			obj.setState( 'idle' );
		}
	} );

}


// MARK: Button Feedback
function buttonFeedback() {
	clickSound.play(); // Sound effect for button press

	try {
		// checks if gamepad has haptics (breaks on hand)
		const actuator = gamepadInterface.getHapticActuator && gamepadInterface.getHapticActuator(0);
		if (actuator && typeof actuator.pulse === 'function') {
			actuator.pulse(1.0, 200);
		}
	} catch (e) {
		console.error(e)
	}
}

// MARK: SVG Load Functions
function loadSVG(url, position, isResult, color) {
	const loader = new SVGLoader();

	loader.load(url, function (data) {
		const group = new THREE.Group();

		let renderOrder = 0;

		for (const path of data.paths) {
			const strokeColor = path.userData.style.fill;

			const material = new THREE.MeshBasicMaterial({
				color: color || outlineColor,
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
					color: inkColor,
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
	
	// Flash the sky by changing its color to the specified color and then back to white after the duration

	// setTimeout(() => {
		// scene.background = envMap
	// }, 500); 

	red_button.makeInvisible();
	nextButton.makeVisible();
	desk_set = true;

	uiManager.practiceMode(deskCoords);
	loadSVG(practiceSvgArray[0], CENTER_POSITION);
	stylus.userData.painter = practicePaints[0];
	// only draw brush once and only draw it on controller
	if (!mx_ink_connected) {
		vrControl.drawBrush(stylusPos)
		hideControllerModel(controller1)
	}
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
		event_logger.logEventData('practicebegin')

		practicePaints.forEach((paint) => {
			paint.mesh.visible = false;
		});
		practicePaints[practiceShapeIndex].mesh.visible = true;

	} else {
		isPracticeMode = false;
		isDrawingDisabled = true;
		pracBox.visible = false;

		practicePaints.forEach((paint) => {
			paint.mesh.visible = false;
		});
		storyUIManager.practicePromptVisible();
		desk_manager.clearSurface();
		desk_manager.makeSurfaceInvisible();

		nextButton.changeColor('#359743');
		nextButton.updateLabel("Tasks");
		repeatPracticeButton.makeVisible();
		repeatPracticeButton.updateLabel("Repeat");

		uiManager.taskMode();

	}

}

// MARK: MODE: Task
const TaskMode = () => {
	if (isPreTask) {
		desk_manager.clearSurface();
		desk_manager.makeSurfaceInvisible();
		repeatPracticeButton.makeInvisible();

		nextButton.updateLabel("Start");
		storyUIManager.showTask(taskNum);
		isPreTask = false
		storyUIManager.practicePromptInvisible();


	}
	else if (shapeIndex < svgWithPositionsArray.length - 1) {
		desk_manager.makeSurfaceVisible();
		storyUIManager.makeInvisible();

		isDrawingDisabled = false;
		shapeIndex += 1;

		event_logger.logEventData(`${taskOrder[taskNum -1].name}_#${shapeIndex}_begin`)

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
		
		currentAccuracy = accuracy_helper.getMeanAccuracy();

		// TODO: Please find enclosed the accuracy percentage:
		console.log(`Accuracy: ${currentAccuracy.toString()} %`)

		event_logger.logEventData(`Accuracy_task_${taskNum}:${currentAccuracy}%`)

		taskTextPanel.updateText(
			`Task ${taskNum} complete` + '\nAre you ready to see your drawing?',
		);


		event_logger.logEventData(`task${taskNum}_complete`);
		if (!mx_ink_connected) {
			showControllerModel(controller1)
		}

	}
}

// MARK: MODE: Show Results
const ShowResultsMode = () => {
	isDrawingDisabled = true;

	desk_manager.clearSurface();
	desk_manager.makeSurfaceInvisible();
	taskTextPanel.makeInvisible();

	currentAccuracy = 55;
	if (currentAccuracy > 84) {
		resultsUIManager.highAccuracy()
	} else if  (currentAccuracy < 51) {
		resultsUIManager.lowAccuracy()
	} else {
		resultsUIManager.mediumAccuracy()
	}

	// original svg
	originalSvgManager.clearSurface();
	originalSvgManager.makeSurfaceVisible();
	const original = originalSvgManager.getSurface();
	desk_manager.addMesh(original);
	original.position.set(
		deskCoords.x + 0.5, // on desk, this is basically z
		deskCoords.y +0.2 ,
		deskCoords.z + 0.1 , // x
	);

	loadSVG(taskOrder[taskNum -1].url, CENTER_POSITION, true, "black");

	const taskRevealPos = {
		x: deskCoords.x + 0.5, // on desk, this is basically z
		y: deskCoords.y +0.2,
		z: deskCoords.z + 0.8, // x
	}

	switch (taskNum) {
		case 1:
			original.rotateY(Math.PI / 2) // rotating 90deg because added to table, flip only once
			task1ParentManager.makeVertical(
				taskRevealPos.x,
				taskRevealPos.y,
				taskRevealPos.z,
			);
			break;
		case 2:
			task2ParentManager.makeVertical(
				taskRevealPos.x,
				taskRevealPos.y,
				taskRevealPos.z,
			);
			break;
		case 3:
			// event_logger.logEventData('Environment Changed: ' + environment_switcher.loadNextEnvironmentCondition())
			task3ParentManager.makeVertical(
				taskRevealPos.x,
				taskRevealPos.y,
				taskRevealPos.z,
			);
			break;
	}

	svgWithPositionsArray.forEach((obj, i) => {
		svgPaintsArray[i].mesh.position.y =  isHorizontalSurface ? obj.position.y : obj.position.y + 0.3;
		svgPaintsArray[i].mesh.position.x = obj.position.x;
		svgPaintsArray[i].mesh.position.z -=  isHorizontalSurface ? 0.1 : 0.02;
		svgPaintsArray[i].mesh.rotateX(Math.PI); // flip each because they're upside down for some reason
		svgPaintsArray[i].mesh.rotateY(Math.PI); // flip each because they're flipped as well
		svgPaintsArray[i].mesh.visible = true;
	});

	nextTaskButton.makeVisible();
	nextButton.makeInvisible();
}

// MARK: MODE: Questionnaire
/*
const QuestionnaireMode = () => {

	isQuestionnaireMode = true;

	// make ray and point visible for active controller
	vrControl.makeRayVisible();

	resultsUIManager.makeInvisible()

	originalSvgManager.makeSurfaceInvisible();

	scene.remove(svgManager.getSurface());

	svgWithPositionsArray.forEach((obj, i) => {
		svgPaintsArray[i].mesh.visible = false;
	});

	if (BROWSER_TESTING) {
		questionnaire1.setPosition(deskCoords);
		questionnaire1.makeQuestionnaireVisible(nextTaskButton);
		task1ParentManager.makeInvisible();
	}


	switch (taskNum) {
		case 1:
			questionnaire1.setPosition(deskCoords);
			questionnaire1.makeQuestionnaireVisible(nextTaskButton);
			task1ParentManager.makeInvisible();

			break;
		case 2:
			questionnaire2.setPosition(deskCoords);
			questionnaire2.makeQuestionnaireVisible(nextTaskButton);
			task2ParentManager.makeInvisible();

			break;
		case 3:
			questionnaire3.setPosition(deskCoords);
			questionnaire3.makeQuestionnaireVisible(nextTaskButton);
			task3ParentManager.makeInvisible();
			break;
	}

	questionnaire1.setPosition(deskCoords);
	questionnaire1.makeQuestionnaireVisible(nextTaskButton);
}
*/

const SetupNextTask = () => {
	isQuestionnaireMode = false;
	vrControl.makeRayInvisible()
	desk_manager.makeSurfaceInvisible();
	
	// In some cases the initially loaded env is the same as the next env
	// TODO: After pilot study - use skyboxvoidfloorenv as an initial menu/splash screen 

	// Oneline - Logs environment change and cycles to next environment in shuffled list
	// event_logger.logEventData('Environment Changed' + environment_switcher.loadNextEnvironmentCondition())

	shapeIndex = -1;
	taskNum += 1;

	svgWithPositionsArray = svgManager.getTaskArray(taskOrder[taskNum -1].name);
	svgPaintsArray = svgManager.getPaintsArray(taskNum);

	desk_manager.makeSurfaceVisible();
	nextButton.makeVisible();
	taskTextPanel.makeInvisible();

	isPreTask = true;

	if (!mx_ink_connected) {
		hideControllerModel(controller1)
	}

	switch (taskNum) {
		case 1:
			break;
		case 2:
			// event_logger.logEventData('questionnaire1_' + questionnaire1.getAnswers())
			// taskTextPanel.updateText(`Task 2: ${taskOrder[taskNum - 1].name}`);
			svgManager.setupPaints(2, task2Box);
			break;
		case 3:
			// event_logger.logEventData('questionnaire2_'+ questionnaire2.getAnswers())
			// taskTextPanel.updateText(`Task 3: ${taskOrder[taskNum - 1].name}`);
			svgManager.setupPaints(3, task3Box);
			break;

	}
}
// MARK: MODE:  Finish
const FinishMode = () => {
	// event_logger.logEventData('questionnaire3_' + questionnaire3.getAnswers())
	svgWithPositionsArray.forEach((obj, i) => {
		svgPaintsArray[i].mesh.visible = false;
	});

	storyUIManager.finishVisible();


	// MARK: Export
	// Export all data
	// event_logger.downloadAllData(); // Download stylus and task event data as text files
	event_logger.downloadUnityData()

	// Export Paintings
	// TODO: Error handling for no paint mesh condition
	// paint_exporter_instance.downloadJSON();
	
	// Compressand download all files at once will crash the browser

	// paint_exporter_instance.compressAndDownload()

	resultsUIManager.makeInvisible()

	originalSvgManager.makeSurfaceInvisible();
	svgManager.makeAllPaintsVisible();

	scene.remove(svgManager.getSurface());

	const parentArray = [
		task1ParentManager.getParent(),
		task2ParentManager.getParent(),
		task3ParentManager.getParent(),
	];

	parentArray.forEach((p, i) => {
		p.material.visible = true;
		switch (i) {
			case 0:
				p.position.z -= 1;
				break;
			case 1:
				p.position.z -= 0.5;
				break;

			case 2:
				break;
		}
	})
}

