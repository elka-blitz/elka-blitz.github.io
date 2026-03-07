import * as THREE from 'three';
import {controllerObj, degreesObj, taskOrder} from "./experimentConfig";
import ThreeMeshUI from "three-mesh-ui";

export default class UiElementsManager {
    constructor(scene) {
        const textureLoader = new THREE.TextureLoader();

        // MARK: calibration
        this.calibrationContainer = new ThreeMeshUI.Block({
            height: 1.5,
            width: 1,
            backgroundOpacity: 0,
        });

        this.calibrationContainer.position.set(0, 1.6,  - 0.8);
        scene.add(this.calibrationContainer);

        const imgBlock = new ThreeMeshUI.Block({
            height: 0.860,
            width: 0.661,
        });

        textureLoader.load(controllerObj.calibrate, (texture) => {
            imgBlock.set({ backgroundTexture: texture });
        });

        this.calibrationContainer.add(imgBlock);

        // MARK: story and instructions
        this.container = new ThreeMeshUI.Block({
            height: 1.5,
            width: 1,
            backgroundOpacity: 0,
        });
        this.container2 = new ThreeMeshUI.Block({
            height: 1.5,
            width: 1,
            backgroundOpacity: 0,
        });

        this.container.position.set(0, 1.6,  - 0.8);
        this.container2.position.set(0, 1.6,  - 0.8);
        scene.add(this.container, this.container2);

        const imageBlock = new ThreeMeshUI.Block({
            height: 0.862,
            width: 1.046,
        });
        const imageBlock2 = new ThreeMeshUI.Block({
            height: 0.801,
            width: 0.768,
        });

        this.container.add(imageBlock);
        this.container2.add(imageBlock2);

        textureLoader.load('./assets/story.png', (texture) => {
            imageBlock.set({ backgroundTexture: texture });
        });
        textureLoader.load(controllerObj.instructions, (texture) => {
            imageBlock2.set({ backgroundTexture: texture });
        });

        this.container.visible = false;
        this.container2.visible = false;

    }

    practiceMode(deskCoords) {

        this.calibrationContainer.visible = false;
        this.container.position.set(deskCoords.x - 1.3, deskCoords.y + 0.2 , deskCoords.z - 0.5);
        this.container.rotateY(Math.PI / 8)
        this.container.visible = true;

        this.container2.position.set(deskCoords.x + 1.3, deskCoords.y + 0.2 , deskCoords.z - 0.5);
        this.container2.rotateY(- Math.PI / 8)
        this.container2.visible = true;
    }

    taskMode() {
        this.container.visible = false;
        this.container2.visible = false;

    }

}
