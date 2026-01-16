import * as THREE from 'three';

export const getDashedLine = (points, color) => {
	if (!points || points.length < 2) return null;

	const lineOpt = {
		color: color,
		linewidth: 2,
		scale: 4,
		dashSize: 0.4,
		gapSize: 0.2,
	};

	const geometry = new THREE.BufferGeometry();
	const material = new THREE.LineDashedMaterial(lineOpt);

	const dots = [];
	for (let i = 0, il = points.length; i < il; i++) {
		dots.push(points[i]);
		if (i > 0 && i < il - 1) dots.push(points[i]); // This repeats the endpoint
	}
	geometry.setFromPoints(dots);

	const line = new THREE.LineSegments(geometry, material);
	line.computeLineDistances();

	return line;
};

export const getLine = (points, color) => {
	const geometry = new THREE.BufferGeometry().setFromPoints(points);
	const lineOpt = {
		color: color,
		linewidth: 2,
		scale: 4,
		dashSize: 0.4,
		gapSize: 0.2,
	};
	const material = new THREE.LineDashedMaterial(lineOpt);

	return new THREE.Line(geometry, material);
}

export const getSquare = (squareSize, xPos, yPos, userDistance, leanTowards, isDashed, color) => {
	const points = []
	points.push(
		new THREE.Vector3(xPos - squareSize, yPos - squareSize, userDistance),
	);
	points.push(
		new THREE.Vector3(xPos + squareSize, yPos - squareSize, userDistance),
	);
	points.push(
		new THREE.Vector3(
			xPos + squareSize,
			yPos + squareSize,
			userDistance - leanTowards,
		),
	);
	points.push(
		new THREE.Vector3(
			xPos - squareSize,
			yPos + squareSize,
			userDistance - leanTowards,
		),
	);
	points.push(
		new THREE.Vector3(xPos - squareSize, yPos - squareSize, userDistance),
	);

	return isDashed ? getDashedLine(points, color) : getLine(points, color);
}


export const getFloor = (width, height, color) => {
	const floorGeometry = new THREE.PlaneGeometry(width, height);
	const floorMaterial = new THREE.MeshStandardMaterial({ color: color });
	return new THREE.Mesh(floorGeometry, floorMaterial);
}

export const getCube = (width, height, depth, color) => {
	return new THREE.Mesh(
		new THREE.BoxGeometry(width, height, depth),
		new THREE.MeshStandardMaterial({ color: color }),
	);
}


export const getPngCube = (width, height, depth, png_url) => {
	// Menu appearance
	const loader = new THREE.TextureLoader();

	return new THREE.Mesh(
		new THREE.BoxGeometry(width, height, depth),
		new THREE.MeshBasicMaterial({
		map: loader.load(png_url),
		})
	);
}