import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui';
import {SVGLoader} from "three/examples/jsm/loaders/SVGLoader";

let FontJSON = "https://cdn.jsdelivr.net/npm/msdf-fonts/build/OpenSans-Regular-msdf.json";
let FontImage = "https://cdn.jsdelivr.net/npm/msdf-fonts/build/OpenSans-Regular-msdf.png";
let textNum = 0;
let selectState = false;
const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;
const raycaster = new THREE.Raycaster();

// MARK: Questions Obj

const questionsObj = {
    NASA_TLX: [
        "How frustrated did you feel during this task?",
        "How mentally demanding was the drawing task?",
        "How physically demanding was the drawing task?",
        "How hard did you have to work to accomplish your level of performance?",
        "How rushed or pressured did you feel?",
        "How successful were you in accomplishing the task?",
        "How insecure, discouraged, irritated, stressed and annoyed were you?",
    ],
    SAMS: [
        "How pleasant or enjoyable did you find this task?",
        "How mentally activated or stimulated did you feel during this task?",
        "How in control did you feel during the task?",
    ],
    Flow: [
        "I felt just the right amount of challenge.",
        "My thoughts and actions flowed smoothly while drawing.",
        "I was completely absorbed in what I was doing.",
        "I knew exactly what to do at each step of the task.",
        "I didn't notice time passing.",
        "I had no difficulty concentrating.",
        "My mind was completely clear.",
        "The right thought/movements occurred of their own accord.",
        "I felt that I had everything under control.",
        "I was completely lost in thought",
    ],
    UEQ_S: [
        "Rate the controller/stylus: 1 = obstructive, 7 = supportive",
        "Rate the controller/stylus: 1 = complicated, 7 = easy",
        "Rate the controller/stylus: 1 = inefficient, 7 = efficient",
        "Rate the controller/stylus: 1 = confusing, 7 = clear",
        "Rate the controller/stylus: 1 = boring, 7 = exciting",
        "Rate the controller/stylus: 1 = not interesting, 7 = interesting",
        "Rate the controller/stylus: 1 = conventional, 7 = inventive",
        "Rate the controller/stylus: 1 = usual, 7 = leading edge",
    ]
}

// MARK: button options
const buttonOptions = {
    width: 0.4,
    height: 0.15,
    justifyContent: 'center',
    offset: 0.05,
    margin: 0.02,
    borderRadius: 0.075
};

const hoveredStateAttributes = {
    state: 'hovered',
    attributes: {
        offset: 0.035,
        backgroundColor: new THREE.Color( 0x999999 ),
        backgroundOpacity: 1,
        fontColor: new THREE.Color( 0xffffff )
    },
};

const idleStateAttributes = {
    state: 'idle',
    attributes: {
        offset: 0.035,
        backgroundColor: new THREE.Color( 0x666666 ),
        backgroundOpacity: 0.3,
        fontColor: new THREE.Color( 0xffffff )
    },
};

const selectedAttributes = {
    offset: 0.02,
    backgroundColor: new THREE.Color( 0x777777 ),
    fontColor: new THREE.Color( 0x222222 )
};

// MARK: SAMS Svg loader
function loadSamsSvg(url, button) {
    const loader = new SVGLoader();
    console.log("button before loader", button)



    loader.load(url, function (data) {
        const group = new THREE.Group();

        let renderOrder = 0;

        for (const path of data.paths) {
            const strokeColor = path.userData.style.fill;

            const material = new THREE.MeshBasicMaterial({
                color: "white",

                side: THREE.DoubleSide,
                depthWrite: false,
            });

            for (const subPath of path.subPaths) {
                const geometry = SVGLoader.pointsToStroke(
                    subPath.getPoints(),
                    path.userData.style,
                );
                geometry.rotateZ( Math.PI ) // rotate right side up

                if (geometry) {
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.renderOrder = renderOrder++;

                    group.add(mesh);
                }
            }
        }

        const box = new THREE.Box3().setFromObject(group);
        const size = box.getSize(new THREE.Vector3());

        const scale = Math.min(
           button.size.x  / size.x,
           button.size.y / size.y,
        );

        group.scale.setScalar(scale);

        // centering
        box.setFromObject(group);
        const center = box.getCenter(new THREE.Vector3());
        group.position.sub(center);
        group.position.z = -0.01;


        button.add(group);
    });
}

const samsSvgs = [
    "./assets/samsPleasant/sams1.svg",
    "./assets/samsPleasant/sams2.svg",
    "./assets/samsPleasant/sams3.svg",
    "./assets/samsPleasant/sams4.svg",
    "./assets/samsPleasant/sams5.svg",
]


export default class QuestionnaireManager {
    // Class to manage desk movement, drawzone spawning and interaction
    constructor(scene, objsToTest) {
        // MARK: Question Block
        let qNum = 0;
        this.answers = []
        this.nextTaskButton = undefined;

        const questionContainer  = new ThreeMeshUI.Block( {
            width: 1.3,
            height: 0.5,
            padding: 0.05,
            justifyContent: 'center',
            textAlign: 'left',
            fontFamily: FontJSON,
            fontTexture: FontImage,
        } );

        questionContainer.position.set( 0, 1.8, -1.8 );
        scene.add( questionContainer );

        const questionText = new ThreeMeshUI.Text( {
            content: questionsObj.NASA_TLX[qNum],
            fontSize: 0.055
        } )

        questionContainer.add(questionText);


        // MARK: Answers
        this.objsToTest = objsToTest;

        this.answerContainer = new ThreeMeshUI.Block( {
            justifyContent: 'center',
            contentDirection: 'row-reverse',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0.11
        } );

        this.answerContainer.position.set( 0, 1.5, -1.2 );
        scene.add(this.answerContainer)

        this.answerContainer2 = new ThreeMeshUI.Block( {
            justifyContent: 'center',
            contentDirection: 'row-reverse',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0.11
        } );

        this.answerContainer2.position.set( 0, 1.5, -1.2 );
   


        // MARK: FLOW

        const buttonArray = [
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
        ]


        buttonArray.forEach((button, i) => {
            // text
            button.add(
                new ThreeMeshUI.Text( { content: `${7 - i}` } )
            );

            // MARK: Button press
            button.setupState( {
                state: 'selected',
                attributes: selectedAttributes,
                onSet: () => {
                    this.answers.push(7 - i)
                    qNum += 1;
                    questionText.set({content: questionsObj.NASA_TLX[qNum]});

                    // MARK: End of survey
                    if (qNum === questionsObj.NASA_TLX.length) {
                        console.log("Survey complete", this.answers)
                        scene.remove(questionContainer, this.answerContainer)
                        scene.add(questionContainer, this.answerContainer2)
                        qNum = 0;
                        questionText.set({content: questionsObj.SAMS[qNum]});

                        samsButtonArray.map(x => this.objsToTest.push(x))
                        // this.nextTaskButton && this.nextTaskButton.makeVisible();
                    }

                }
            } );
            button.setupState( hoveredStateAttributes );
            button.setupState( idleStateAttributes );

            // add button to groups
            this.answerContainer.add(button);
            this.objsToTest.push(button);

        })

        // MARK: SAMS
        const samsButtonArray = [
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
        ]
        samsButtonArray.forEach((samsButton, i) => {

            loadSamsSvg(samsSvgs[i], samsButton);

            // MARK: Button press
            samsButton.setupState( {
                state: 'selected',
                attributes: selectedAttributes,
                onSet: () => {
                    this.answers.push(5 - i)
                    qNum += 1;
                    questionText.set({content: questionsObj.SAMS[qNum]});

                    // MARK: End of survey
                    if (qNum === questionsObj.SAMS.length) {
                        console.log("Survey complete", this.answers)
                        scene.remove(questionContainer, this.answerContainer2)
                        // scene.add(questionContainer, this.answerContainer2)
                        this.nextTaskButton && this.nextTaskButton.makeVisible();
                    }

                }
            } );
            samsButton.setupState( hoveredStateAttributes );
            samsButton.setupState( idleStateAttributes );

            // add button to groups
            this.answerContainer2.add(samsButton);

        })




        // make invisible
        this.questionContainer = questionContainer;
        this.questionContainer.visible = false;
        this.answerContainer.visible = false
    }

    getAnswers() {
        return this.answers;
    }

    makeQuestionnaireVisible(nextTaskButton) {
        this.questionContainer.visible = true;
        this.answerContainer.visible = true;
        this.nextTaskButton = nextTaskButton;
    }

    setPosition(position) {
        this.questionContainer.position.set(
            position.x,
            position.y + 0.8,
            -1.4
        )
        this.answerContainer.position.set(
            position.x,
            position.y + 0.3,
            -1.2
        )
    }
}