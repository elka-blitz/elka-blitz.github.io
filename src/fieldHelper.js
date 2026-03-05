import * as THREE from 'three';

export default class EnterField {
    constructor(scene) {
        this.scene = scene
        this.colour = false
        this.start_state = true
        this.start_end_position = false
        this.enterfield_object = false
        this.enterfield_drawn = false
        this.enterfield_boundingbox = false
        this.user_is_drawing = false // true when 2cm from cube
        this.prev_user_is_drawing = false
        this.user_started_drawing = false
    }

    setStartState() {
        this.colour = 0x00ff00
        this.start_state = true
    }

    setEndState() {
        this.colour = 0xff0000
        this.start_state = false
    }

    setNewStartPosition(position_vector) {
        this.start_end_position = position_vector
    }

    updateEnterField() {

        if (this.enterfield_drawn) {
            this.enterfield_drawn = false
            this.scene.remove(this.enterfield_object)
            this.enterfield_object = false
        }

        this.enterfield_object = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.01), new THREE.MeshBasicMaterial({ color: this.colour, wireframe: true }))
        this.scene.add(this.enterfield_object)
        this.enterfield_object.position.set(this.start_end_position.x, this.start_end_position.y, this.start_end_position.z)
        this.enterfield_drawn = true

        this.enterfield_object.geometry.computeBoundingBox()
        this.enterfield_boundingbox = new THREE.Box3().setFromObject(this.enterfield_object)
    }

    removeEnterField() {
        this.enterfield_drawn = false
        this.scene.remove(this.enterfield_object)
        this.enterfield_object = false
    }

    checkForStylus(stylus_pos) {
        // if (this.enterfield_drawn == true) {

            // ifelif
            // Condition: Drawing started 

            // console.log('stylusfarcond', stylus_pos.distanceTo(this.start_end_position) >= 0.02)
            try {
                console.log('stylus2cmdist: ', stylus_pos.distanceTo(this.start_end_position) >= 0.02)
                console.log('startstateshouldbe false', this.start_state)
                console.log('userstartdraw should be true', this.user_started_drawing)

                if (stylus_pos.distanceTo(this.start_end_position) >= 0.02 && !this.start_state && this.user_started_drawing) {
                    this.user_started_drawing = false
                    this.user_is_drawing = true
                    this.updateEnterField() //framediffish
                    return false

                }

                else if (!this.user_started_drawing && !this.user_is_drawing && !this.enterfield_drawn && this.start_state && stylus_pos.distanceTo(this.start_end_position) >= 0.02) {
                    // Force user to move pen 2cm from cube to start next drawing and spawn next cube
                    this.updateEnterField() 
                }

                // Condition: Await drawing start
                // console.log('containspoint', this.enterfield_boundingbox.containsPoint(stylus_pos))
                else if (this.enterfield_boundingbox.containsPoint(stylus_pos) && this.start_state && this.enterfield_drawn) {
                    this.scene.remove(this.enterfield_object)
                    this.setEndState()
                    // this.updateEnterField()
                    this.removeEnterField()
                    this.start_state = false
                    this.user_started_drawing = true
                    return false
                }

                // Condition: Await drawing end
                else if (this.enterfield_boundingbox.containsPoint(stylus_pos) && !this.start_state && this.enterfield_drawn) {
                    this.scene.remove(this.enterfield_object)
                    this.setStartState()
                    this.removeEnterField()
                    // this.updateEnterField()
                    this.user_started_drawing = false
                    this.user_is_drawing = false

                    return true
                }
            } catch {
                console.log('caught')
            }
        // }

        // Check distance greater than 2cm, init endpoint if start state is false
        // if (stylus_pos.distanceTo(this.start_end_position) >= 0.02 && !this.start_state) {
        //     this.updateEnterField()
        // }
    }

    rotateField() {
        if (this.enterfield_object !== false) {
            this.enterfield_object.rotateX(1)
            this.enterfield_object.rotateY(1)
        }
    }

}