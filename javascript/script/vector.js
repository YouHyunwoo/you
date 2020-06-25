Array.prototype.adds = function (other) {
	if (this.length != other.length) {
		throw 'ArgumentError';
	}

	for (let i = 0; i < this.length; i++) {
		this[i] += other[i];
	}
};

Array.prototype.subv = function (other) {
	if (this.length != other.length) {
		throw 'ArgumentError';
	}

	for (let i = 0; i < this.length; i++) {
		this[i] -= other[i];
	}
};

Array.prototype.muls = function (other) {
	for (let i = 0; i < this.length; i++) {
		this[i] *= other;
	}
};

Array.prototype.divs = function (other) {
	for (let i = 0; i < this.length; i++) {
		this[i] /= other;
	}
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