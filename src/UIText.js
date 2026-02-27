import * as THREE from 'three';
import { Text } from 'troika-three-text';
import { getFilledRect } from './shapeFunctions';
import { gsap } from 'gsap';

export class UIText {
    constructor(scene) {
    this.UIText = new Text();
    this.UIText.fontsize = 0.52
    this.UIText.font = 'assets/SpaceMono-Bold.ttf';
    this.UIText.position.z = -2;
    this.UIText.color = 0xffffff;
    this.UIText.anchorX = 'center';
    this.UIText.anchorY = 'middle';
    this.UIText.text = ''
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

        // Set text height to eye level by adjusting the y position to match the camera's y position
        targetPosition.y = camera.position.y - 0.5; // Adjust the vertical offset as needed

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

        // Correct the text being diagonally oriented by applying the desk's rotation to the text, so it faces the user properly
        // this.UIText.rotation.x = desk_asset_instance.rotation.x
        // this.UIText.rotation.y = desk_asset_instance.rotation.y
        this.UIText.rotation.z = 0

        // Apply the desk's rotation to the text
        // this.UIText.quaternion.copy(desk_asset_instance.quaternion)
        gsap.to(this.UIText.quaternion, {
            x: desk_asset_instance.quaternion.x,
            y: 0,
            z: desk_asset_instance.quaternion.z,
            w: desk_asset_instance.quaternion.w,
            duration: 0.9,
            ease: 'power2.out'
        });
    }

    sync() {
        this.UIText.sync()
    }

    colourText(colour) {
        this.UIText.color = colour
    }

    flashText(colour, duration) {
        // Flash the text by changing its color to the specified color and then back to white after the duration
        const originalColor = this.UIText.color;
        this.UIText.color = colour;

        setTimeout(() => {
            this.UIText.color = originalColor;
        }, duration);  
    }

}

export class TextPanel {
	constructor(scene, textString, xPos, yPos, width, height, userDistance) {
		this.rect = getFilledRect(width, height, '#8c8c8c');
		scene.add(this.rect);
		this.rect.position.set(xPos, yPos, -userDistance);

		this.text = new Text();
		this.text.fontSize = 0.05;
		this.text.color = 'black';
		this.text.anchorX = 'center';
		this.text.anchorY = 'middle';
		this.text.maxWidth = width - 0.04;
		this.text.lineHeight = 1.5;
		this.text.text = textString;
		this.text.sync();

		scene.add(this.text);
		this.text.position.set(xPos, yPos, -(userDistance - 0.01));

		// on initialisation it will not be visible
		this.rect.visible = false;
		this.text.visible = false;
	}

	makeInvisible() {
		this.rect.visible = false;
		this.text.visible = false;
	}

	makeVisible() {
		this.rect.visible = true;
		this.text.visible = true;
	}

	updateText(text) {
		this.text.text = text;
	}

	setPosition(position) {
		this.rect.position.set(position.x, position.y, -position.z);
		this.text.position.set(position.x, position.y, -(position.z - 0.01));
	}

}
