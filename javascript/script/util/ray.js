import * as Vector from '/script/util/vector.js';

export function Raycast(start, end, object) {
	// objects: center anchor

	const [l, t, r, b] = object.ltrb;

	const [p, q] = [start, end];
	const [pqx, pqy] = q.subv(p);

	const txf = (l - p[0]) / pqx;
	const txl = (r - p[0]) / pqx;
	const tyf = (t - p[1]) / pqy;
	const tyl = (b - p[1]) / pqy;

	const xfl = txf < txl;
	const yfl = tyf < tyl;

	let xf = [txf, l, pqy * txf + p[1]];
	let xl = [txl, r, pqy * txl + p[1]];
	let yf = [tyf, pqx * tyf + p[0], t];
	let yl = [tyl, pqx * tyl + p[0], b];

	if (!xfl) {
		[xf, xl] = [xl, xf];
	}

	if (!yfl) {
		[yf, yl] = [yl, yf];
	}

	const rates = [txf, txl, tyf, tyl];
	const negatives = rates.filter(x => x < 0).length;
	const front = negatives < 2; // Math.floor(rates.length + 1) / 2)
	const reach = rates.filter(x => x >= 1).length < 3; // Math.ceil(rates.length + 1) / 2)
	const collide = (xf[0] - yl[0]) * (yf[0] - xl[0]) > 0 && front && reach;
	const point = collide ? (xf[0] < yf[0] ? yf.slice(1) : xf.slice(1)) : null;
	const normal = collide ? [(xf[0] < yf[0] ? 0 : 1) * (xfl ? -1 : 1), (xf[0] < yf[0] ? 1 : 0) * (yfl ? -1 : 1)] : null;
	// const inner = (xf[0] - yl[0]) * (yf[0] - xl[0]) > 0 && negatives == 2;
	const distanceSquare = collide ? point.subv(start).dotv(point.subv(start)) : null;
	const distance = collide ? Math.sqrt(distanceSquare) : null;

	return {
		hit: collide,
		point: point,
		normal: normal,
		distance: distance,
		distanceSquare: distanceSquare,
	};
}

export function Boxcast(size, start, end, object) {
	const enlarged = object.enlarge(...size);

	return Raycast(start, end, enlarged);
}