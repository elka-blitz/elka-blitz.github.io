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
    }

    getStartEnd(svg_points) {
        this.start_position = svg_points[0]
        this.end_position = svg_points[svg_points.length - 1]


    }

    createActivationZones() {
        this.start_object = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.01), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }))
        this.scene.add(this.start_object)
        this.start_object.position.set(this.start_position.y, this.start_position.y, this.start_position.z)
        this.start_object.computeBoundingBox()
        this.start_object_bb = new THREE.Box3().setFromObject(this.start_object)

        this.end_object = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, 0.01), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }))
        this.scene.add(this.end_object)
        this.end_object.position.set(this.end_position.x, this.end_position.y, this.end_position.z)
        this.end_object.computeBoundingBox()
        this.end_object_bb = new THREE.Box3().setFromObject(this.end_object)
    }

    update(stylus_position) {
        // Check for stylus
        try {
            if (this.start_state && this.start_object_bb.containsPoint(stylus_position)) {
                

            }
        } catch {
        console.log('')}
    }


}