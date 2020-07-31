import * as Clone from "/script/util/clone.js";

export class Progress {

	constructor(begin, end, speed, value, rotatable) {
		this.begin = begin;
		this.end = end;
		this.speed = speed;
		this.value = value || begin;
		this.rotatable = rotatable || { begin: true, end: true };
		this.exceed = { begin: false, end: false };
	}

	clone() {
		const clone = new this.constructor(this.begin, this.end, this.speed, this.value);

		clone.rotatable = this.rotatable.clone();
		clone.exceed = this.exceed.clone();

		return clone;
	}

	update(delta) {
		let next = this.value + this.speed * delta;

		if (next < this.begin) {
			this.exceed.begin = true;
			this.value = this.rotatable.begin ? next + (this.end - this.begin) : this.begin;
		}
		else if (next > this.end) {
			this.exceed.end = true;
			this.value = this.rotatable.end ? next - (this.end - this.begin) : this.end;
		}
		else {
			this.exceed.begin = this.exceed.end = false;
			this.value = next;
		}

		return this.value;
	}

	get rate() { return (this.value - this.begin) / (this.end - this.begin); }

	get isFull() { return this.exceed.end; }
	get isEmpty() { return this.exceed.begin; }

	setBegin(begin) {
		this.begin = begin;

		return this;
	}

	setEnd(end) {
		this.end = end;

		return this;
	}

	setValue(value) {
		this.value = value;

		return this;
	}

	setSpeed(speed) {
		this.speed = speed;

		return this;
	}

	toJSON() {
		return this;
	}

	static fromJSON(json) {
		let progress = new this(json.begin, json.end, json.speed, json.value, json.rotatable);

		progress.exceed = json.exceed;

		return progress;
	}
}