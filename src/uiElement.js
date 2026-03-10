import * as THREE from 'three';
import {controllerObj, degreesObj, taskOrder} from "./experimentConfig";
import ThreeMeshUI from "three-mesh-ui";


export class UiElementsManager {
    constructor(scene) {
        const textureLoader = new THREE.TextureLoader();

        // MARK: calibration
        this.calibrationContainer = new ThreeMeshUI.Block({
            height: 1.5,
            width: 1,
            backgroundOpacity: 0,
        });

        this.calibrationContainer.position.set(0, 1.3,  - 0.8);
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
            width: controllerObj.instructionsDimensions[0],
            height: controllerObj.instructionsDimensions[1],
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
        this.container.position.set(deskCoords.x - 1, deskCoords.y + 0.2 , deskCoords.z - 0.3);
        this.container.rotateY(Math.PI / 8)
        this.container.visible = true;

        this.container2.position.set(deskCoords.x + 0.8, deskCoords.y + 0.2 , deskCoords.z - 0.3);
        this.container2.rotateY(- Math.PI / 8)
        this.container2.visible = true;
    }

    taskMode() {
        this.container.visible = false;
        this.container2.visible = false;

    }

}

export class StoryUI {
    constructor(scene) {
        this.textureLoader = new THREE.TextureLoader();
        this.scene = scene;

        this.container = new ThreeMeshUI.Block({
            height: 2,
            width: 1.2,
            backgroundOpacity: 0,
        });
        this.imgBlock = new ThreeMeshUI.Block({
            width: 0.663,
            height: 0.714,
        });

        this.questionText = new ThreeMeshUI.Block({
            width: 1.103,
            height: 0.218,
        });

        // this.questionText.position.y += 0.8;

        this.container.position.set(0, 1.2,  -1);
        scene.add(this.container);

        this.textureLoader.load(taskOrder[0].frame, (texture) => {
            this.imgBlock.set({ backgroundTexture: texture });
        });
        this.textureLoader.load("assets/task1Text.png", (texture) => {
            this.questionText.set({ backgroundTexture: texture });
        });

        this.container.add(this.questionText, this.imgBlock )
        this.container.visible = false;

        this.practiceContainer = new ThreeMeshUI.Block({
            width: 1,
            height: 0.3,
            backgroundOpacity: 0,
        });
        this.practicePrompt = new ThreeMeshUI.Block({
            width: 0.849,
            height: 0.263,
        });

        scene.add(this.practiceContainer);
        this.practiceContainer.position.set(0, 1.5,  -1)
        this.practiceContainer.add(this.practicePrompt)

        this.textureLoader.load("assets/practicePrompt.png", (texture) => {
            this.practicePrompt.set({ backgroundTexture: texture });
        });
        this.practiceContainer.visible = false;


    }

    practicePromptVisible() {
        this.practiceContainer.visible = true;
    }
    practicePromptInvisible() {
        this.practiceContainer.visible = false;
    }
    makeInvisible() {
        this.container.visible = false;
    }

    makeVisible() {
        this.container.visible = true;
    }


    showTask(taskNum){
        this.container.visible = true;
        switch (taskNum){
            case 1:
                break;
            case 2:
                this.textureLoader.load(taskOrder[1].frame, (texture) => {
                    this.imgBlock.set({ backgroundTexture: texture });
                });
                this.textureLoader.load("assets/task2Text.png", (texture) => {
                    this.questionText.set({ backgroundTexture: texture });
                });
                break;
            case 3:
                this.textureLoader.load(taskOrder[2].frame, (texture) => {
                    this.imgBlock.set({ backgroundTexture: texture });
                });
                this.textureLoader.load("assets/task3Text.png", (texture) => {
                    this.questionText.set({ backgroundTexture: texture });
                });
                break;
        }
    }
}

export class ResultsUI {
    constructor() {
        this.textContainerLow = new ThreeMeshUI.Block({
            width: 1.1077,
            height: 0.218,
        });
        this.textContainerMedium = new ThreeMeshUI.Block({
            width: 1.084,
            height: 0.218,
        });
        this.textContainerHigh= new ThreeMeshUI.Block({
            width: 1.394,
            height: 0.218,
        });

        this.containerArray = [this.textContainerLow, this.textContainerMedium, this.textContainerHigh];

        this.containerArray.forEach((container) => {
            container.position.set(0, 1.3, -1);
            container.visible = false;
        })

        this.textureLoader = new THREE.TextureLoader();

        this.textureLoader.load("assets/accuracyHigh.png", (texture) => {
            this.textContainerHigh.set({ backgroundTexture: texture });
        });
        this.textureLoader.load("assets/accuracyMedium.png", (texture) => {
            this.textContainerMedium.set({ backgroundTexture: texture });
        });
        this.textureLoader.load("assets/accuracyLow.png", (texture) => {
            this.textContainerLow.set({ backgroundTexture: texture });
        });
    }

    makeInvisible() {
        this.containerArray.forEach((container) => {
            container.visible = false;
        })
    }

    highAccuracy() {
        this.textContainerHigh.visible = true;
        this.textContainerHigh.position.z += 1 // center
    }
    mediumAccuracy() {
        this.textContainerMedium.visible = true;
    }

    lowAccuracy() {
        this.textContainerLow.visible = true;
    }

    addMeshesToDesk(desk) {
        this.containerArray.forEach((container) => {
            desk.add(container);
            container.rotateY(-Math.PI/2) // because desk orients weird
            container.position.x += 0.49; // move further back
            container.position.y += 0.2; // move up

        })
    }

}
