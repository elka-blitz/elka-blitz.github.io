import * as THREE from "three";

export default class questionnaireManager {
    // Who wants to be a questionnaire?
    constructor(scene) {
        this.scene = scene

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

        this.panel_position = new THREE.Vector3(0,1,-1)
        this.panel_quaternion = new THREE.Quaternion()

        this.scene.add(this.question_panel)
        this.question_panel.position.set(this.panel_position.x, this.panel_position.y, this.panel_position.z)

        this.question_panel.rotateX(-Math.PI / 2)
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
}