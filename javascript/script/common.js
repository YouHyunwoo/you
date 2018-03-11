function map2obj(m) {
	let o = Object.create(null);
	for (let [k, v] of m) { o[k] = v; }
	return o;
}

function obj2map(o) {
	let m = new Map();
	for (let k of Object.keys(o)) { m.set(k, o[k]); }
	return m;
}

function randomColor(base) {
	if (!base) { base = 0; }
	var letters = '0123456789ABCDEF'.substring(base);
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[ Math.floor(Math.random() * (16 - base)) ];
	}
	return color;
}

function random(start, end) {
	return Math.floor(Math.random() * (end - start)) + start;
}

function print(message) {
	console.log(message);
}

function clone(o) {
	return Object.assign(Object.create(Object.getPrototypeOf(o)), o);
}

class Progress {

	constructor(begin, end, speed, value, rotatable) {
		this.begin = begin;
		this.end = end;
		this.speed = speed;
		this.current = value || begin;
		this.rotatable = rotatable || { begin: true, end: true };
		this.exceed = { begin: false, end: false };
		// this.onempty = (who, delta) => { who.current += who.speed * delta + who.end - who.begin; return false; };
		// this.onfull = (who, delta) => { who.current += who.speed * delta - who.end + who.begin; return false; };
	}

	update(delta) {
		let next = this.current + this.speed * delta;

		if (next < this.begin) {
			this.exceed.begin = true;
			this.current = this.rotatable.begin ? next + (this.end - this.begin) : this.begin;
			// if (!this.onempty || this.onempty(this, delta)) { this.current = this.begin; }
		}
		else if (next > this.end) {
			this.exceed.end = true;
			this.current = this.rotatable.end ? next - (this.end - this.begin) : this.end;
			// if (!this.onfull || this.onfull(this, delta)) { this.current = this.end; }
		}
		else {
			this.exceed.begin = this.exceed.end = false;
			this.current = next;
		}

		return this.current;
	}

	get rate() { return (this.current - this.begin) / (this.end - this.begin); }

	get isFull() { return this.exceed.end; }
	get isEmpty() { return this.exceed.begin; }

	static fromJSON(json) {
		let o = JSON.parse(json);
		let r = new Progress(o.begin, o.end, o.speed, o.current, o.rotatble);
		r.exceed = o.exceed;
		return r;
	}

}

const CW = Symbol();
const CCW = Symbol();

window.requestAFrame = window.requestAnimationFrame ||
						window.webkitRequestAnimationFrame ||
						window.mozRequestAnimationFrame ||
						window.oRequestAnimationFrame ||
						((callback) => window.setTimeout(callback, 1000 / 60));

window.cancelAFrame = window.cancelAnimationFrame ||
						window.webkitCancelAnimationFrame ||
						window.mozCancelAnimationFrame ||
						window.oCancelAnimationFrame ||
						((id) => window.clearTimeout(id));