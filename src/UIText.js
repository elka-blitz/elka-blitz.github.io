import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { gsap } from 'gsap';   

export default class UIText {
    constructor(scene) {
    this.UIText = new Text();
    this.UIText.fontsize = 0.52
    this.UIText.font = 'assets/SpaceMono-Bold.ttf';
    this.UIText.position.z = -2;
    this.UIText.color = 0xffffff;
    this.UIText.anchorX = 'center';
    this.UIText.anchorY = 'middle';
    this.UIText.text = 'text_init'
    scene.add(this.UIText)
    this.UIText.position.set(0, 0, -2) // Initial position in front of the camera, will be updated to follow the camera in the animation loop
    }   

    


    animateTextToCamera(camera) {
        // This method animates the text to smoothly follow the camera's position and rotation
        // As opposed to locking the text to the camera's position and rotation (as in floatTextToCamera)
        // Smoother animation using GSAP
        gsap.to(this.UIText.quaternion, {
            x: camera.quaternion.x,
            y: camera.quaternion.y,
            z: camera.quaternion.z,
            w: camera.quaternion.w,
            duration: 0.9,
            ease: 'power2.out'
        });

        // Animate the text position to be slightly in front of the camera
        const cameraDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const targetPosition = new THREE.Vector3().copy(camera.position).add(cameraDirection.multiplyScalar(2)); // Adjust the distance as needed

        gsap.to(this.UIText.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 0.5,
            ease: 'power2.out'
        });
    }

    floatTextToCamera(camera) {
        // Make the text always face the camera
        // Locks the text to the camera's position and rotation, less smooth than animateTextToCamera but simpler 

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

    sync() {
        this.UIText.sync()
    }

}