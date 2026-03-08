// true: 5deg surface, false: 85 deg surface in air
// MARK: Change surface type
export const isHorizontalSurface = false;

const controllerType = {
    stylus: {calibrate: "assets/stylus_desk_calib.png", instructions: "assets/stylus_instructions.png"},
    l_controller: {calibrate: "assets/left_controller_desk_calib.png", instructions: "assets/controller_instructions.png"},
    r_controller: {calibrate: "assets/right_controller_desk_calib.png", instructions: "assets/controller_instructions.png"},
}

// MARK: Change controller type
export const controllerObj = controllerType.r_controller;

// task will follow order of this array
// MARK: Change task order
export const taskOrder = [
    {name: "Storefront", url: "assets/task1/task1.svg"},
    {name: "Cup of Tea", url: "assets/task2/task2.svg"},
    {name: "Cake", url: "assets/task3/task3.svg"},
]

export const degreesObj = {
    isHorizontal: isHorizontalSurface,
    horizontal: ((Math.PI / 2) - (Math.PI / 36)),	// 5 deg
    vertical: (Math.PI / 36)						// 85 degrees
}
