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

export default class QuestionnaireManager {
    // Class to manage desk movement, drawzone spawning and interaction
    constructor(scene) {
        // declarations
        this.objsToTest = [];


        // makePanel
        
        // this.container block, in which we put the two buttons.
        // We don't define width and height, it will be set automatically from the children's dimensions
        // Note that we set contentDirection: "row-reverse", in order to orient the buttons horizontally

        this.container = new ThreeMeshUI.Block( {
            justifyContent: 'center',
            contentDirection: 'row-reverse',
            fontFamily: FontJSON,
            fontTexture: FontImage,
            fontSize: 0.07,
            padding: 0.02,
            borderRadius: 0.11
        } );

        this.container.position.set( 0, 0.6, -1.2 );
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

        // Buttons creation

        const buttonNext = new ThreeMeshUI.Block( buttonOptions );
        const buttonPrevious = new ThreeMeshUI.Block( buttonOptions );

        // text

        buttonNext.add(
            new ThreeMeshUI.Text( { content: 'next' } )
        );

        buttonPrevious.add(
            new ThreeMeshUI.Text( { content: 'previous' } )
        );

        // Create states for the buttons.
        // In the loop, we will call component.setState( 'state-name' ) when mouse hover or click

        const selectedAttributes = {
            offset: 0.02,
            backgroundColor: new THREE.Color( 0x777777 ),
            fontColor: new THREE.Color( 0x222222 )
        };

        // MARK: Button press
        buttonNext.setupState( {
            state: 'selected',
            attributes: selectedAttributes,
            onSet: () => {

                console.log(`Next ${textNum}`)
                textNum +=1;

            }
        } );
        buttonNext.setupState( hoveredStateAttributes );
        buttonNext.setupState( idleStateAttributes );

        //

        buttonPrevious.setupState( {
            state: 'selected',
            attributes: selectedAttributes,
            onSet: () => {
                console.log(`Prev ${textNum}`)
                textNum -=1;

            }
        } );
        buttonPrevious.setupState( hoveredStateAttributes );
        buttonPrevious.setupState( idleStateAttributes );


        this.container.add( buttonNext, buttonPrevious );
        this.objsToTest.push( buttonNext, buttonPrevious );


        // make invisible
        // this.container.visible = false
    }

    updateButtons(renderer, camera, raycastResult, vrControl) {
        // Find closest intersecting object
        let intersect;

        if ( renderer.xr.isPresenting ) {

            vrControl.setFromController( 0, raycaster.ray );
            intersect = raycastResult;

            // Position the little white dot at the end of the controller pointing ray
            if ( intersect ) vrControl.setPointerAt( 0, intersect.point );
            // todo remove when mouse removed
        } else if ( mouse.x !== null && mouse.y !== null ) {
            raycaster.setFromCamera( mouse, camera );
            intersect = raycastResult;
        }

        // Update targeted button state (if any)

        if ( intersect && intersect.object.isUI ) {
            if ( selectState ) {
                // Component.setState internally call component.set with the options you defined in component.setupState
                intersect.object.setState( 'selected' );

            } else {
                // Component.setState internally call component.set with the options you defined in component.setupState
                intersect.object.setState( 'hovered' );
            }

        }

        // Update non-targeted buttons state
        this.objsToTest.forEach( ( obj ) => {
            if ( ( !intersect || obj !== intersect.object ) && obj.isUI ) {

                // Component.setState internally call component.set with the options you defined in component.setupState
                obj.setState( 'idle' );
            }
        } );
    }

}