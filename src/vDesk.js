export default class Desk {
	constructor(coordinates, scene, desk_asset) {
		// There should only be one desk at a time
		this.coordinates = coordinates // Of THREE.vector3() nature
		this.scene = scene
		this.identifier = ''
		this.desk_asset = desk_asset
		// 

	}
}

