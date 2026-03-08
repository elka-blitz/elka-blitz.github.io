import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui';
import {SVGLoader} from "three/examples/jsm/loaders/SVGLoader";
import {getFilledRect} from "./shapeFunctions";

let FontJSON = "https://cdn.jsdelivr.net/npm/msdf-fonts/build/OpenSans-Regular-msdf.json";
let FontImage = "https://cdn.jsdelivr.net/npm/msdf-fonts/build/OpenSans-Regular-msdf.png";

const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;
const raycaster = new THREE.Raycaster();

// MARK: Questions Obj

const questionsObj = {
    NASA_TLX: [
        "How frustrated did you feel during this task?",                            // 1
        "How mentally demanding was the drawing task?",                             // 2
        "How physically demanding was the drawing task?",                           // 3
        "How hard did you have to work to accomplish your level of performance?",   // 4
        "How rushed or pressured did you feel?",                                    // 5
        "How successful were you in accomplishing the task?",                       // 6
        "How insecure, discouraged, irritated, stressed and annoyed were you?",     // 7
    ],
    SAMS: [
        "How pleasant or enjoyable did you find this task?",                        // 1
        "How mentally activated or stimulated did you feel during this task?",      // 2
        "How in control did you feel during the task?",                             // 3
    ],
    Flow: [
        "I felt just the right amount of challenge.",                          // 1
        "My thoughts and actions flowed smoothly while drawing.",                   // 2
        "I was completely absorbed in what I was doing.",                           // 3
        "I knew exactly what to do at each step of the task.",                      // 4
        "I didn't notice time passing.",                                            // 5
        "I had no difficulty concentrating.",                                       // 6
        "My mind was completely clear.",                                            // 7
        "The right thought/movements occurred of their own accord.",                // 8
        "I felt that I had everything under control.",                              // 9
        "I was completely lost in thought",                                     // 10
    ],
    UEQ_S: [
        "Rate the input device",         // 1
        "Rate the input device",                    // 2
        "Rate the input device",               // 3
        "Rate the input device",                     // 4
        "Rate the input device",                     // 5
        "Rate the input device",         // 6
        "Rate the input device",              // 7
        "Rate the input device",              // 8
    ]
}

const ueq_sWords = [
    {first: "obstructive", second: "supportive"},
    {first: "complicated", second: "easy"},
    {first: "inefficient", second: "efficient"},
    {first: "confusing", second: "clear"},
    {first: "boring", second: "exciting"},
    {first: "not interesting", second: "interesting"},
    {first: "conventional", second: "inventive"},
    {first: "usual", second: "leading edge"},
]

// MARK: button options
const buttonOptions = {
    width: 0.2,
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
            const strokeColor = path.userData.style.stroke;

            const material = new THREE.MeshBasicMaterial({
                color: strokeColor,
                opacity: path.userData.style.strokeOpacity,
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
        group.name = "samsSVG"

        button.add(group);
    });
}

const samsSvgs = [
    [
        "./assets/samsPleasant/sams5.svg",
        "./assets/samsPleasant/sams4.svg",
        "./assets/samsPleasant/sams3.svg",
        "./assets/samsPleasant/sams2.svg",
        "./assets/samsPleasant/sams1.svg",
    ],
    [
        "./assets/samsExcited/sams5.svg",
        "./assets/samsExcited/sams4.svg",
        "./assets/samsExcited/sams3.svg",
        "./assets/samsExcited/sams2.svg",
        "./assets/samsExcited/sams1.svg",
    ],
    [
        "./assets/samsControl/sams5.svg",
        "./assets/samsControl/sams4.svg",
        "./assets/samsControl/sams3.svg",
        "./assets/samsControl/sams2.svg",
        "./assets/samsControl/sams1.svg",
    ]
]

export default class QuestionnaireManager {
    // Class to manage desk movement, drawzone spawning and interaction
    constructor(scene, objsToTest) {
        // MARK: Question Block
        let qNum = 0;
        let overallQNum = 0;
        const totalQNum = Object.values(questionsObj).flat().length
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
            backgroundOpacity: 1,
        } );

        questionContainer.position.set( 0, 1.8, -1.8 );
        scene.add( questionContainer );

        const questionText = new ThreeMeshUI.Text( {
            content: questionsObj.NASA_TLX[qNum],
            fontSize: 0.055
        } )

        const progressContainer = new ThreeMeshUI.Block( {
            width: 1.3,
            height: 0.1,
            padding: 0.05,
            paddingBottom: 0.07,
            justifyContent: 'center',
            textAlign: 'center',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            backgroundOpacity: 0
        } );


        const progressText = new ThreeMeshUI.Text({
            content: `${overallQNum} / ${totalQNum}`,
            fontSize: 0.045,
            align: 'center',
            justifyContent: 'center',
        })

        progressText.position.y += 0.1;


        progressContainer.add(progressText);
        questionContainer.add(progressContainer)

        questionContainer.add(questionText);

        this.ueq_sContainer1 = new ThreeMeshUI.Block( {
            width: 0.4,
            height: 0.15,
            padding: 0.02,

            justifyContent: 'center',
            textAlign: 'center',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            borderRadius: 0.05,
            backgroundOpacity: 1,

        } );
        this.ueq_sContainer2 = new ThreeMeshUI.Block( {
            width: 0.4,
            height: 0.15,
            padding: 0.02,

            justifyContent: 'center',
            textAlign: 'center',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            borderRadius: 0.05,
            backgroundOpacity: 1,


        } );

        scene.add(this.ueq_sContainer1, this.ueq_sContainer2);

        const ueq_sText1 = new ThreeMeshUI.Text({
            content: `${ueq_sWords[0].first}`,
            fontSize: 0.045,
            align: 'center',
            justifyContent: 'center',
        })
        const ueq_sText2 = new ThreeMeshUI.Text({
            content: `${ueq_sWords[0].second}`,
            fontSize: 0.045,
            align: 'center',
            justifyContent: 'center',
        })

        this.ueq_sContainer1.add(ueq_sText1)
        this.ueq_sContainer2.add(ueq_sText2)

        this.ueq_sContainer1.visible = false;
        this.ueq_sContainer2.visible = false;


        // MARK: Answers
        this.objsToTest = objsToTest;

        const rect = getFilledRect(2.5, 0.3, '#ffffff');
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
            backgroundOpacity: 1,
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
            borderRadius: 0.11,
            backgroundOpacity: 0,
        } );

        this.answerContainer2.position.set( 0, 1.5, -1.2 );

        this.answerContainer3 = new ThreeMeshUI.Block( {
            justifyContent: 'center',
            contentDirection: 'row-reverse',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0.11,
            backgroundOpacity: 1,

        } );

        this.answerContainer3.position.set( 0, 1.5, -1.2 );

        this.answerContainer4 = new ThreeMeshUI.Block( {
            justifyContent: 'center',
            contentDirection: 'row-reverse',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0.11,
            backgroundOpacity: 1,
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
                    this.answers.push(7 - i)
                    overallQNum += 1;
                    progressText.set({content: `${overallQNum} / ${totalQNum}`});

                    qNum += 1;
                    questionText.set({content: questionsObj.NASA_TLX[qNum]});

                    // MARK: End of survey
                    if (qNum === questionsObj.NASA_TLX.length) {
                        scene.remove(this.answerContainer)
                        scene.add(this.answerContainer2)
                        qNum = -1;
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

            loadSamsSvg(samsSvgs[qNum][i], samsButton);

            // MARK: Button press
            samsButton.setupState( {
                state: 'selected',
                attributes: selectedAttributes,
                onSet: () => {
                    if (qNum !== -1) {
                        this.answers.push(5 - i)
                    }
                    qNum += 1;
                    if (qNum < questionsObj.SAMS.length){

                        overallQNum += 1;
                        progressText.set({content: `${overallQNum} / ${totalQNum}`});
                        questionText.set({content: questionsObj.SAMS[qNum]});

                        // replacing with next set of samsSVGs
                        samsButtonArray.forEach((x, index) => {
                            const svg = x.getObjectByName("samsSVG");
                            if (svg) x.remove(svg);

                            loadSamsSvg(samsSvgs[qNum][index], x);
                    })}
                    // MARK: End of survey
                    else {
                        scene.remove(this.answerContainer2)
                        scene.add(this.answerContainer3)
                        qNum = -1;
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
                    if (qNum !== -1) {
                        this.answers.push(7 - i)
                    }
                    qNum += 1;
                    if (qNum < questionsObj.Flow.length){
                        overallQNum += 1;
                        progressText.set({content: `${overallQNum} / ${totalQNum}`});

                        questionText.set({content: questionsObj.Flow[qNum]});
                    }
                    // MARK: End of survey
                    else {
                        scene.remove(this.answerContainer3)
                        scene.add(this.answerContainer4)
                        qNum = -1;
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
                    if (qNum !== -1) {
                        this.answers.push(7 - i)
                    }
                    qNum += 1;
                    if (qNum < questionsObj.UEQ_S.length ) {

                        overallQNum += 1;
                        progressText.set({content: `${overallQNum} / ${totalQNum}`});
                        questionText.set({content: questionsObj.UEQ_S[qNum]});
                        this.ueq_sContainer1.visible = true;
                        this.ueq_sContainer2.visible = true;
                        ueq_sText1.set({content: `${ueq_sWords[qNum].first}`})
                        ueq_sText2.set({content: `${ueq_sWords[qNum].second}`})
                    }
                    // MARK: End of survey
                    else {
                        console.log("Survey complete", this.answers)
                        scene.remove(questionContainer, this.answerContainer4, this.ueq_sContainer1, this.ueq_sContainer2)
                        this.objsToTest.length = 0; // clear array
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

        this.ueq_sContainer1.position.set(
            position.x - 1,
            position.y + 0.3,
            -1.2
        )
        this.ueq_sContainer2.position.set(
            position.x + 1,
            position.y + 0.3,
            -1.2
        )

    }
}