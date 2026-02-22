import * as THREE from 'three';

export default class accuracyCalculator {
    // Loaded alongside svgs. Embed in svg loading function>
    // Takes loaded svg data
    constructor(mesh) {
        this.mesh = mesh

        // this.calc_base_svg = calc_base_svg

        // this.path_points
        // this.three_dimensional_points
        // this.target_point

        // this.min_distance = Infinity
        // this.closest_point = new THREE.Vector3()
    }

    getAccuracy(stylus_position) {
        // Returns a number, check if it actually is accuracy or just distance to origin
        this.target_point = stylus_position
        this.min_distance = Infinity // Every distance check should start fresh

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
                // console.log('Closest:', this.closest_point)
                // console.log('Minimum dist:', this.min_distance)
                return this.min_distance
            }
        })
    }

    getMinDistance() {

        console.log('Getting min distance to target point - ', this.target_point)
        return this.min_distance
    }

    getClosestPointOnMesh(stylus_position) {
        const position = this.mesh.geometry.attributes.position
        let minDist = Infinity
        let closestPoint = null

        const vertex = new THREE.Vector3()

        for (let i = 0; i < position.count; i++) {
            vertex.fromBufferAttribute(position, i)
            vertex.applyMatrix4(this.mesh.matrixWorld)

            const dist = stylus_position.distanceTo(vertex)
            if (dist < minDist) {
                minDist = dist
                closestPoint = vertex.clone()
            }
        }
    
        return {closest_point: closestPoint, distance: minDist}
    }

    closestPointOnMeshSurface(point) {
        let mesh = this.mesh

        const geometry = mesh.geometry;
        const position = geometry.attributes.position;
        const index = geometry.index;

        let minDist = Infinity;
        let closestPoint = new THREE.Vector3();

        const triangle = new THREE.Triangle();
        const tempClosest = new THREE.Vector3();
        const vA = new THREE.Vector3();
        const vB = new THREE.Vector3();
        const vC = new THREE.Vector3();

        const faceCount = index ? index.count / 3 : position.count / 3;

        for (let i = 0; i < faceCount; i++) {
            const a = index ? index.getX(i * 3)     : i * 3;
            const b = index ? index.getX(i * 3 + 1) : i * 3 + 1;
            const c = index ? index.getX(i * 3 + 2) : i * 3 + 2;

            vA.fromBufferAttribute(position, a).applyMatrix4(mesh.matrixWorld);
            vB.fromBufferAttribute(position, b).applyMatrix4(mesh.matrixWorld);
            vC.fromBufferAttribute(position, c).applyMatrix4(mesh.matrixWorld);

            triangle.set(vA, vB, vC);
            triangle.closestPointToPoint(point, tempClosest);

            const dist = point.distanceTo(tempClosest);
            if (dist < minDist) {
            minDist = dist;
            closestPoint.copy(tempClosest);
            }
        }

        return { closest_point: closestPoint, distance: minDist };
        }

    drawDebugLine(pointA, pointB, scene, color = 0x00ff00, size = 0.1) {
        const points = [pointA, pointB];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color });

        const line = new THREE.Line(geometry, material);
        scene.add(line);

        return line;
    }

    removeDebugLine(line, scene) {
        scene.remove(line)
        line.geometry.dispose()
        line.material.dispose()
    }

    changeMeshMaterialBasedOnAccuracy(accuracy) {
        // Example: Change color based on accuracy
        const material = this.mesh.material;
        if (accuracy < 0.1) {
            material.color.set(0x00ff00); // Green for high accuracy
        } else if (accuracy < 0.5) {
            material.color.set(0xffff00); // Yellow for medium accuracy
        } else {
            material.color.set(0xff0000); // Red for low accuracy
        }
    }
}