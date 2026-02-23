import * as THREE from 'three'

export default class EnvironmentSwitcher {
    constructor(scene, environmentArray, taskNo) { // environment array is an array of environment models to load
        this.scene = scene
        this.taskNo = taskNo
        this.environments = environmentArray
        this.taskArrayShuffled = []
        this.getEnvironmentShuffle()
        this.current_loaded_environment = null
        this.current_loaded_environment_index = 0
        
        // Load an initial environment model, separate from array (without affecting the shuffled array iteration)
        this.loadEnvironmentModel(this.environments[this.environments.length - 1])
    }

    getEnvironmentShuffle() {
        // Populate an array of length taskNo with an amount of environments proportionally split by how many environments there are

        for (let i = 0; i < Math.ceil(this.taskNo / this.environments.length) ; i++) {
            for (let env_index = 0; env_index < this.environments.length; env_index++) {
                this.taskArrayShuffled.push(this.environments[env_index])
                console.log(env_index)
            }
        }
        console.log(this.taskArrayShuffled)
        this.taskArrayShuffled = [...this.taskArrayShuffled].sort(() => Math.random() - 0.5);
        console.log(this.taskArrayShuffled)

        return true
    }

    loadFirstEnvironmentalCondition() {
        this.current_loaded_environment_index = 0 // Reset in case of indexError
        this.current_loaded_environment = this.taskArrayShuffled[this.current_loaded_environment_index]
        this.scene.add(this.current_loaded_environment)
    }

    loadNextEnvironmentCondition() {
        try {
            this.scene.remove(this.current_loaded_environment)
            this.current_loaded_environment_index += 1
            this.scene.add(this.taskArrayShuffled[this.current_loaded_environment_index])
        } catch {
            console.log('Loading first environment condition')
            this.loadFirstEnvironmentalCondition()
        }
    }

    loadEnvironmentModel(environment_model_to_load) {
        this.scene.add(environment_model_to_load)
    }

}