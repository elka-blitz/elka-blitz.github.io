import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui';
import {SVGLoader} from "three/examples/jsm/loaders/SVGLoader";
import {getFilledRect} from "./shapeFunctions";

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
        "1 How frustrated did you feel during this task?",                            // 1
        "2 How mentally demanding was the drawing task?",                             // 2
        "3 How physically demanding was the drawing task?",                           // 3
        "4 How hard did you have to work to accomplish your level of performance?",   // 4
        "5 How rushed or pressured did you feel?",                                    // 5
        "6 How successful were you in accomplishing the task?",                       // 6
        "7 How insecure, discouraged, irritated, stressed and annoyed were you?",     // 7
    ],
    SAMS: [
        "1 How pleasant or enjoyable did you find this task?",                        // 1
        "2 How mentally activated or stimulated did you feel during this task?",      // 2
        "3 How in control did you feel during the task?",                             // 3
    ],
    Flow: [
        "1 I felt just the right amount of challenge.",                          // 1
        "2 My thoughts and actions flowed smoothly while drawing.",                   // 2
        "3 I was completely absorbed in what I was doing.",                           // 3
        "4 I knew exactly what to do at each step of the task.",                      // 4
        "5 I didn't notice time passing.",                                            // 5
        "6 I had no difficulty concentrating.",                                       // 6
        "7 My mind was completely clear.",                                            // 7
        "8 The right thought/movements occurred of their own accord.",                // 8
        "9 I felt that I had everything under control.",                              // 9
        "10 I was completely lost in thought",                                     // 10
    ],
    UEQ_S: [
        "1 Rate the controller/stylus: 1 = obstructive, 7 = supportive",         // 1
        "2 Rate the controller/stylus: 1 = complicated, 7 = easy",                    // 2
        "3 Rate the controller/stylus: 1 = inefficient, 7 = efficient",               // 3
        "4 Rate the controller/stylus: 1 = confusing, 7 = clear",                     // 4
        "5 Rate the controller/stylus: 1 = boring, 7 = exciting",                     // 5
        "6 Rate the controller/stylus: 1 = not interesting, 7 = interesting",         // 6
        "7 Rate the controller/stylus: 1 = conventional, 7 = inventive",              // 7
        "8 Rate the controller/stylus: 1 = usual, 7 = leading edge",              // 8
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
        backgroundColor: new THREE.Color('#0f94e6' ),
        backgroundOpacity: 0.2,
        fontColor: new THREE.Color( 0xffffff )
    },
};

const idleStateAttributes = {
    state: 'idle',
    attributes: {
        offset: 0.035,
        backgroundColor: new THREE.Color( 0x666666 ),
        backgroundOpacity: 0,
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

    loader.load(url, function (data) {
        const group = new THREE.Group();

        let renderOrder = 0;

        for (const path of data.paths) {
            const strokeColor = path.userData.style.fill;

            const material = new THREE.MeshBasicMaterial({
                color: "black",

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
        group.position.z = 0.01;


        button.add(group);
    });
}

const samsSvgs = [
    "./assets/samsExcited/sams5.svg",
    "./assets/samsExcited/sams4.svg",
    "./assets/samsExcited/sams3.svg",
    "./assets/samsExcited/sams2.svg",
    "./assets/samsExcited/sams1.svg",
]

// TODO: FIX ANSWERS LOGGING
/*
- SAMS
- UEQ-S
- Progress bar?
- test in vr
 */
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

        const rect = getFilledRect(3, 0.3, '#ffffff');
        scene.add(rect)
        rect.position.set(0, 1.5, -1.3)
        rect.visible = false;

        this.answerContainer = new ThreeMeshUI.Block( {
            justifyContent: 'center',
            contentDirection: 'row-reverse',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0.11,
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

        this.answerContainer3 = new ThreeMeshUI.Block( {
            justifyContent: 'center',
            contentDirection: 'row-reverse',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0.11
        } );

        this.answerContainer3.position.set( 0, 1.5, -1.2 );

        this.answerContainer4 = new ThreeMeshUI.Block( {
            justifyContent: 'center',
            contentDirection: 'row-reverse',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0.11
        } );

        this.answerContainer4.position.set( 0, 1.5, -1.2 );


        // MARK: NASA-TLX

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
                    this.answers.push(["NASA:", qNum, (7 - i)])
                    qNum += 1;
                    questionText.set({content: questionsObj.NASA_TLX[qNum]});

                    // MARK: End of survey
                    if (qNum === questionsObj.NASA_TLX.length) {
                        scene.remove(this.answerContainer)
                        scene.add(this.answerContainer2)
                        qNum = 0;
                        // questionText.set({content: questionsObj.SAMS[qNum]});

                        this.objsToTest.length = 0; // clear array

                        samsButtonArray.map(x => this.objsToTest.push(x))
                        rect.visible = true;
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
                    this.answers.push(["SAMS: ", qNum ,(5 - i)])
                    questionText.set({content: questionsObj.SAMS[qNum]});
                    qNum += 1;

                    // MARK: End of survey
                    if (qNum === questionsObj.SAMS.length + 1) {
                        scene.remove(this.answerContainer2)
                        scene.add(this.answerContainer3)
                        qNum = 0;
                        // questionText.set({content: questionsObj.Flow[qNum]});

                        this.objsToTest.length = 0; // clear array

                        flowButtonArray.map(x => this.objsToTest.push(x))
                        rect.visible = false;

                    }

                }
            } );
            samsButton.setupState( hoveredStateAttributes );
            samsButton.setupState( idleStateAttributes );

            // add button to groups
            this.answerContainer2.add(samsButton);

        })

        // MARK: FLOW
        const flowButtonArray = [
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
        ]
        flowButtonArray.forEach((flowButton, i) => {

            flowButton.add(
                new ThreeMeshUI.Text( { content: `${7 - i}` } )
            );

            // MARK: Button press
            flowButton.setupState( {
                state: 'selected',
                attributes: selectedAttributes,
                onSet: () => {
                    this.answers.push(["Flow: ", qNum, (7 - i)])
                    questionText.set({content: questionsObj.Flow[qNum]});
                    qNum += 1;
                    console.log(qNum)

                    // MARK: End of survey
                    if (qNum === questionsObj.Flow.length + 1) {
                        scene.remove(this.answerContainer3)
                        scene.add(this.answerContainer4)
                        qNum = 0;
                        questionText.set({content: questionsObj.UEQ_S[qNum]});

                        this.objsToTest.length = 0; // clear array

                        ueqButtonsArray.map(x => this.objsToTest.push(x))
                    }

                }
            } );
            flowButton.setupState( hoveredStateAttributes );
            flowButton.setupState( idleStateAttributes );

            // add button to groups
            this.answerContainer3.add(flowButton);

        })

        // MARK: UEQ-S
        const ueqButtonsArray = [
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
            new ThreeMeshUI.Block( buttonOptions ),
        ]
        ueqButtonsArray.forEach((ueqButton, i) => {

            ueqButton.add(
                new ThreeMeshUI.Text( { content: `o` } )
            );

            // MARK: Button press
            ueqButton.setupState( {
                state: 'selected',
                attributes: selectedAttributes,
                onSet: () => {
                    this.answers.push(["UEQ-S", qNum, (7 - i)])
                    questionText.set({content: questionsObj.UEQ_S[qNum]});
                    qNum += 1;

                    // MARK: End of survey
                    if (qNum === questionsObj.UEQ_S.length + 1) {
                        console.log("Survey complete", this.answers)
                        scene.remove(questionContainer, this.answerContainer4)
                        this.nextTaskButton && this.nextTaskButton.makeVisible();
                    }

                }
            } );
            ueqButton.setupState( hoveredStateAttributes );
            ueqButton.setupState( idleStateAttributes );

            // add button to groups
            this.answerContainer4.add(ueqButton);

        })




        // make invisible
        this.questionContainer = questionContainer;
        this.questionContainer.visible = false;
        this.answerContainer.visible = false;

        this.containerArray = [
            this.answerContainer,
            this.answerContainer2,
            this.answerContainer3,
            this.answerContainer4,
            rect,
        ]
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
        this.containerArray.forEach((c) => {
            c.position.set(
                position.x,
                position.y + 0.3,
                -1.2
            )
        })

    }
}