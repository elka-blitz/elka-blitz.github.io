import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { TubePainter } from "three/examples/jsm/misc/TubePainter.js";
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRButton } from "three/examples/jsm/webxr/XRButton.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";


let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;
let stylus;
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

// Walls
// const wallGeometry = new THREE.PlaneGeometry(6, 6);
// const wallMaterial = new THREE.MeshStandardMaterial({ color: 'yellow' });
// const wall = new THREE.Mesh(wallGeometry, wallMaterial);

const floorGeometry = new THREE.PlaneGeometry(6, 6);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 'black' });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);

const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x89F336});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
const cube2 = new THREE.Mesh(
	new THREE.BoxGeometry(0.3, 0.3, 0.3),
	new THREE.MeshStandardMaterial({ color: '#F54927' }),
);
const drawMaterial = new THREE.MeshNormalMaterial({
	flatShading: true,
	side: THREE.DoubleSide,
});

let painter1;

init();

function init() {
	const canvas = document.querySelector("canvas.webgl");
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x1f0091);
	
	scene.add(cube);
	cube.position.set(0, 1, -1.5);

	scene.add(cube2);
	cube2.position.set(0, 2, -1.5);

	// wall.position.set(0, 2, -3)
	// scene.add(wall)
	

	floor.rotateX(-Math.PI / 2);
	scene.add(floor);

	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 50);
	camera.position.set(0, 1.6, 3);

	const controls = new OrbitControls(camera, canvas);
	controls.target.set(0, 1.6, 0);
	controls.update();

	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath("/draco/");

	const gltfLoader = new GLTFLoader();
	gltfLoader.setDRACOLoader(dracoLoader);

	const grid = new THREE.GridHelper(4, 1, 0x111111, 0x111111);
	scene.add(grid);

	scene.add(new THREE.HemisphereLight(0x888877, 0x777788, 3));

	const light = new THREE.DirectionalLight(0xffffff, 1.5);
	light.position.set(0, 4, 0);
	scene.add(light);

	painter1 = new TubePainter();
	painter1.mesh.material = material;
	painter1.setSize(0.1);

	scene.add(painter1.mesh);

	renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
	renderer.setPixelRatio(window.devicePixelRatio, 2);
	renderer.setSize(sizes.width, sizes.height);
	
	renderer.xr.enabled = true;

	// const environment = new RoomEnvironment(renderer);
	// const pmremGenerator = new THREE.PMREMGenerator(renderer);
	// scene.environment = pmremGenerator.fromScene(environment).texture;

	const player = new THREE.Group();
	scene.add(player);
	player.add(camera);

	document.body.appendChild(VRButton.createButton(renderer));
	renderer.setAnimationLoop(animate);

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
	}

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

function onFrame() {
	
	cube.rotateX(0.01)
	cube.rotateY (0.01)
	cube2.rotateY(0.05)
	cube2.rotateX(0.05)

}

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
