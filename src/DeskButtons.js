import * as THREE from 'three'

import { gsap } from 'gsap';   
export default class DeskButton {
    constructor (scene){
        this.scene = scene
        this.exists = true
        console.log('Red button initialised')
    }

    returnExists() {
        return this.exists
    }

    createButton(position, colour) {
    this.geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 32);
    this.geometry.computeBoundingBox()
    this.cyl_material = new THREE.MeshBasicMaterial({ color: colour});
    this.cylinder = new THREE.Mesh(this.geometry, this.cyl_material);



	this.scene.add(this.cylinder)
    this.cylinder.position.set(position.x, position.y, position.z)
 
    this.cylinder_bb = new THREE.Box3().setFromObject(this.cylinder)//this.geometry.boundingBox 
    this.boxHelper = new THREE.BoxHelper(this.cylinder, '#ffff00')
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
                this.boxHelper = new THREE.BoxHelper(this.cylinder, '#ffff00')
                this.cylinder.updateMatrixWorld()
            }
        })	
    }

    pressCheck(stylus_position_vector) {
        if (this.cylinder_bb.containsPoint(stylus_position_vector)) {
            console.log('Point in box')
            return true
        }
    }
}