export default class speedMeter {
    constructor (scene) {
        this.scene = scene
        this.previous_point = null
        this.current_point = null
        this.calculated_distance = null
        this.calculated_speed = null
    }

    getSpeed(){
        // Assuming that this function is called in delta time part
        // So, 5 times per second
        // Can have it's own delta time call
        // Call every second?
        // Five times per second makes it more responsive

        // Function is called 5 times a second, but needs to handle initial null values
        

        // Calculate distance between previous point and current point
        // Will be in meters
        this.calculated_distance = (this.previous_point.distanceTo(this.current_point) / 2)
        console.log(this.calculated_distance)

        // Calculate speed (cm per second)
        this.calculated_speed = this.calculated_distance / 0.2 // Seconds sicne last point registered

        return this.calculated_speed
    }
}