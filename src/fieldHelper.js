import * as THREE from 'three';

export default class EnterField {
    constructor(scene) {
        this.scene = scene
        this.colour = false
        this.start_state = true
        this.start_end_position = false
        this.enterfield_object = false
        this.enterfield_drawn = false
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

    addEnterField() {

        if (this.enterfield_drawn) {
            this.enterfield_drawn = false
            this.scene.remove(this.enterfield_object)
            this.enterfield_object = false
        }

        this.enterfield_object = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.01), new THREE.MeshBasicMaterial({ color: this.colour, wireframe: true }))
        this.scene.add(this.enterfield_object)
        this.enterfield_object.position.set(this.start_end_position.x, this.start_end_position.y, this.start_end_position.z)
        this.enterfield_drawn = true
    }

}