Array.prototype.equals = function (other) {
	if (this.length != other.length) {
		throw 'ArgumentError';
	}

	for (let i = 0; i < this.length; i++) {
		if (this[i] != other[i]) {
			return false;
		}
	}
	
	return true;
}

Array.prototype.addv = function (other) {
	if (this.length != other.length) {
		throw 'ArgumentError';
	}

	let result = [];

	for (let i = 0; i < this.length; i++) {
		result.push(this[i] + other[i]);
	}

	return result;
};

Array.prototype.subv = function (other) {
	if (this.length != other.length) {
		throw 'ArgumentError';
	}

	let result = [];

	for (let i = 0; i < this.length; i++) {
		result.push(this[i] - other[i]);
	}

	return result;
};

Array.prototype.mulv = function (other) {
	let result = [];

	for (let i = 0; i < this.length; i++) {
		result.push(this[i] * other[i]);
	}

	return result;
};

Array.prototype.divv = function (other) {
	let result = [];

	for (let i = 0; i < this.length; i++) {
		result.push(this[i] / other[i]);
	}

	return result;
};

Array.prototype.muls = function (other) {
	let result = [];

	for (let i = 0; i < this.length; i++) {
		result.push(this[i] * other);
	}

	return result;
};

Array.prototype.divs = function (other) {
	let result = [];

	for (let i = 0; i < this.length; i++) {
		result.push(this[i] / other);
	}

	return result;
};

Array.prototype.dotv = function (other) {
	if (this.length != other.length) {
		throw 'ArgumentError';
	}

	let result = 0;

	for (let i = 0; i < this.length; i++) {
		result += this[i] * other[i];
	}
	
	return result;
};

Array.prototype.distanceTo = function (other) {
	return Math.sqrt(this.subv(other).dotv(this.subv(other)));
}