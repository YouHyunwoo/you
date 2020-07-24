import * as Vector from '/script/util/vector.js';

export function Raycast(start, end, object) {
	const [l, t, r, b] = [...object.transform.position, ...object.transform.position.addv(object.transform.size)];

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
	const front = negatives < 2;
	const reach = rates.filter(x => x >= 1).length < 3;
	const collide = (xf[0] - yl[0]) * (yf[0] - xl[0]) > 0 && front && reach;
	const point = collide ? (xf[0] < yf[0] ? yf.slice(1) : xf.slice(1)) : null;
	const normal = collide ? [(xf[0] < yf[0] ? 0 : 1) * (xfl ? -1 : 1), (xf[0] < yf[0] ? 1 : 0) * (yfl ? -1 : 1)] : null;
	// const inner = (xf[0] - yl[0]) * (yf[0] - xl[0]) > 0 && negatives == 2;

	return {
		hit: collide,
		point: point,
		normal: normal
	};
}