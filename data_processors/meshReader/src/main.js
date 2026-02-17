import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const scene = new THREE.Scene()

let origin_cube_geometry = new THREE.BoxGeometry(0.01,0.01,0.01)
const orign_cube_material = new THREE.MeshBasicMaterial({
    color: "red",
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    opacity: 0.1,
    transparent: true
});

const material = new THREE.MeshBasicMaterial({
    color: "red",
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,

});

const mesh = new THREE.Mesh(origin_cube_geometry, orign_cube_material)

// scene.add(mesh)

scene.add(new THREE.HemisphereLight(0x888877, 0x777788, 3));
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(0, 4, 0);
scene.add(light);

const temp = {width: 1024, height: 720}

const camera = new THREE.PerspectiveCamera(10, temp.width / temp.height)

let canvas = document.querySelector('canvas.webgl')

const renderer = new THREE.WebGLRenderer({antialias: true, canvas})
renderer.setAnimationLoop(animate);
renderer.setSize(temp.width, temp.height)

// camera.position.y = -0.8
camera.position.z = 0.1


const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.update();

renderer.render(scene, camera)

function animate() {
    renderer.render(scene, camera)
} 


function reconstructMeshFromJSON(jsonString) {
  const meshData = JSON.parse(jsonString);
  console.log(Object.keys(meshData).length)


    for (const i in meshData) {
        console.log('meshobj1:', meshData[i])
        let mesh_at_index = meshData[i]
        // Reconstruct geometry
        const geometry = new THREE.BufferGeometry();
        

        // Set position attribute
        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(mesh_at_index.geometry.vertices, 3)
        );
        
        // Set normal attribute if available
        if (mesh_at_index.geometry.normals) {
            geometry.setAttribute(
            'normal',
            new THREE.Float32BufferAttribute(mesh_at_index.geometry.normals, 3)
            );
        }
        
        // Set UV attribute if available
        if (mesh_at_index.geometry.uvs) {
            geometry.setAttribute(
            'uv',
            new THREE.Float32BufferAttribute(mesh_at_index.geometry.uvs, 2)
            );
        }
        
        // Set indices if available
        if (mesh_at_index.geometry.indices) {
            geometry.setIndex(mesh_at_index.geometry.indices);
        }
        
        // // Reconstruct material
        // let material;
        // if (mesh_at_index.material.type === 'MeshBasicMaterial') {
        //     material = new THREE.MeshBasicMaterial();
        // } else if (mesh_at_index.material.type === 'MeshStandardMaterial') {
        //     material = new THREE.MeshStandardMaterial();
        // } else if (mesh_at_index.material.type === 'MeshPhongMaterial') {
        //     material = new THREE.MeshPhongMaterial();
        // } else {
        //     material = new THREE.MeshBasicMaterial(); // fallback
        // }
        
        // Apply material properties
        // if (mesh_at_index.material.color !== null) {
        //     material.color.setHex(mesh_at_index.material.color);
        // }
        // material.opacity = mesh_at_index.material.opacity;
        // material.transparent = mesh_at_index.material.transparent;
        // material.side = mesh_at_index.material.side;
        // material.wireframe = mesh_at_index.material.wireframe;
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        
        // Apply transforms
        // mesh.position.fromArray(mesh_at_index.position);
        // mesh.rotation.fromArray(mesh_at_index.rotation);
        // mesh.scale.fromArray(mesh_at_index.scale);
        // mesh.scale.set(10, 10, 10)
        scene.add(mesh)
        mesh.position.set(0,-2,0)
         console.log(mesh)
    }
}

// movement - please calibrate these values
var xSpeed = 0.1;
var ySpeed = 0.1;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 87) {
        camera.position.y += ySpeed;
    } else if (keyCode == 83) {
        camera.position.y -= ySpeed;
    } else if (keyCode == 65) {
        camera.position.x -= xSpeed;
    } else if (keyCode == 68) {
        camera.position.x += xSpeed;
    } else if (keyCode == 32) {
        camera.position.set(0, 0, 0);
    }
};

document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result; // File content as a string
    console.log(content);

    // Parse JSON
    // Reconstruct mesh

    // Reconstruct from JSON string
    const reconstructedMesh = reconstructMeshFromJSON(content);
    renderer.render(scene, camera)
    console.log(scene.children)

  };
  reader.readAsText(file); // Reads file as text (UTF-8 by default)
});