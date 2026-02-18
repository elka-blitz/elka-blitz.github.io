import * as THREE from 'three'

export default class EnvironmentSwitcher {
    constructor(scene, initialEnvironment) {
        this.scene = scene
        this.currentEnvironment = null
        if (initialEnvironment) {
            this.scene.add(initialEnvironment)
            this.currentEnvironment = initialEnvironment
        }
        this.secondary_environment = null
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
        }
        else {
            console.warn("Secondary environment not set. Set with setSecondaryEnvironment() before switching")
        }
    }
}