import * as THREE from "three";

export default class questionnaireManager {
    // Who wants to be a questionnaire?
    constructor(scene, camera) {
        this.scene = scene
        this.camera = camera

        this.question_panels = ['assets/question_1.png', 'assets/question_2.png', 'assets/question_3.png', 'assets/question_4.png', 'assets/question_5.png', 'assets/question_6.png', 'assets/question_7.png', 'assets/question_8.png']
        this.q_slide_index = 0;

        this.textureLoader = new THREE.TextureLoader();
        this.q_slide = this.textureLoader.load(this.question_panels[this.q_slide_index])

        this.boxWidth = 0.5;
        this.boxHeight = 0.5;
        this.boxDepth = 0.00001;
        this.loaded_images = []
        this.geometry = new THREE.BoxGeometry(this.boxWidth, this.boxHeight, this.boxDepth);

        this.drawMaterials = [
            new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 }),
            new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 }),
            new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 }),
            new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 }),
            new THREE.MeshBasicMaterial({ map: this.q_slide }),
            new THREE.MeshBasicMaterial({ map: this.q_slide }),

        ];

        this.question_panel = new THREE.Mesh(this.geometry, this.drawMaterials);

        this.panel_position = new THREE.Vector3(0, 0.76, 0)
        this.panel_quaternion = new THREE.Quaternion()

        this.scene.add(this.question_panel)
        this.question_panel.position.set(this.panel_position.x, this.panel_position.y, this.panel_position.z)

        this.question_panel.rotateX(-Math.PI / 2)
        // this.question_panel.rotateY(-Math.PI /2)
        this.question_panel.rotateZ(Math.PI / 2)
        
        // Input cube variables
        this.input_cubes = []
        this.input_cube_offset_between = 0.01
        this.input_cube_start_position = new THREE.Vector3(-0.18, 0.119, 0) // relative to panel center
        this.input_cube_sequnce_offset = 0.05 // how much the cubes move down as the questionnaire progresses
    }

    async loadImage(image_path){
        this.loaded_images.push = await this.loader.loadAsync(image_path)
    }

    getImage(index) {
        return this.loaded_images[index]
    }

    refresh() {
        // Load image from assets
        this.q_slide = this.textureLoader.load(this.question_panels[this.q_slide_index])

        // Remove question panel from scene
        this.scene.remove(this.question_panel)

        // Re-init cube drawing with new materials and new index
        this.drawMaterials = [
            new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 }),
            new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 }),
            new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 }),
            new THREE.MeshStandardMaterial({ transparent: true, opacity: 0 }),
            new THREE.MeshBasicMaterial({ map: this.q_slide }),
            new THREE.MeshBasicMaterial({ map: this.q_slide }),
        ];

        this.question_panel = new THREE.Mesh(this.geometry, this.drawMaterials);

        // Re-add cube to screen
        this.scene.add(this.question_panel)
        // this.question_panel.position.set(this.panel_position.x, this.panel_position.y, this.panel_position.z)
        // this.question_panel.quaternion.set(this.panel_quaternion.x, this.panel_quaternion.y, this.panel_quaternion.z, this.panel_quaternion.w)

        // Rotate cube so that the panel surface appears horizontal
        this.question_panel.rotateX(-Math.PI / 2)
        // this.question_panel.rotateY(Math.PI/2)

    }

    nextQuestionnaireSlide() {
        this.q_slide_index += 1
        this.refresh()
    }

    setPos(position_vector, quaternion) {
        this.panel_position.x = position_vector.x
        this.panel_position.y = position_vector.y + 0.8 // Desktop coords
        this.panel_position.z = position_vector.z

        this.panel_quaternion.x = quaternion.x
        this.panel_quaternion.y = quaternion.y
        this.panel_quaternion.z = quaternion.z
        this.panel_quaternion.w = quaternion.w

        this.refresh()
    }

    addToDesk(desk_group) {
        desk_group.add(this.question_panel)
        this.panel_position.y = 0.8
        // this.refresh()
    }

    makePanelVisible() {
        this.question_panel.visible = true
    }

    makePanelInvisible() {
        this.question_panel.visible = false
    }

    // Provisional function for testing bounding box locations
    spawnBoundingBoxes() {
        // Start with one
        let input_cube_geometry = new THREE.BoxGeometry(0.07, 0.07, 0.07);
        let input_cube_material = new THREE.MeshStandardMaterial({ color: '#5f5f5f' });

        // Set cube opacity to 0.5 and make it transparent
        input_cube_material.transparent = true;
        input_cube_material.opacity = 0.3;

        let input_cube = new THREE.Mesh(input_cube_geometry, input_cube_material);
        // this.question_panel.add(input_cube)

        // Set cube position to be in front of the question panel
        input_cube.position.set(0, 0, 0)

        // Make a row of 5 boxes
        for (let i = 0; i < 5; i++) {
            let cube = input_cube.clone()
            cube.position.set(this.input_cube_start_position.x + i * (0.08 + this.input_cube_offset_between), this.input_cube_start_position.y, this.input_cube_start_position.z)
            this.question_panel.add(cube)
            this.input_cubes.push(cube)
        }

        // Add bounding boxes to these cubes for interaction detection
        this.input_cubes.forEach(cube => {
            cube.geometry.computeBoundingBox()
            cube.boundingBox = cube.geometry.boundingBox.clone()
        })

        // Move them all down as the questionnaire progresses
    }

    moveInputCubesDown() {
        this.input_cubes.forEach(cube => {
            cube.position.y -= this.input_cube_sequnce_offset
        })
    }

    inputChecker(stylus_position_vector) {
        // Check if the user's input intersects with any of the input cube bounding boxes
        // If so, move the questionnaire to the next slide and move the cubes down
        // This function would be called in the main animation loop, and would check for intersection with the stylus position
        // Log which cube was intersected

        // Check if the stylus vector is within the bounding box of any of the input cubes
        // 
        this.input_cubes.forEach(cube => {
            let boundingBox = cube.boundingBox.clone()
            boundingBox.min.add(cube.position)
            boundingBox.max.add(cube.position)

            if (boundingBox.containsPoint(stylus_position_vector)) {
                console.log('Input cube intersected:', cube)
                this.nextQuestionnaireSlide()
                this.moveInputCubesDown()
            }
        })

    }
}