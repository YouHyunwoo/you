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
		scene.in(...args);
		this.scenes.unshift(scene);
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
		for (let images of args) {
			if (images instanceof Array) {
				images = images.map((v) => v.toString());
			}
			else if (typeof images === 'string') {
				images = [images];
			}
			
			for (let i of images) {
				if (this.images.has(i)) {
					continue;
				}

				let image = {
					name: i,
					raw: new Image(),
					loaded: false,
					toJSON: () => ({ name: i })
				};

				image.raw.onload = () => { image.loaded = true; };
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


	loop: function () {
		let time_now = Date.now();

		// Input
		this.input.update();

		// Update
		this.scene.update((time_now - this.time_last) / 1000);

		// Draw
		this.buffer.save();

		this.buffer.fillStyle = 'black';
		this.buffer.fillRect(0, 0, this.buffer.canvas.width, this.buffer.canvas.height);

		this.scene.draw(this.buffer);

		this.context.drawImage(this.buffer.canvas, 0, 0);

		this.buffer.restore();

		this.time_last = time_now;

		this.display_handler = window.requestAFrame(() => this.loop());
	},

	in: function (scene) {
		this.canvas = document.getElementById("canvas");
		this.context = this.canvas.getContext("2d");

		this.buffer = document.createElement("canvas").getContext("2d");

		this.resize_handler = () => {
			let size = Math.min(window.innerWidth, window.innerHeight) - 10;

			this.canvas.width = this.canvas.height = size;
			this.canvas.style.left = Math.floor((window.innerWidth - this.canvas.width) / 2) + "px";
			this.canvas.style.top = Math.floor((window.innerHeight - this.canvas.height) / 2) + "px";

			this.buffer.canvas.width = this.buffer.canvas.height = size;
		}

		window.addEventListener('resize', this.resize_handler);

		this.resize_handler()


		this.input = new Input();

		this.asset = new Asset();
		
		this.scene = new Scene(scene);

		
		this.time_last = Date.now();
		
		this.display_handler = window.requestAFrame(() => this.loop());
	},

	out: function () {
		window.cancelAFrame(this.display_handler);
		this.display_handler = null;

		this.time_last = 0;

		this.scene.clear();
		this.scene = null;

		this.input.clear();
		this.input = null;

		window.removeEventListener('resize', this.resize_handler);
	},
};

You.Asset = class {
	static set(key, value) {
		window.localStorage.setItem(key, value);
	}

	static get(key) {
		return window.localStorage.getItem(key);
	}

	static remove(key) {
		window.localStorage.removeItem(key);
	}

	static clear() {
		window.localStorage.clear();
	}
};

You.Object = class {
	constructor(name) {
		this.parent = null;

		this.name = name;
		this.enable = true;
		this.components = [];
		this.tags = [];
	}

	addComponent(component) {
		if (!component) {
			throw 'argumentError';
		}

		component.parent = this;
		this.components.push(component);

		if (component.name) {
			this[component.name] = component;
		}

		return this;
	}

	removeComponent(component) {
		if (!component) {
			throw 'argumentError';
		}

		let idx = this.components.indexOf(component);
		if (idx > -1) {
			let component = this.components.splice(idx, 1);
			component.parent = null;

			if (component.name) {
				delete this[component.name];
			}
		}

		return this;
	}

	findComponent(expression) {
		let [name, ...tags] = expression.split('#');
		let found = [];

		loopComponent:
		for (let c of this.components) {
			if (!(name && c.name == name)) {
				continue;
			}

			for (let tag of tags) {
				if (!c.tags.includes(tag)) {
					continue loopComponent;
				}
			}

			found.push(c);
		}

		return found;
	}

	// tag

	update(delta, ...args) {
		this.onUpdate(delta, ...args);
		this.components.forEach((c) => c.update(delta, ...args));
	}
	onUpdate(delta, ...args) {}

	draw(context, ...args) {
		this.onDraw(context, ...args);
		this.components.forEach((c) => c.draw(context, ...args));
	}
	onDraw(context, ...args) {}
};

You.State = class extends You.Object {
	constructor(name) {
		super(name);
	}

	request(...args) {

	}

	transit(stateName, enterArgs, exitArgs) {
		this.parent.transit(stateName, enterArgs, exitArgs);
	}

	enter(...args) {
		this.onEnter(...args);
	}
	onEnter(...args) {}

	exit(...args) {
		this.onExit(...args);
	}
	onExit(...args) {}
};

You.State.Context = class extends You.Object {
	constructor(name) {
		super(name);

		this.state = null;
	}

	update(delta, ...args) {
		this.onUpdate(delta, ...args);

		if (this.state) {
			this.state.onUpdate(delta, ...args);
		}
	}

	draw(context, ...args) {
		this.onDraw(context, ...args);

		if (this.state) {
			this.state.onDraw(context, ...args);
		}
	}

	request(...args) {
		if (this.state != null) {
			this.state.request(...args);
		}
	}

	transit(stateName, enterArgs, exitArgs) {
		if (this.state != null) {
			if (exitArgs) {
				this.state.exit(...exitArgs);
			}
			else {
				this.state.exit();
			}
		}

		if (stateName != null) {
			let state = this.findComponent(stateName);

			if (state) {
				this.state = state[0];
				console.info('state changed: %s', this.state.name);

				if (enterArgs) {
					this.state.enter(...enterArgs);
				}
				else {
					this.state.enter();
				}
			}
			else {
				console.info('state cannot change: %s', stateName);
			}
		}
	}
};

You.Text = class extends You.Object {
	constructor(name) {
		super(name);

		this.position = [0, 0];
		this.size = null;
		this.padding = [0, 0];

		this.text = '';
		this.font = '15px Arial';
		this.textAlpha = 1;
		this.textAlign = 'left';
		this.textVerticalAlign = 'top';
		this.textColor = 'white';
		this.backgroundColor = 'black';
	}

	onDraw(context) {
		context.save();

		context.fillStyle = this.backgroundColor;
		context.fillRect(...this.position, ...this.size);

		context.font = this.font;
		context.globalAlpha = this.textAlpha;
		context.textAlign = this.textAlign;
		context.textBaseline = this.size == null ? 'top' : this.textVerticalAlign;
		context.fillStyle = this.textColor;
		
		let [tx, ty] = this.position;

		let dx = { left: 0, center: 1, right: 2 };
		tx += dx[this.textAlign] * this.size[0] / 2;
		tx += (1 - dx[this.textAlign]) * this.padding[0];

		let dy = { top: 0, middle: 1, bottom: 2};
		ty += dy[this.textVerticalAlign] * this.size[1] / 2;
		ty += (1 - dy[this.textVerticalAlign]) * this.padding[1];

		context.beginPath();
		context.rect(...this.position, ...this.size);
		context.clip();

		let textMetrics = context.measureText(this.text);
		let textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

		let lines = this.text.split('\n');

		for (let i = 0; i < lines.length; i++) {
			context.fillText(lines[i], tx, ty + textHeight * i);
		}

		context.restore();
	}

	setPosition(position) {
		this.position = position || [0, 0];

		return this;
	}

	setSize(size) {
		this.size = size || null;

		return this;
	}

	setPadding(padding) {
		this.padding = padding || [0, 0];

		return this;
	}

	setText(text) {
		this.text = text.replace(/\t/g, '') || '';

		return this;
	}

	setFont(font) {
		this.font = font || '15px Arial';

		return this;
	}

	setTextAlpha(textAlpha) {
		this.textAlpha = textAlpha;

		return this;
	}

	setTextAlign(textAlign) {
		this.textAlign = textAlign || 'left';

		return this;
	}

	setTextVerticalAlign(textVerticalAlign) {
		this.textVerticalAlign = textVerticalAlign || 'top';

		return this;
	}

	setTextColor(textColor) {
		this.textColor = textColor || 'white';

		return this;
	}

	setBackgroundColor(backgroundColor) {
		this.backgroundColor = backgroundColor || 'black';

		return this;
	}
};

You.Button = class extends You.Text {
	constructor(name) {
		super(name);

		this.handlers = [];
		this.args = [];
	}

	addHandler(handler, ...args) {
		if (!handler) {
			throw 'argumentError';
		}

		this.handlers.push(handler);
		this.args.push(args);

		return this;
	}

	removeHandler(handler) {
		if (!handler) {
			throw 'argumentError';
		}

		let idx = this.handlers.indexOf(handler);
		if (idx > -1) {
			this.handlers.splice(idx, 1);
			this.args.splice(idx, 1);
		}

		return this;
	}

	handleMouse(mouse) {
		let [mx, my] = mouse;
		let [bx, by, bw, bh] = [...this.position, ...this.size];
		
		if (bx <= mx && mx < bx+bw && by <= my && my < by+bh) {
			this.handlers.forEach((h, i) => h(...this.args[i]));
		}
	}
};