import * as THREE from 'three';

export const getDashedLine = (points, color) => {
	if (!points || points.length < 2) return null;

	const lineOpt = {
		color: color,
		linewidth: 2,
		scale: 4,
		dashSize: 0.02,
		gapSize: 0.02,
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

export const getRect = (width, height, xPos, yPos, userDistance, leanTowards, isDashed, color) => {
	const points = []
	points.push(
		new THREE.Vector3(xPos - width, yPos - height, userDistance),
	);
	points.push(
		new THREE.Vector3(xPos + width, yPos - height, userDistance),
	);
	points.push(
		new THREE.Vector3(
			xPos + width,
			yPos + height,
			userDistance - leanTowards,
		),
	);
	points.push(
		new THREE.Vector3(
			xPos - width,
			yPos + height,
			userDistance - leanTowards,
		),
	);
	points.push(
		new THREE.Vector3(xPos - width, yPos - height, userDistance),
	);

	return isDashed ? getDashedLine(points, color) : getLine(points, color);
}

export const getCircle = (radius) => {

	const segments = 64;

	const points = [];

	for (let i = 0; i <= segments; i++) {
		const theta = (i / segments) * Math.PI * 2;
		points.push(
			new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0),
		);
	}

	const geometry = new THREE.BufferGeometry().setFromPoints(points);
	const material = new THREE.LineBasicMaterial({ color: 0xffffff });

	const circle = new THREE.LineLoop(geometry, material);
	return getDashedLine(points, "white")


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