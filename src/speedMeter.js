import * as THREE from "three";

export default class speedMeter {
    constructor (scene) {
        this.scene = scene
        this.previous_point = null
        this.current_point = null
        this.calculated_distance = null
        this.calculated_speed = null
        this.current_position_vector = null
    }

    getSpeed(current_stylus_position){

        // Skip invalid (?) stylus position reads
        if (current_stylus_position.x == 0) {
            return 1
        }

        
        this.current_position_vector = new THREE.Vector3(current_stylus_position.x, current_stylus_position.y, current_stylus_position.z)

        // Assuming that this function is called in delta time part
        // So, 5 times per second
        // Can have it's own delta time call
        // Call every second?
        // Five times per second makes it more responsive

        // Function is called 5 times a second, but needs to handle initial null values
        if (this.previous_point === null) {
            this.previous_point = current_stylus_position
            
            console.log('returning', this.previous_point)
            return 1 // Instance now has a previous reference point
        } 

        this.current_point = current_stylus_position

        // Calculate distance between previous point and current point
        // Will be in meters
        this.calculated_distance = (this.previous_point.distanceTo(this.current_position_vector))
        // console.log(this.calculated_distance)

        // Calculate speed (cm per second)
        this.calculated_speed = this.calculated_distance * 1000// / 0.2 // Seconds sicne last point registered

        this.previous_point = this.current_position_vector

        return Math.round(this.calculated_speed)
    }
}