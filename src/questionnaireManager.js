import * as THREE from "three"
import ThreeMeshUI from "three-mesh-ui"
import { Text as TroikaText } from "troika-three-text";

export default class questionnaireManager {
    constructor(scene) {
         this.container;
        // this.q_container
        // this.scene = scene    
        // this.q_container = new ThreeMeshUI.Block({
        //     width: 1.2,
        //     height: 0.7,
        //     padding: 0.2,
        //     fontFamily: './assets/Roboto-msdf.json',
        //     fontTexture: './assets/Roboto-msdf.png'
        // });

        // let q_text = new ThreeMeshUI.Text({
        // content: "Some text to be displayed"
        // });

        // q_container.add(q_text)
    }

    // bring forward UI to avoid clipping with panel
    disableDepth(obj) {
        obj.traverse((o) => {
            if (!o.material) return;
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            for (const m of mats) {
                m.transparent = true;
                m.depthTest = false;
                m.depthWrite = false;
            }
        });
        obj.renderOrder = 999;
    }

    // block builder
    makeBlock() {
            this.container = new ThreeMeshUI.Block({
                width: 1.2,
                height: 0.7,
                padding: 0.2,
                margin: 0,
                justifyContent: "center",
                alignContent: "center",
                // visual styling
                backgroundColor: this.C('#ffffff'),
                backgroundOpacity: 0.5,
                borderColor: this.C(borderColor),
                borderWidth: borderW,
                borderRadius: radius,
            });
            this.scene.add(container)
            this.container.position.set(1, 1, -3)
            ThreeMeshUI.update()
        }
}