Object.defineProperty(Array.prototype, 'clone', {
	value: function () {
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
	}
});

Object.defineProperty(Object.prototype, 'clone', {
	value: function () {
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
});