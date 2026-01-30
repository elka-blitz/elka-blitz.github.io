import * as THREE from 'three'

import { createText } from 'three/examples/jsm/webxr/Text2D';
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
        this.hovering;
    }

    returnExists() {
        // return this.exists
        return this.cylinder.visible
    }

    createButton(position, colour, label, radius) {
        this.geometry = new THREE.CylinderGeometry(radius || 0.05, radius || 0.05, 0.05, 32);
        this.geometry.computeBoundingBox()
        this.cyl_material = new THREE.MeshBasicMaterial({ color: colour });
        this.cylinder = new THREE.Mesh(this.geometry, this.cyl_material);
        // this.cylinder.rotateX(1.570796) // 90deg
        this.scene.add(this.cylinder)
        this.cylinder.position.set(position.x, position.y, position.z)

        this.max_height = this.cylinder.position.y + (this.cylinder.geometry.boundingBox.max.y / 2)
        this.min_height = this.cylinder.position.y - (this.cylinder.geometry.boundingBox.max.y / 2)
        this.inititial_height = this.cylinder.position.y

        this.cylinder_bb = new THREE.Box3().setFromObject(this.cylinder)//this.geometry.boundingBox 

        // this.boxHelper = new THREE.BoxHelper(this.cylinder, '#ffff00')
        
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

        // this.scene.add(this.boxHelper)
        this.cylinder.updateMatrixWorld()
        console.log(this.cylinder)
        
        // Return object and boundingbox
        this.button = this.cylinder
        this.button_bb = this.cylinder_bb

        // Add label
        if (label != null) {
            this.button_label_text = createText(label, 0.04)
            // this.button_label_text.position.set(this.cylinder.position.x, this.max_height, this.cylinder.position.z)
            this.button_label_text.rotateX(-1.5707960) // -90deg
            // this.button_label_text.quaternion.copy(this.cylinder.quaternion)
            this.cylinder.add(this.button_label_text)
            this.button_label_text.position.y = 0.03 // Hardcoded
        }

        return this.cylinder
    }
    
    moveButton(end_position) {
        let starting_position = this.cylinder.position
        gsap.to(this.cylinder.position, {
            x: end_position.x,
            y: end_position.y,
            z: end_position.z,
            duration: 0.5,
            onComplete: () => {
                this.cylinder_bb = new THREE.Box3().setFromObject(this.cylinder)
                // this.boxHelper.update()
                // this.boxHelper = new THREE.BoxHelper(this.cylinder, '#ffff00')
                this.cylinder.updateMatrixWorld()
            }
        })	
    }

    placeButton(end_position, scene) {
        this.cylinder.position.copy(new THREE.Vector3(end_position.x,
            end_position.y, end_position.z))
            this.cylinder_bb.setFromObject(this.cylinder)
            // this.cylinder.updateMatrixWorld()
            
            // scene.remove(this.boxHelper)
            // this.boxHelper = new THREE.BoxHelper(this.cylinder, '#ffff00')
            // scene.add(this.boxHelper)
            // this.boxHelper.update()

            // Update button attrs
            this.max_height = this.cylinder.position.y + (this.cylinder.geometry.boundingBox.max.y / 2)
            this.min_height = this.cylinder.position.y - (this.cylinder.geometry.boundingBox.max.y / 2)
            this.inititial_height = this.cylinder.position.y

    }

    hoverButtonByDesk(camera, desk, scene) {

        this.cylinder.position.copy(desk.position)
        this.cylinder.quaternion.copy(desk.quaternion)

        const offset = new THREE.Vector3(0, 0.8,0);
        // this.cylinder.position.add(offset.applyQuaternion(yOnlyQuaternion));
        this.cylinder.position.add(offset)

        const target = new THREE.Vector3()
        camera.getWorldPosition(target)
        target.y = this.cylinder.position.y
        this.cylinder.lookAt(target)

        // Update button attrs
        this.cylinder_bb.setFromObject(this.cylinder)
        // this.cylinder.updateMatrixWorld()
        // scene.remove(this.boxHelper)
        // this.boxHelper = new THREE.BoxHelper(this.cylinder, '#ffff00')
        // scene.add(this.boxHelper)
        // this.boxHelper.update()
        
        // Pseudo bounding logic? For press detect
        this.max_height = this.cylinder.position.y + (this.cylinder.geometry.boundingBox.max.y / 2)
        this.min_height = this.cylinder.position.y - (this.cylinder.geometry.boundingBox.max.y / 2)
        this.inititial_height = this.cylinder.position.y
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

        position_for_button.y = stylus.position.y

        // God knows what this does, I for one welcome our AI overlords
        // Welp here goes nothing
        return position_for_button
    }

    makeInvisible() {
        this.exists = false
        this.cylinder.visible = false
    }

		makeVisible() {
        this.exists = true;
        this.cylinder.visible = true;
    }

    pressCheck(stylus_position_vector, scene) {

        this.cylinder_bb.setFromObject(this.cylinder)
        // this.cylinder.updateMatrixWorld()
        scene.remove(this.boxHelper)
        // this.boxHelper = new THREE.BoxHelper(this.cylinder, '#ffff00')
        // scene.add(this.boxHelper)
        // this.boxHelper.update()

        if (this.cylinder_bb.containsPoint(stylus_position_vector) && stylus_position_vector.y < this.max_height) {
            console.log('Point in box');

            // Pseudocode
            // As stylus enters cyl:
            // dec h by (max_h.y - sty_pos.y)
            // && set cyl_pos.y as 50% h

            // cyl_pos = this.cylinder.position.y 
            // sty_pos = stylus_position_vector.y
            // h = this.cylinder.geometry.parameters.height

            // Move cyl vertically when stylus in bb
            this.cylinder.position.y = this.inititial_height - (this.max_height - stylus_position_vector.y);//(this.cylinder.geometry.parameters.height) / 2

            // Condition: Button is more than 50% pressed
            // The desk should lock before the pen hits the surface
            // - Otherwise the desk will reset before lock?
            // So trigger desk lock at 50% depression
            // Feature/ play a noise? 

            if (stylus_position_vector.y < this.inititial_height - 0.02) { // cyl pos is mid i.e 50%
                this.cylinder.visible = false;
                return true;
            }

            return false; // Return is used to fix desk
        }
        else {
            // this.cylinder.position.y = this.inititial_height
            // this.moveButton(new THREE.Vector3(this.inititial_height)
            return null;
        }
    }
}