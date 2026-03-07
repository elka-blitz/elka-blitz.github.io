// true: 5deg surface, false: 85 deg surface in air
export const isHorizontalSurface = false;

// task will follow order of this array
export const taskOrder = [
    {name: "Cake", url: "assets/task3/task3.svg"},
    {name: "Cup of Tea", url: "assets/task2/task2.svg"},
    {name: "Storefront", url: "assets/task1/task1.svg"},
]

export const degreesObj = {
    isHorizontal: isHorizontalSurface,
    horizontal: ((Math.PI / 2) - (Math.PI / 36)),	// 5 deg
    vertical: (Math.PI / 36)						// 85 degrees
}
