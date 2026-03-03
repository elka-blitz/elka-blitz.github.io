import * as THREE from 'three';

// Class is re-initialised with every svg, so contructor svg is operating svg
export default class DrawingAccuracy {
    constructor(scene) {
        this.scene = scene
        this.line_dashes_uuids = []
        this.line_dashes = []
        this.distance_store = Infinity
    }

    get_svg() {
        try{
            return null //this.raycaster.intersectObjects(this.scene.children)
        } catch (e) {
            console.log('error raycaster: ', e)
        }
    }

    getLineDashes() {
        return this.line_dashes
    }

    setAccuracyReferencePointForSubPath(point) {
        this.line_dashes.push(point)
    }

    getClosestPoint(dash_line_points_array, stylus_position_vector) {
        // console.log('stypos: ', stylus_position_vector.x)
        let closest_point
        let target_point
        try{
            target_point = new THREE.Vector3(stylus_position_vector.x, stylus_position_vector.y, stylus_position_vector.z)
        } catch (e) {
            console.log('Styluspointerror:, ', e)
            return false
        }

        let min_distance = Infinity
        this.distance_store = Infinity

        for (const point_index in dash_line_points_array) {
            let point_vector = new THREE.Vector3(dash_line_points_array[point_index].x, dash_line_points_array[point_index].y, dash_line_points_array[point_index].z)
            let point3d = new THREE.Vector3(point_vector.x, point_vector.y, point_index.z)
            let distance_checked = point3d.distanceTo(target_point)

            if (min_distance > distance_checked) {
                min_distance = distance_checked
                 
                closest_point = point3d
                
            }
        }
        console.log(min_distance)
        return closest_point

    }
}