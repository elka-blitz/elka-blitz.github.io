import * as THREE from 'three'

import { gsap } from 'gsap';   
export default class DeskButton {
    constructor (scene){
        this.scene = scene
    }

    createButton(position, colour) {
    this.geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 32);
    this.geometry.computeBoundingBox()
    this.cyl_material = new THREE.MeshBasicMaterial({ color: colour});
    this.cylinder = new THREE.Mesh(this.geometry, this.cyl_material);

    this.cylinder_bb = this.geometry.boundingBox 
    this.boxHelper = new THREE.BoxHelper(this.cylinder, '#ffff00')

	this.scene.add(this.cylinder)
    this.cylinder.position.set(position.x, position.y, position.z)
	// cube.rotateY(45)
    // gsap.to(this.cylinder.position, {
    //     x: 0.25,
    //     y: 0.25,
    //     z: 0.25,
    //     duration: 2,
    //     onComplete: () => {
    //         this.cylinder_bb = new THREE.Box3().setFromObject(this.cylinder)
    //         this.boxHelper.update()
    //         this.cylinder.updateMatrixWorld()
    //     }
    // })	
	this.scene.add(this.boxHelper)
	this.cylinder.updateMatrixWorld()


    }

    moveButton(end_position) {
        let starting_position = this.cylinder.position

        gsap.to(this.cylinder.position, {
            x: end_position.x,
            y: end_position.y,
            z: end_position.z,
            duration: 2,
            onComplete: () => {
                this.cylinder_bb = new THREE.Box3().setFromObject(this.cylinder)
                this.boxHelper.update()
                this.cylinder.updateMatrixWorld()
            }
        })	
    }
}