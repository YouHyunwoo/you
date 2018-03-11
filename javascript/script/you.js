"use strict";



class Scene {
	constructor(scene, ...args) {
		this.scenes = [];
		if (scene) { this.push(scene, ...args); }
	}

	transit(scene, ...args) {
		this.pop();
		this.push(scene, ...args);
	}

	push(scene, ...args) {
		this.scenes.unshift(scene.in(...args));
	}

	pop() {
		if (this.scenes.length > 0) {
			this.scenes.shift().out();
		}
	}

	update(delta) {
		if (this.scenes.length > 0) {
			this.scenes[0].update(delta);
		}
	}

	draw(context) {
		if (this.scenes.length > 0) {
			this.scenes[0].draw(context);
		}
	}

	clear() {
		while (this.scenes.length > 0) {
			this.pop();
		}
	}

	get current() {
		return this.scenes[0];
	}

	get length() {
		return this.scenes.length;
	}
}

class Input {
	constructor() {
		this._temp = {
			key: {
				down: new Set(),
				up: new Set()
			},
			mouse: []
		};

		this._key = {
			down: new Set(),
			press: new Set(),
			up: new Set()
		};

		this._mouse = [];

		this._keydown_handler = (e) => this.key = e.keyCode;
		this._keyup_handler = (e) => this.key = -e.keyCode;
		this._mousedown_handler = (e) => this.mouse = ['down', e];
		this._mousemove_handler = (e) => this.mouse = ['move', e];
		this._mouseup_handler = (e) => this.mouse = ['up', e];

		window.addEventListener('keydown', this._keydown_handler);
		window.addEventListener('keyup', this._keyup_handler);
		window.addEventListener('mousedown', this._mousedown_handler);
		window.addEventListener('mousemove', this._mousemove_handler);
		window.addEventListener('mouseup', this._mouseup_handler);
	}

	static get KEY_ENTER()	{ return 13; }
	static get KEY_ESCAPE()	{ return 27; }
	static get KEY_SPACE()	{ return 32; }
	static get KEY_LEFT()	{ return 37; }
	static get KEY_RIGHT()	{ return 39; }
	static get KEY_UP()		{ return 38; }
	static get KEY_DOWN()	{ return 40; }
	static KEY_(keycode)	{ return keycode.charCodeAt(); }

	set key(keycode) {
		if (keycode) {
			if (keycode > 0) {
				if (!(this._key.down.has(keycode) || this._key.press.has(keycode))) {
					this._temp.key.down.add(keycode);
				}
			}
			else { this._temp.key.up.add(-keycode); }
		}
	}

	get key() {
		return {
			down: (keycode) => (keycode) ? this._key.down.has(keycode) : this._key.down.size > 0,
			press: (keycode) => (keycode) ? this._key.press.has(keycode) : this._key.press.size > 0,
			up: (keycode) => (keycode) ? this._key.up.has(keycode) : this._key.up.size > 0
		};
	}

	set mouse(event) {
		if (event) {
			this._temp.mouse.push(event);
		}
	}

	get mouse() {
		return this._mouse.shift();
	}

	update() {
		this._key.up.clear();

		for (let v of this._temp.key.up) {
			if (this._key.press.has(v)) {
				this._key.up.add(v);
				this._key.press.delete(v);
				this._temp.key.up.delete(v);
			}
		}

		for (let v of this._key.down) {
			this._key.press.add(v);
		}
		this._key.down.clear();

		for (let v of this._temp.key.down) {
			this._key.down.add(v);
		}
		this._temp.key.down.clear();

		this._mouse = this._temp.mouse;
		this._temp.mouse = [];
	}

	clear() {
		this._temp.key.down.clear();
		this._temp.key.up.clear();
		this._key.down.clear();
		this._key.press.clear();
		this._key.up.clear();
		this._temp.mouse.length = 0;
		this._mouse.length = 0;
	}
}

class Asset {

	constructor() {
		this.images = new Map();
	}

	add(...args) {
		if (args.length == 0) { return; }

		for (let images of args) {
			if (images instanceof Array) {
				images = images.map((v) => v.toString());
			}
			else if (typeof images === 'string') {
				images = [images];
			}
			for (let i of images) {
				if (this.images.has(i)) { continue; }
				let image = { name: i, raw: new Image(), loaded: false, toJSON: () => { return {name: i}; } };
				image.raw.onload = () => { image.loaded = true; }
				image.raw.src = 'image/' + i;
				this.images.set(i, image);
			}
		}
	}

	remove(...args) {
		if (args.length == 0) { return; }

		for (let images of args) {
			if(images instanceof Array) {
				images = images.map((v) => v.toString());
			}
			else if(typeof images === 'string') {
				images = [images];
			}
			for (let i of images) {
				this.images.delete(i);
			}
		}
	}

	get(...args) {
		if (args.length == 0) { return null; }

		this.add(...args);

		if (args.length == 1) {
			return this.images.get(args[0]);
		}
		else {
			return args.map((images) => {
				if (images instanceof Array) { images.map((v) => this.images.get(v.toString())); }
				else if(typeof images === 'string') { this.images.get(images); }
			});
		}
	}

}

var You = {
	time_last: null,

	canvas: null,
	context: null,
	input: null,
	scene: null,
	thread: null,
	
	game: null,
	selected: null,


	loop: function() {
		var time_now = Date.now();

		// Input
		this.input.update();

		// Update
		if (this.scene.current) { this.scene.update((time_now - this.time_last) / 1000); }
		else { this.update((time_now - this.time_last) / 1000); }

		// Draw
		this.buffer.save();
		this.buffer.fillStyle = 'black';
		this.buffer.fillRect(0, 0, this.buffer.canvas.width, this.buffer.canvas.height);
		if (this.scene.current) { this.scene.draw(this.buffer); }
		else { this.draw(this.buffer); }
		this.context.drawImage(this.buffer.canvas, 0, 0);
		this.buffer.restore();

		this.time_last = time_now;
		this.display_handler = window.requestAFrame(()=>this.loop());
	},

	in: function() {
		this.canvas = document.getElementById("canvas");
		this.canvas.width = Math.min(window.innerWidth, window.innerHeight) - 10;
		this.canvas.height = Math.min(window.innerWidth, window.innerHeight) - 10;
		this.canvas.style.position = "absolute";
		this.canvas.style.left = Math.floor((window.innerWidth - this.canvas.width) / 2) + "px";
		this.canvas.style.top = Math.floor((window.innerHeight - this.canvas.height) / 2) + "px";

		this.context = this.canvas.getContext("2d");

		this.buffer = document.createElement("canvas").getContext("2d");
		this.buffer.canvas.width = this.canvas.width;
		this.buffer.canvas.height = this.canvas.height;

		this.input = new Input();

		this.asset = new Asset();
		
		this.resize_handler = () => {
			let size = Math.min(window.innerWidth, window.innerHeight) - 10;
			this.canvas.width = this.canvas.height = size;
			this.buffer.canvas.width = this.buffer.canvas.height = size;
			this.canvas.style.left = Math.floor((window.innerWidth - this.canvas.width) / 2) + "px";
			this.canvas.style.top = Math.floor((window.innerHeight - this.canvas.height) / 2) + "px";
		}

		window.addEventListener('resize', this.resize_handler);

		this.scene = new Scene();

		this.games = [ Tetris, Nemo, Game, Editor ];
		this.selected = 0;
		
		this.time_last = Date.now();
		
		this.display_handler = window.requestAFrame(()=>this.loop());
	},

	out: function() {
		window.cancelAFrame(this.display_handler);
		this.display_handler = null;

		this.time_last = 0;

		this.games = null;
		this.selected = 0;

		this.scene.clear();
		this.scene = null;

		window.removeEventListener('resize', this.resize_handler);

		this.input.clear();
		this.input = null;
	},

	update: function(delta) {
		if (You.input.key.down(Input.KEY_ENTER)) {
			You.scene.transit(this.games[this.selected].scene.title);
			return;
		}

		if (You.input.key.down(Input.KEY_UP)) {
			this.selected = (this.selected - 1 + this.games.length) % this.games.length;
		}
		else if (You.input.key.down(Input.KEY_DOWN)) {
			this.selected = (this.selected + 1) % this.games.length;
		}
	},

	draw: function(context) {
		context.font = "12px Arial";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillStyle = "#fff";
		for (let i = 0; i < this.games.length; i++) {
			if (this.selected == i) {
				context.fillStyle = "rgba(255, 255, 255, 0.5)";
				context.fillRect(0, i * You.canvas.height / this.games.length, You.canvas.width, You.canvas.height / this.games.length);
				context.fillStyle = "#fff";
			}
			context.fillText(this.games[i].name, You.canvas.width / 2, You.canvas.height / this.games.length / 2 * (2 * i + 1));
		}
	}
};