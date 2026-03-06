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

export const getFilledRect = (width, height, color) => {

	const geometry = new THREE.PlaneGeometry(width, height);

	const material = new THREE.MeshBasicMaterial({
		color: color || 0xff0000,
		side: THREE.DoubleSide,
	});

	return new THREE.Mesh(geometry, material);
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

export function getRelativePosition(child, parent) {
	// Get the world position of the child
	const worldPosition = new THREE.Vector3();
	child.getWorldPosition(worldPosition);

	// Convert the world position to the local position relative to the parent
	const localPosition = worldPosition.clone();
	parent.worldToLocal(localPosition);

	return localPosition;
}

export function getRoundedRect( w, h, r, s ) { // width, height, radiusCorner, smoothness

	const pi2 = Math.PI * 2;
	const n = ( s + 1 ) * 4; // number of segments
	let indices = [];
	let positions = [];
	let uvs = [];
	let qu, sgx, sgy, x, y;

	for ( let j = 1; j < n + 1; j ++ ) indices.push( 0, j, j + 1 ); // 0 is center
	indices.push( 0, n, 1 );
	positions.push( 0, 0, 0 ); // rectangle center
	uvs.push( 0.5, 0.5 );
	for ( let j = 0; j < n ; j ++ ) contour( j );

	const geometry = new THREE.BufferGeometry( );
	geometry.setIndex( new THREE.BufferAttribute( new Uint32Array( indices ), 1 ) );
	geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );
	geometry.setAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( uvs ), 2 ) );

	return geometry;

	function contour( j ) {

		qu = Math.trunc( 4 * j / n ) + 1 ;      // quadrant  qu: 1..4
		sgx = ( qu === 1 || qu === 4 ? 1 : -1 ) // signum left/right
		sgy =  qu < 3 ? 1 : -1;                 // signum  top / bottom
		x = sgx * ( w / 2 - r ) + r * Math.cos( pi2 * ( j - qu + 1 ) / ( n - 4 ) ); // corner center + circle
		y = sgy * ( h / 2 - r ) + r * Math.sin( pi2 * ( j - qu + 1 ) / ( n - 4 ) );

		positions.push( x, y, 0 );
		uvs.push( 0.5 + x / w, 0.5 + y / h );

	}

}