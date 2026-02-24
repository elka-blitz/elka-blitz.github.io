import * as THREE from "three";

import { TubePainter } from "three/examples/jsm/misc/TubePainter.js";
import { textDownload } from './csvFunctions';

// console.log(txtFile)

export default class paintExporter {
    constructor(scene, camera) {
        this.scene = scene
        this.camera = camera

        this.saved_painting_uuids = []
        this.cursor = new THREE.Vector3();
        this.painter = new TubePainter();
        this.saved_meshes = []
        this.deconstructed_meshes = []
    }

    saveMesh(mesh) {
        this.saved_meshes.push(mesh)
    }

    loadPreviousMesh(x, y, z) {
        let duplicateMesh = this.saved_meshes[0].clone();
        duplicateMesh.position.set(x, y, z)
        console.log('Duplicated mesh = ', duplicateMesh)
        this.scene.add(duplicateMesh)
    }

    downloadMesh() {

        // Iterate over every mesh in saved_meshes array and pass it as a JSON object to downloadCSV
        this.saved_meshes.forEach(mesh => {
            // downloadCSV(JSON.stringify(mesh))
            // Store the variables required to reconstruct the mesh in an object

            let meshData = {
                // Geometry data
                geometry: {
                type: mesh.geometry.type,
                vertices: Array.from(mesh.geometry.attributes.position.array),
                normals: mesh.geometry.attributes.normal 
                    ? Array.from(mesh.geometry.attributes.normal.array) 
                    : null,
                uvs: mesh.geometry.attributes.uv 
                    ? Array.from(mesh.geometry.attributes.uv.array) 
                    : null,
                indices: mesh.geometry.index 
                    ? Array.from(mesh.geometry.index.array) 
                    : null
                },

                position: mesh.position.toArray(),
                rotation: mesh.rotation.toArray(),
                scale: mesh.scale.toArray()
            };

            this.deconstructed_meshes.push(meshData)
        })
        textDownload(JSON.stringify(this.deconstructed_meshes), 'deconstructed_meshes')
    }


    reconstructMesh(meshDataString) {



        let meshData = JSON.parse(meshDataString)

        console.log(Object.keys(meshData).length)

    }

    screenShotCanvas(canvas_dom_element) {
        // canvasScreenshot(canvas_dom_element)
		const dataURL = canvas_dom_element.toDataURL('image/png')
		const a = document.createElement('a');
		a.href = dataURL;
		a.download = 'canvas-screenshot.png';
		a.click();
    }

    downloadJSON() {
        // Iterate over every mesh in saved_meshes array and pass it as a JSON object to downloadCSV
        this.saved_meshes.forEach(mesh => {
            // downloadCSV(JSON.stringify(mesh))
            // Store the variables required to reconstruct the mesh in an object

            let meshData = {
                // Geometry data
                geometry: {
                type: mesh.geometry.type,
                vertices: Array.from(mesh.geometry.attributes.position.array),
                normals: mesh.geometry.attributes.normal 
                    ? Array.from(mesh.geometry.attributes.normal.array) 
                    : null,
                uvs: mesh.geometry.attributes.uv 
                    ? Array.from(mesh.geometry.attributes.uv.array) 
                    : null,
                indices: mesh.geometry.index 
                    ? Array.from(mesh.geometry.index.array) 
                    : null
                },

                position: mesh.position.toArray(),
                rotation: mesh.rotation.toArray(),
                scale: mesh.scale.toArray()
            };

            this.deconstructed_meshes.push(meshData)
        })
        textDownload(JSON.stringify(this.deconstructed_meshes), 'deconstructed_meshes')
    }
}
