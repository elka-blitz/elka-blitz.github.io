import * as THREE from 'three'

export default class activationZone {
    constructor(scene) {
        this.scene = scene
        this.color = false
        this.start_state = true
        this.start_position = false
        this.end_position = false

        this.start_object = false
        this.start_object_bb = false
        this.end_object = false
        this.end_object_bb = false
        this.enterfield_drawn = false

        this.user_is_drawing = false
        this.prev_user_is_drawing = false
        this.user_started_drawing = false
        this.override_end_position // special shapes

        this.new_shape_cycle = false
    }

    getStartEnd(svg_points) {
        this.start_position = svg_points[1]
        this.end_position = svg_points[2]
        console.log(this.start_position, this.end_position)
    }

    createActivationZones() {
        this.start_object = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.01), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }))
        this.scene.add(this.start_object)
        this.start_object.position.set(this.start_position.x, this.start_position.y, this.start_position.z)
        // this.start_object.computeBoundingBox()
        this.start_object_bb = new THREE.Box3().setFromObject(this.start_object)
        this.start_object.visible = false

        this.end_object = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.01), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }))
        this.scene.add(this.end_object)
        this.end_object.position.set(this.end_position.x, this.end_position.y, this.end_position.z)
        // this.end_object.computeBoundingBox()
        this.end_object_bb = new THREE.Box3().setFromObject(this.end_object)
        console.log(this.end_object)
        this.end_object.visible = false

        this.start_state = true
    }

    update(stylus_position) {
        // Check for stylus
        try {
            if (!this.user_is_drawing && this.start_state) {
                this.start_object.visible = true
            }

            if (this.start_state && this.start_object_bb.containsPoint(stylus_position)) {
                this.start_state = false
                this.user_is_drawing = true
                this.start_object.visible = false
                this.user_started_drawing = true
            }

            if (!this.start_state && this.start_object.position.distanceTo(stylus_position) >= 0.05) {
                this.end_object.visible = true
            }

            if (!this.start_state && this.end_object_bb.containsPoint(stylus_position)) {
                this.user_is_drawing = false
                this.end_object.visible = false
                this.start_state = true
                return true
            }
            if (!this.start_state && this.user_is_drawing && this.this.start_object.position.distanceTo(stylus_position) >= 0.05) {
                this.start_object.visible = true
                this.end_object.visible = false
                this.user_started_drawing = false
                this.start_state = true
            }

            else {
                return false
            }
        } catch {
            return false
        }
    }

    returnExists() {
        // if (this.start_position  !== false) {
        //     return true
        if (this.start_object !== false) {
            return true
        }
        else {
            return false
        }
   }

    getState() {
        return this.start_state
    }

    setInvisible() {
        this.start_object.visible = false
        this.end_object.visible = false
    }
}