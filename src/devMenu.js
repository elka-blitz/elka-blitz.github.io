import * as THREE from 'three';

import {
	getCube
} from './shapeFunctions';

// Button state
let prevButton1 = false
let menuSpawned = false;

export const devMenuLoader = (stylus_coordinate_vector, scene) => {
    try {
        if (menuSpawned) {
            const menu_background = getCube(0.5, 0.1, 0.5, '#0000006b');
            scene.add(menu_background)
            menu_background.position.set(stylus_coordinate_vector)
        }
    } catch (e) {
    console.log(e)
}
    
};
