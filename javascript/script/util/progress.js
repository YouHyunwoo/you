export class Progress {

	constructor(begin, end, speed, value, rotatable) {
		this.begin = begin;
		this.end = end;
		this.speed = speed;
		this.current = value || begin;
		this.rotatable = rotatable || { begin: true, end: true };
		this.exceed = { begin: false, end: false };
	}

	update(delta) {
		let next = this.current + this.speed * delta;

		if (next < this.begin) {
			this.exceed.begin = true;
			this.current = this.rotatable.begin ? next + (this.end - this.begin) : this.begin;
		}
		else if (next > this.end) {
			this.exceed.end = true;
			this.current = this.rotatable.end ? next - (this.end - this.begin) : this.end;
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

	// static fromJSON(json) {
	// 	let o = JSON.parse(json);
	// 	let r = new Progress(o.begin, o.end, o.speed, o.current, o.rotatble);
	// 	r.exceed = o.exceed;
	// 	return r;
	// }

	setBegin(begin) {
		this.begin = begin;

		return this;
	}

	setEnd(end) {
		this.end = end;

		return this;
	}

	setCurrent(value) {
		this.current = value;

		return this;
	}

	setSpeed(speed) {
		this.speed = speed;

		return this;
	}

	toJSON() {
		return this;
	}

	static fromJSON(object) {
		let instance = new Progress(object.begin, object.end, object.speed, object.current, object.rotatable);

		instance.exceed = object.exceed;

		return instance;
	}
}