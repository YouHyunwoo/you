You.State = class {
	constructor() {
		this.parent = null;
	}

	in(...args) {

	}

	out(...args) {

	}

	enter(...args) {

	}

	exit(...args) {
		
	}

	request(message) {
		throw 'NotImplementedError';
	}
}

You.State.Context = class {
	constructor() {
		this.states = [];
		this.state = null;
	}

	request(message) {
		if (this.state != null) {
			this.states[this.state].request(message);
		}
	}
}