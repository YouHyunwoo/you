var Korea = {

	name: "Korea",
	desc: "made by You",

	asset: {
		theme: {
			red: {
				backgroundColor: '#000',
				button: {
					backgroundColor: 'rgba(255, 0, 0, 0.5)',
					textColor: '#fff',
				}
			}
		},
	},

	scene: {
		title: {
			in() {
				// login
			},

			out() {

			},

			update(delta) {

			},

			draw(context) {

			},
		},
		character: {
			in() {
				// select character
			},

			out() {

			},

			update(delta) {

			},

			draw(context) {

			},
		},
		game: {
			in() {
				// play selected character
			},

			out() {

			},

			update(delta) {

			},

			draw(context) {

			},
		},
	},
};


Korea.Map = class extends You.Object {
	constructor(name) {
		super(name);

		this.size = [0, 0];
	}

	get width() {
		return this.size[0];
	}

	get height() {
		return this.size[1];
	}
};

Korea.GameObject = class extends You.Object {

};