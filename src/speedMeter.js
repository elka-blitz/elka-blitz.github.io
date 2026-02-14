export default class speedMeter {
    constructor (scene) {
        this.scene = scene
        this.previous_point = null
        this.current_point = null
        this.calculated_speed = null
    }
}