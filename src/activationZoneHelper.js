import * as THREE from 'three'

export default class activationZone {
    constructor(scene) {
        this.scene = scene
        this.color = false
        this.start_state = true
        this.start_position = false
        this.end_position = false

        this.enterfield_object = false
        this.enterfield_drawn = false

        this.enterfield_boundingbox = false
        this.user_is_drawing = false
        this.prev_user_is_drawing = false
        this.user_started_drawing = false
        this.override_end_position // special shapes
    }



}