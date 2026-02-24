import * as THREE from 'three';
import ThreeMeshUI from 'three-mesh-ui';

import { gsap } from 'gsap';

let FontJSON = "https://cdn.jsdelivr.net/npm/msdf-fonts/build/OpenSans-Regular-msdf.json";
let FontImage = "https://cdn.jsdelivr.net/npm/msdf-fonts/build/OpenSans-Regular-msdf.png";
let textNum = 0;
let selectState = false;
const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;
const raycaster = new THREE.Raycaster();

const questionsArray = [
    "How pleasant or enjoyable did you find this task?",
    "How mentally activated or stimulated did you feel during this task?",
    "How frustrated did you feel during this task?",
    "I felt just the right amount of challenge.",
    "My thoughts and actions flowed smoothly while drawing.",
    "I was completely absorbed in what I was doing.",
    "I knew exactly what to do at each step of the task.",
    "How mentally demanding was the drawing task?",
    "How hard did you have to work to accomplish your level of performance?",
    "How rushed or pressured did you feel?",
    "How successful were you in accomplishing the task?",
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
            // interLine: 0,
        } );

        questionContainer.position.set( 0, 1.8, -1.8 );
        // questionContainer.rotation.x = -0.55;
        scene.add( questionContainer );

        const questionText = new ThreeMeshUI.Text( {
            // content: 'This library supports line-break-friendly-characters,',
            content: questionsArray[qNum],
            fontSize: 0.055
        } )

        questionContainer.add(questionText);


        // MARK: Answers
        this.objsToTest = objsToTest;

        this.container = new ThreeMeshUI.Block( {
            justifyContent: 'center',
            contentDirection: 'row-reverse',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0.11
        } );

        this.container.position.set( 0, 1.5, -1.2 );
        this.container.rotation.x = -0.55;
        scene.add( this.container );

        // MARK: BUTTONS

        // ui
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

        // Buttons creation

        const button1 = new ThreeMeshUI.Block( buttonOptions );
        const button2 = new ThreeMeshUI.Block( buttonOptions );
        const button3 = new ThreeMeshUI.Block( buttonOptions );
        const button4 = new ThreeMeshUI.Block( buttonOptions );
        const button5 = new ThreeMeshUI.Block( buttonOptions );
        const button6 = new ThreeMeshUI.Block( buttonOptions );
        const button7 = new ThreeMeshUI.Block( buttonOptions );
        const buttonArray = [
            button7,
            button6,
            button5,
            button4,
            button3,
            button2,
            button1,
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
                    questionText.set({content: questionsArray[qNum]});

                    // MARK: End of survey
                    if (qNum === questionsArray.length) {
                        console.log("Survey complete")
                        scene.remove(questionContainer, this.container)
                        this.nextTaskButton && this.nextTaskButton.makeVisible();
                    }

                }
            } );
            button.setupState( hoveredStateAttributes );
            button.setupState( idleStateAttributes );

            // add button to groups
            this.container.add(button);
            this.objsToTest.push(button);

        })

        // make invisible
        this.questionContainer = questionContainer;
        this.questionContainer.visible = false;
        this.container.visible = false
    }

    getAnswers() {
        return this.answers;
    }

    makeQuestionnaireVisible(nextTaskButton) {
        this.questionContainer.visible = true;
        this.container.visible = true;
        this.nextTaskButton = nextTaskButton;
    }

    setPosition(position) {
        this.questionContainer.position.set(
            position.x,
            position.y + 0.8,
            -1.6
        )
        this.container.position.set(
            position.x,
            position.y + 0.6,
            -1.2
        )
    }
}