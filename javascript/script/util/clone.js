Array.prototype.clone = function () {
	const array = [];

	for (const a of this) {
		if (a instanceof Array || a instanceof Object) {
			array.push(a.clone());
		}
		else {
			array.push(a);
		}
	}

	return array;
};

Object.prototype.clone = function () {
	const object = {};

    for (const p in this) {
		if (this[p] instanceof Function) {
			continue;
		}
		
        if (this[p] instanceof Array || this[p] instanceof Object) {
            object[p] = this[p].clone();
        }
        else {
            object[p] = this[p];
        }
    }

    return object;
}