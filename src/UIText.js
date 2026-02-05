import * as THREE from 'three';
import { Text } from 'troika-three-text';

export default class UIText {
    constructor(scene) {
    this.UIText = new Text();
    this.UIText.fontsize = 0.52
    this.UIText.font = 'assets/SpaceMono-Bold.ttf';
    this.UIText.position.z = -2;
    this.UIText.color = 0xffffff;
    this.UIText.anchorX = 'center';
    this.UIText.anchorY = 'middle';
    this.UIText.text = 'LiveStylusCoords'
    scene.add(this.UIText)
    }   

    floatTextToCamera(camera) {
        // Make the text always face the camera
        this.UIText.quaternion.copy(camera.quaternion);

        // Position the text slightly in front of the camera
        const cameraDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        this.UIText.position.copy(camera.position).add(cameraDirection.multiplyScalar(2)); // Adjust the distance as needed
    }

    updateText(text) {
        this.UIText.text = text
    }
    
    positionTextRelativeToDesk(desk_asset_instance) {
        this.UIText.position.copy(desk_asset_instance.position)
        this.UIText.position.y += 0.5 // Move text slightly above the desk
        this.UIText.position.z += 0.5 // Move text slightly in front of the desk

        // Apply the desk's rotation to the text
        this.UIText.quaternion.copy(desk_asset_instance.quaternion)
    }

}