import * as THREE from "three";

export default class questionnaireManager {
    // Who wants to be a questionnaire?
    constructor(scene, camera, desk_group) {
        this.scene = scene
        this.camera = camera
        // MARK: Loading Images
        this.question_panels_1 = ['assets/question_1.png', 'assets/question_2.png', 'assets/question_3.png', 'assets/question_4.png', 'assets/question_5.png', 'assets/question_6.png', 'assets/question_7.png', 'assets/question_8.png']
        this.question_slide_index = 0;

        this.textureLoader = new THREE.TextureLoader();
        this.q_slide = this.textureLoader.load(this.question_panels_1[this.question_slide_index])

        //MARK: Panel Setup
        this.boxWidth = 0.5; // 0.1125
        this.boxHeight = 0.414493294; // 0.5*
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

        this.desk_group = desk_group
        // this.scene.add(this.question_panel)
        this.desk_group.add(this.question_panel)

        this.question_panel.position.set(this.panel_position.x, this.panel_position.y, this.panel_position.z)

        this.question_panel.rotateX(-Math.PI / 2)
        // this.question_panel.rotateY(-Math.PI /2)
        this.question_panel.rotateZ(-Math.PI / 2)
        
        // MARK: Input Cubes       
        this.input_cube_gradient_colors = ['#ffe68e', '#ffdb70', '#ffd054', '#ffc538', '#ffb91c'] // gradient colors for the input cubes, from light yellow to dark orange
        this.input_cube_geometry = new THREE.BoxGeometry(0.07, 0.07, 0.07);
        this.input_cube_material = new THREE.MeshStandardMaterial({ color: '#ffb91c' });
        this.input_cube_material.transparent = true;
        this.input_cube_material.opacity = 0.3;
        this.input_cubes = []

        this.input_cube_offset_between = 0.01
        this.downward_offset_ratio = 0.620910117

        this.input_cube_start_position = new THREE.Vector3(0, 0.8, -0.18) // relative to panel center
        this.input_cube_sequence_offset = 0.07 * this.downward_offset_ratio // how much the cubes move down as the questionnaire progresses

        this.prevIsSelecting = false
        this.isSelecting = false

        this.question_index = 0
        this.questionnaire_data = []

        this.spawnBoundingBoxes()
    }

    async loadImage(image_path){
        this.loaded_images.push = await this.loader.loadAsync(image_path)
    }


    getImage(index) {
        return this.loaded_images[index]
    }

    // MARK Refresh
    refresh() {
        // MARK: Refresh
        // Load image from assets
        this.q_slide = this.textureLoader.load(this.question_panels_1[this.question_slide_index])

        // Remove question panel from scene
        // this.scene.remove(this.question_panel)
        this.desk_group.remove(this.question_panel)

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
        // this.scene.add(this.question_panel)
        this.desk_group.add(this.question_panel)
        this.question_panel.rotateX(-Math.PI / 2)
        // this.question_panel.rotateY(-Math.PI /2)
        this.question_panel.rotateZ(-Math.PI / 2)

        // this.question_panel.position.set(this.panel_position.x, this.panel_position.y, this.panel_position.z)
        // this.question_panel.quaternion.set(this.panel_quaternion.x, this.panel_quaternion.y, this.panel_quaternion.z, this.panel_quaternion.w)

        // Rotate cube so that the panel surface appears horizontal
        this.question_panel.rotateX(-Math.PI / 2)
        this.question_panel.rotateZ(Math.PI)

        this.question_panel.position.set(this.panel_position.x, this.panel_position.y, this.panel_position.z)


        // this.question_panel.rotateY(Math.PI/2)

    }

    nextQuestionnaireSlide() {
        this.question_slide_index += 1
        this.refresh()
    }

    // MARK: Gradient Fade
    updateBoxGradientFade() {
        // This function would be called in the main animation loop, and would update the opacity of the input cubes based on how long it has been since the user has interacted with them
        // The cubes should gently pulsate to indicate that the user can interact with them, but should not be too distracting

        this.input_cubes.forEach((cube, index) => {
            let opacity = 0.2 + 0.1 * Math.sin(Date.now() * 0.005 + index) // pulsate between 0.3 and 0.4 opacity
            cube.material.opacity = opacity
        })
    }

    getQuestionnaireData() {
        return this.questionnaire_data
    }

    setPos(position_vector, quaternion) {
        // MARK: Set Position
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

    setQuestionnaireVisibility(visibility_boolean) {
        this.question_panel.visible = visibility_boolean
        this.input_cubes.forEach(cube => {
            cube.visible = visibility_boolean;
        })
    }

    // MARK: Cube Transparency
    makeCubesTransparent() {
        this.input_cubes.forEach(cube => {
            // cube.material.transparent = true;
            // cube.material.opacity = 0.3;
            cube.visible = false;
        })
    }

    // Provisional function for testing bounding box locations
    spawnBoundingBoxes() {
        // MARK: Input Box Setup
        // Start with one


        // Set cube opacity to 0.5 and make it transparent
        this.input_cube_material.transparent = true;
        this.input_cube_material.opacity = 0.3;

        let input_cube = new THREE.Mesh(this.input_cube_geometry, this.input_cube_material);
        // this.question_panel.add(input_cube)
        // this.desk_group.add(input_cube)

        // Set cube position to be in front of the question panel
        input_cube.position.set(0, 0.8, 0)

        // Make a row of 5 boxes
        for (let i = 0; i < 5; i++) {
            let cube = input_cube.clone()
            cube.position.set(this.input_cube_start_position.x + 0.095, this.input_cube_start_position.y -0.07, this.input_cube_start_position.z + i * (0.08 + this.input_cube_offset_between))
            // this.question_panel.add(cube)
            this.desk_group.add(cube)
            this.input_cubes.push(cube)
        }

        // Add bounding boxes to these cubes for interaction detection
        this.input_cubes.forEach(cube => {
            cube.geometry.computeBoundingBox()
            // cube.boundingBox = cube.geometry.boundingBox.clone()
            cube.updateMatrixWorld() // Ensure world matrix is up to date
        })

        // Move them all down as the questionnaire progresses
    }

    // MARK: Move Down
    moveInputCubesDown() {
        console.log(this.question_index)
        let local_offset_holder = 0.095

        if (this.question_index == 1) {
            console.log('Using 0.19')
            local_offset_holder = 0.1
        }
        
        this.input_cubes.forEach(cube => {
            cube.position.y -= local_offset_holder 
            cube.material.transparent = true;
            cube.material.opacity = 0.3;
            console.log(cube.material.opacity)
        })
    }

    resetInputCubes() {
        this.input_cubes.forEach((cube, index) => {
            cube.position.set(this.input_cube_start_position.x + index * (0.08 + this.input_cube_offset_between), this.input_cube_start_position.y, this.input_cube_start_position.z)
            cube.material.transparent = true;
            cube.material.opacity = 0.3;
        })
    }

    inputChecker(stylus_position_vector) {
        //MARK: Input Box Logic
        // Check if the user's input intersects with any of the input cube bounding boxes
        // If so, move the questionnaire to the next slide and move the cubes down
        // This function would be called in the main animation loop, and would check for intersection with the stylus position
        // Log which cube was intersected

        // Check if the stylus vector is within the bounding box of any of the input cubes

        let cube_index = 0


        this.input_cubes.forEach(cube => {

            let bounding_box = new THREE.Box3().setFromObject(cube)

            this.prevIsSelecting = this.isSelecting
            this.isSelecting = bounding_box.containsPoint(stylus_position_vector)
            
            cube_index += 1

            // If an intersection is detected in any of the five cubes
            if (this.isSelecting && !this.prevIsSelecting) {
                
                // TODO: Log the cube index for data collection purposes
                // console.log('Input cube index:', cube_index)
                // console.log('Quesitonnaire index:', this.question_index)
                // console.log('Slide index:', this.q_slide_index)

                // this.nextQuestionnaireSlide()

                this.question_index += 1

                // MARK: Export Logic
                this.questionnaire_data.push({
                    question_index: this.question_index, // Question the user answered (1-3)
                    cube_index: cube_index, // Answer the user gave (1-5 left to right)
                    timestamp: Date.now(), // Time of response
                    slide: this.question_slide_index, // Slide the user was on
                })

                if (this.question_index == 3) {
                    this.nextQuestionnaireSlide()
                    this.resetInputCubes()
                    this.question_index = 0
                }
                else {
                    this.moveInputCubesDown()
                }
            }
        })
    }
}