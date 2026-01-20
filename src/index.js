import * as THREE from "three";

import { GamepadWrapper, XR_BUTTONS} from 'gamepad-wrapper';
import { gamePadWrapper, getController, getControllerGrip } from './controllerFunctions';
import {
	getCube,
	getDashedLine,
	getFloor,
	getPngCube,
	getSquare,
} from './shapeFunctions';

import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Text } from 'troika-three-text';
import { TubePainter } from "three/examples/jsm/misc/TubePainter.js";
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";
import { devMenuLoader } from './devMenu';

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

// Cubes array
let menu_uuid_holder = null
let menu_bb_uuid_holder = null

// Menu state
let prevMenuSummon = false
let menuSummon = false
let menuSummonRelease = false
let buttonPressed = false
let flipBit = false


// Stylus info
let position = new THREE.Vector3();


// Cube Bounding box stuff
let boundingBox_cube3 = new THREE.Box3();

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

// Raycast stuff
const tempMatrix = new THREE.Matrix4();
let reticle;
const raycaster = new THREE.Raycaster();

const geometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -1)
]);
const line = new THREE.Line(geometry);
line.scale.z = 10; // Initial length


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

	// Reticle (visual indicator)
	reticle = new THREE.Mesh(
        new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
	);
	reticle.matrixAutoUpdate = false;
	reticle.visible = false;
	scene.add(reticle);

	// controller setup
	const controllerModelFactory = new XRControllerModelFactory();
	scene.add(getControllerGrip(0, renderer, controllerModelFactory));
	scene.add(getController(0, renderer, onControllerConnected, onSelectStart, onSelectEnd));

	scene.add(getControllerGrip(1, renderer, controllerModelFactory));
	scene.add(getController(1, renderer, onControllerConnected, onSelectStart, onSelectEnd,),);



}

	// spinning cubes
	scene.add(cube);
	cube.position.set(0, 1, -1.5);

	scene.add(cube2);
	cube2.position.set(0, 2, -1.5);

	// live stylus coords
	scene.add(debugText);
	debugText.position.set(1, 0.67, -1.44);
	debugText.rotateX(-Math.PI / 3.3);

	// Pen interaction debug cube
	// Haptics + drawing on surface
	scene.add(cube3)
	cube3.position.set(-0.5, 1, -0.3)
	boundingBox_cube3.setFromObject(cube3)
	console.log(boundingBox_cube3)

	// floor
	const floor = getFloor(6, 6, 'grey');
	floor.rotateX(-Math.PI / 2);
	scene.add(floor);

	// drawing paint
	painter1 = new TubePainter();
	painter1.mesh.material = material;
	painter1.setSize(0.1);

	scene.add(painter1.mesh);




	// square shape
	const squareSize = 0.4
	const xPos = 0
	const yPos = 1.6 // this will have to be height adjusted
	const userDistance = -0.2
	const leanTowards = 0.05

	scene.add(getSquare(squareSize, xPos, yPos, userDistance, leanTowards, true, 'white'));


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
function onFrame() {
	
	cube.rotateX(0.01)
	cube.rotateY (0.01)
	cube2.rotateY(0.05)
	cube2.rotateX(0.05)

	}

function animate() {
	debugText.sync()
  if (gamepad1) {
    prevIsDrawing = isDrawing;
    isDrawing = gamepad1.buttons[5].value > 0;
    // debugGamepad(gamepad1);

	try {
		debugText.text = ('FindMyStylus 📍\n' + 'x: ' + Math.round(stylus.position.x * 100) + '\ny: ' + Math.round(stylus.position.y * 100) + '\nz: ' + Math.round(stylus.position.z * 100) + '\nStylus detect = ' + boundingBox_cube3.containsPoint(stylus.position))
	if (boundingBox_cube3.containsPoint(stylus.position)) {
		gamepadInterface.getHapticActuator(0).pulse(0.5, 100)
	}
	} catch (e) {
		console.log(e)
	}
    if (isDrawing && !prevIsDrawing) {
      const painter = stylus.userData.painter;
      painter.moveTo(stylus.position);
    }


	// Menu logic / hacky event listener

	if (menu_uuid_holder != null) {
		if (new THREE.Box3().setFromObject(scene.getObjectByProperty('uuid', menu_uuid_holder)).containsPoint(stylus.position)) {
			gamepadInterface.getHapticActuator(0).pulse(0.5, 100)
		}
	}

	prevMenuSummon = menuSummon
	menuSummon = gamepad1.buttons[1].value > 0
	menuSummonRelease = menuSummon && prevMenuSummon
	
	if (!menuSummonRelease && !menuSummon && prevMenuSummon && !buttonPressed) {
		// Spawn Menu
		buttonPressed = true
	}

	if (menuSummonRelease && menuSummon && prevMenuSummon && buttonPressed) {
		buttonPressed = false
		flipBit = !flipBit

		if (flipBit && menu_uuid_holder == null) {
			const menu_surface = getPngCube(0.3, 0.01, 0.3, 'assets/survey_frame.png')
			const menu_surface_bb = new THREE.Box3()
			
			scene.add(menu_surface)
			menu_surface.position.set(stylus.position.x, stylus.position.y - 0.02, stylus.position.z)
			menu_surface.rotateX(-50)

			menu_surface_bb.setFromObject(menu_surface)

			menu_uuid_holder = menu_surface.uuid
			menu_bb_uuid_holder = menu_surface_bb.uuid
			camera.updateProjectionMatrix()
		}

		if (!flipBit && menu_uuid_holder != null) {
			scene.remove(scene.getObjectByProperty('uuid', menu_uuid_holder))
			menu_uuid_holder = null
			menu_bb_uuid_holder = null

		}
	}

	}


  handleDrawing(stylus);

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
	debugText.text = ('FindMyStylus 📍\n' + 'x: ' + Math.round(stylus.position.x * 100) + '\ny: ' + Math.round(stylus.position.y * 100) + '\nz: ' + Math.round(stylus.position.z * 100))
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
  if (e.target !== stylus){
	try {
		raycaster.setFromXRController(e.target);
		const intersections = raycaster.intersectObjects([cube3]);
		if (intersections.length > 0) {
			try {
				console.log('hit object', intersections[0].point)
				// debugText.text = intersections[0].object.uuid
				debugText.text = ('Intersection' + (intersections[0].point.x), (intersections[0].point.y), (intersections[0].point.z))
				// debugText.text = intersections[0].object.uuid
				line.scale.z = intersections[0].object.distance;
				if (gamepad1) {
					gamepadInterface.getHapticActuator(0).pulse(0.5, 100)
				}
			} catch (e) {
				console.log(e)
			}
		}
	} catch (error) {
		console.log(error)
		return;
	}
  }

  else {
	try {
	const painter = stylus.userData.painter;
	painter.moveTo(stylus.position);
	this.userData.isSelecting = true;
	} catch {
		return
	}
  }
}

function onSelectEnd() {
  this.userData.isSelecting = false;
}

function onSelect() {
	if (reticle.visible) {
	const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
	const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.05), material);
	mesh.position.setFromMatrixPosition(reticle.matrix);
	scene.add(mesh);
	}
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