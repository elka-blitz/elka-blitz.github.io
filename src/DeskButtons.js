import * as THREE from 'three'

import { gsap } from 'gsap';   
export default class DeskButton {
    constructor (scene){
        this.scene = scene
        this.exists = true
        console.log('Red button initialised')
        this.max_height
        this.min_height
        this.inititial_height

        this.button;
        this.button_bb;
    }

    returnExists() {
        return this.exists
    }

    createButton(position, colour) {
        this.geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.15, 32);
        this.geometry.computeBoundingBox()
        this.cyl_material = new THREE.MeshBasicMaterial({ color: colour });
        this.cylinder = new THREE.Mesh(this.geometry, this.cyl_material);

        this.scene.add(this.cylinder)
        this.cylinder.position.set(position.x, position.y, position.z)

        this.max_height = this.cylinder.position.y + (this.cylinder.geometry.boundingBox.max.y / 2)
        this.min_height = this.cylinder.position.y - (this.cylinder.geometry.boundingBox.max.y / 2)
        this.inititial_height = this.cylinder.position.y

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
        console.log(this.cylinder)
        
        // Return object and boundingbox
        this.button = this.cylinder
        this.button_bb = this.cylinder_bb

        return this.cylinder
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

    moveToStylus(camera, stylus) {
        // Called during desk setup
        // Positions button according to stylus
        // Since its the same parameters as the desk, they should be aligned
        // Vibe code incoming, cthulu take the wheel

        const stylus_position = new THREE.Vector3(stylus.position.x, stylus.position.y, stylus.position.z)

        const distance = 0.5 // Distance from center of desk

        const camera_direction = new THREE.Vector3()
        camera.getWorldDirection(camera_direction)

        const horizontal_direction = new THREE.Vector3().crossVectors(camera_direction, new THREE.Vector3(0,1,0)).normalize()

        const position_for_button = new THREE.Vector3().copy(stylus_position).add(horizontal_direction.clone().multiplyScalar(distance))

        // God knows what this does, I for one welcome our AI overlords
        // Welp here goes nothing
        return position_for_button
    }
    pressCheck(stylus_position_vector) {
        if (this.cylinder_bb.containsPoint(stylus_position_vector) && stylus_position_vector.y < this.max_height) {
            console.log('Point in box')
            
            // As stylus enters cyl:
            // dec h by (max_h.y - sty_pos.y)
            // && set cyl_pos.y as 50% h

            // cyl_pos = this.cylinder.position.y 
            // sty_pos = stylus_position_vector.y
            // h = this.cylinder.geometry.parameters.height

            this.cylinder.position.y = this.inititial_height - (this.max_height - stylus_position_vector.y)//(this.cylinder.geometry.parameters.height) / 2
            // this.cylinder.geometry.parameters.height = this.max_height - stylus_position_vector.y

            return true
        }
        else {
            this.cylinder.position.y = this.inititial_height
            // this.moveButton(this.inititial_height)
        }
    }
}