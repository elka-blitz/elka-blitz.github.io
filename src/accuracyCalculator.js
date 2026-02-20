import * as THREE from 'three';

export default class accuracyCalculator {
    // Loaded alongside svgs. Embed in svg loading function>
    // Takes loaded svg data
    constructor(calc_base_svg) {

        this.calc_base_svg = calc_base_svg

        this.path_points
        this.three_dimensional_points
        this.target_point

        this.min_distance = Infinity
        this.closest_point = new THREE.Vector3()
    }

    getAccuracy(stylus_position) {
        // Returns a number, check if it actually is accuracy or just distance to origin
        this.target_point = stylus_position

        this.calc_base_svg.paths.forEach(path => {
            if (path.color.r = 1) {
                path.subPaths.forEach(subPath => {
                    const points = subPath.getPoints(10) 
                    // Decreased to 10 from 100 beacuse the final linedash is pretty small. Could even be less
                    points.forEach(point => {
                        const point3D = new THREE.Vector3(point.x, point.y, 0)
                        const distance = point3D.distanceTo(this.target_point)
                        if (distance < this.min_distance) {
                            this.min_distance = distance
                            this.closest_point.copy(point3D)
                        }
                    })

                })
                console.log('Closest:', this.closest_point)
                console.log('Minimum dist:', this.min_distance)
            }
        })
    }

}