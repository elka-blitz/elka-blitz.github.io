// true: 5deg surface, false: 85 deg surface in air
// MARK: Change surface type
export const isHorizontalSurface = true;

const controllerType = {
    stylus: {
        calibrate: "assets/stylus_desk_calib.png",
        instructions: "assets/stylus_instructions.png",
        instructionsDimensions: [0.840, 0.374],

    },
    l_controller: {
        calibrate: "assets/left_controller_desk_calib.png",
        instructions: "assets/controller_instructions.png",
        instructionsDimensions: [0.844, 0.623],

    },
    r_controller: {
        calibrate: "assets/right_controller_desk_calib.png",
        instructions: "assets/controller_instructions.png",
        instructionsDimensions: [0.844, 0.623],

    },
}

// MARK: Change controller type
export const controllerObj = controllerType.stylus;

// task will follow order of this array
export const taskOrder = [
    {name: "Cake", url: "assets/task3/task3.svg", frame: "assets/cakeFrame.png"},
    {name: "Cup of Tea", url: "assets/task2/task2.svg", frame: "assets/cupFrame.png"},
    {name: "Storefront", url: "assets/task1/task1.svg", frame: "assets/storefrontFrame.png"},
]

export const degreesObj = {
    isHorizontal: isHorizontalSurface,
    horizontal: ((Math.PI / 2) - (Math.PI / 36)),	// 5 deg
    vertical: (Math.PI / 36)						// 85 degrees
}
