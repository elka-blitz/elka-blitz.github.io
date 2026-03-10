import * as THREE from 'three';

export default class accuracyHelper {
    constructor() {
        console.log('Accuracy online')
        this.realtime_accuracy_percentage = false
        this.mean_accuracy_percentage = false
        this.closest_dash_position = false
        this.shortest_distance = false
        this.track_accuracy = false

        this.current_dash_array = false
        this.min_distance = Infinity
        this.closest_point = false
        this.target_point = false
        this.sample_no = 2
    }

    setSvgPoints(svg_point_array) {
        this.svg_point_array = svg_point_array
    }

    getClosestPointOnSvg(stylus_position) {
        this.min_distance = Infinity
        this.closest_point = false
        this.shortest_distance = false

        this.target_point = new THREE.Vector3(stylus_position.x, stylus_position.y, stylus_position.z)

        for (const point_index in this.svg_point_array) {
            let point_vector = new THREE.Vector3(this.svg_point_array[point_index].x, this.svg_point_array[point_index].y, this.svg_point_array[point_index].z) 
            let distance_check = point_vector.distanceTo(this.target_point)
                if (this.min_distance > distance_check) {
                    this.min_distance = distance_check

                    this.closest_point = point_vector
                }
        }
        this.shortest_distance = this.min_distance
        return this.closest_point
    }

    calculateAccuracy() {
        if (this.track_accuracy && this.shortest_distance <= 0.1) { // Conditional
            this.realtime_accuracy_percentage = (0.1 - this.shortest_distance)  * 10

            if (!this.mean_accuracy_percentage) {
                this.mean_accuracy_percentage = this.realtime_accuracy_percentage
            }

            this.mean_accuracy_percentage = (this.realtime_accuracy_percentage + this.mean_accuracy_percentage) / this.sample_no
            this.sample_no += 1
        }
    }

    getMeanAccuracy() {
        return Math.round(this.mean_accuracy_percentage * 10000)
    }

    resetMeanAccuracy() {
        this.sample_no = 2
        this.mean_accuracy_percentage = false
    }
    
    startAccuracyTracking() {
        this.track_accuracy = true
    }

    stopAccuracyTracking() {
        this.track_accuracy = false
    }
}