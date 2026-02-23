import * as THREE from 'three'

export default class EnvironmentSwitcher {
    constructor(scene, initialEnvironment) {
        this.scene = scene
        this.currentEnvironment = null
        if (initialEnvironment) {
            this.scene.add(initialEnvironment)
            this.currentEnvironment = initialEnvironment
        }


        const floorGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
        const floorMaterial = new THREE.MeshBasicMaterial({ color: '#4a4a4a', side: THREE.DoubleSide });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2; // Rotate to lie flat on the XZ plane
        floor.position.y = -0.5; // Position below the camera

        this.secondary_environment = floor

    }

    switchEnvironmentFromModel(newEnvironment) {
        if (this.currentEnvironment) {
            this.scene.remove(this.currentEnvironment)
        }
        this.scene.add(newEnvironment)
        this.currentEnvironment = newEnvironment
    }

    setSecondaryEnvironment(secondary_environment_model) {
        this.secondary_environment = secondary_environment_model


    }

    switchEnvironmentToSecondary() {
        if (this.secondary_environment) {
            this.scene.remove(this.secondary_environment)
            this.switchEnvironmentFromModel(this.secondary_environment)

            console.log('gridhelp')
            // Floor for void environment
            const gridHelper = new THREE.GridHelper(50, 30, 0x0000ff, 0x888888);
            this.scene.add(gridHelper);


        }
        else {
            console.warn("Secondary environment not set. Set with setSecondaryEnvironment() before switching")
        }
    }
}