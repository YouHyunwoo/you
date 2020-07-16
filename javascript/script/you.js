"use strict";

var You = {
	loop() {
		let time_now = Date.now();


		You.Input.update();

		let delta = (time_now - this.time_last) / 1000;

		You.Animation.update(delta);

		You.Scene.update(delta);


		this.buffer.save();

		this.buffer.fillStyle = 'black';
		this.buffer.fillRect(0, 0, this.buffer.canvas.width, this.buffer.canvas.height);

		You.Scene.draw(this.buffer);

		this.context.drawImage(this.buffer.canvas, 0, 0);

		this.buffer.restore();


		this.time_last = time_now;

		this.display_handler = window.requestAFrame(() => this.loop());
	},

	in(scene, ...args) {
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


		You.Input.in();
		
		You.Scene.in(scene, ...args);

		
		this.time_last = Date.now();
		
		this.display_handler = window.requestAFrame(() => this.loop());
	},

	out() {
		window.cancelAFrame(this.display_handler);
		this.display_handler = null;

		this.time_last = 0;


		You.Scene.clear();

		You.Input.clear();


		window.removeEventListener('resize', this.resize_handler);
	},
};

You.Data = {};
You.Data.toJSON = function (instance) {
	if (instance == undefined || instance == null) {
		instance = {};
	}

	return {
		'@class': instance.constructor.name,
		...instance
	}
}
You.Data.fromJSON = function (data) {
	if (data instanceof Array) {
		return data.map((d) => You.Data.fromJSON(d));
	}
	else if (data instanceof Object) {
		if (data.hasOwnProperty('@class')) {
			return data['@class']
					.match(/[A-Z][^_]*/g)
					.reduce((acc, cur) => acc[cur], window)
					.fromJSON(data);
		}
		else {
			// return Object.key(data).reduce((acc, key) => acc[key] = You.Data.fromJSON(data[key]), {});

			for (let p in data) {
				data[p] = You.Data.fromJSON(data[p]);
			}

			return data;
		}
	}
	else {
		return data;
	}
}

You.Animation = class {
	static #animations = [];
	
	static update(delta) {
		this.#animations.forEach((e) => e.update(delta));
	}

	static apply(object, property, time, interpolator) {
		let value = object[property];

		if (isNaN(value) && !value instanceof Array) {
			return false;
		}

		let animation = {
			progress: 1,
			current: value,
			start: value,
			end: value,
			time: time,
			update(delta) {
				if (this.progress >= 1) {
					return;
				}

				let next = this.progress + delta / this.time;

				if (next >= 1) {
					this.progress = 1;
					this.current = this.end;
				}
				else {
					this.progress = next;
					this.current = this.current instanceof Array
									? this.end.subv(this.start).muls(next).addv(this.start)
									: (this.end - this.start) * next + this.start;
				}
			},
		};

		this.#animations.push(animation);

		let thisAnimations = this.#animations

		Object.defineProperty(object, property, {
			get () {
				return animation.current;
			},
			set (value) {
				if (value == 'cancel') {
					let index = thisAnimations.indexOf(animation);

					if (index >= 0) {
						thisAnimations.splice(index, 1);
					}

					Object.defineProperty(object, property, {
						enumerable: true,
						configurable: true,
						writable: true,
						value: animation.current,
					});
					
					return;
				}

				animation.progress = 0;
				animation.start = animation.current;
				animation.end = value;
			}
		});
	}
};

You.Input = class {

	static KEY_ENTER	= 13;
	static KEY_ESCAPE	= 27;
	static KEY_SPACE	= 32;
	static KEY_LEFT		= 37;
	static KEY_RIGHT	= 39;
	static KEY_UP		= 38;
	static KEY_DOWN		= 40;
	static KEY			= (k) => k.charCodeAt();

	static #tkey;
	static #key;
	static #tmouse;

	static in() {
		this.#tkey = {
			down: new Set(),
			up: new Set(),
		}
		this.#key = {
			down: new Set(),
			press: new Set(),
			up: new Set(),
		};

		this.key = {
			down: (keycode) => (keycode) ? this.#key.down.has(keycode) : this.#key.down.size > 0,
			press: (keycode) => (keycode) ? this.#key.press.has(keycode) : this.#key.press.size > 0,
			up: (keycode) => (keycode) ? this.#key.up.has(keycode) : this.#key.up.size > 0
		};

		this.#tmouse = {
			down: null,
			move: null,
			up: null,
		};

		this.mouse = {
			position: null,
			down: null,
			move: null,
			up: null,
		};

		window.addEventListener('keydown', (e) => {
			let keycode = e.key;

			if (!(this.#key.down.has(keycode) || this.#key.press.has(keycode))) {
				this.#tkey.down.add(keycode);
			}

			console.log(e.key);
		});

		window.addEventListener('keyup', (e) => {
			this.#tkey.up.add(e.key);
		});

		document.getElementById('canvas').addEventListener('pointerdown', (e) => {
			e.target.setPointerCapture(e.pointerId);

			this.mouse.position = [e.offsetX, e.offsetY];
			this.#tmouse.down = [e.offsetX, e.offsetY];
		});

		document.getElementById('canvas').addEventListener('pointermove', (e) => {
			this.mouse.position = [e.offsetX, e.offsetY];
			this.#tmouse.move = [e.offsetX, e.offsetY];
		});

		document.getElementById('canvas').addEventListener('pointerup', (e) => {
			e.target.releasePointerCapture(e.pointerId);

			this.mouse.position = [e.offsetX, e.offsetY];
			this.#tmouse.up = [e.offsetX, e.offsetY];
		});
	}

	static update() {
		this.#key.up.clear();

		for (let v of this.#tkey.up) {
			if (this.#key.press.has(v)) {
				this.#key.up.add(v);
				this.#key.press.delete(v);
				this.#tkey.up.delete(v);
			}
		}

		for (let v of this.#key.down) {
			this.#key.press.add(v);
		}

		this.#key.down.clear();

		for (let v of this.#tkey.down) {
			this.#key.down.add(v);
		}

		this.#tkey.down.clear();

		this.mouse.down = this.#tmouse.down;
		this.#tmouse.down = null;

		this.mouse.move = this.#tmouse.move;
		this.#tmouse.move = null;

		this.mouse.up = this.#tmouse.up;
		this.#tmouse.up = null;

		// if (this.#key.press.size > 0) {
		// 	debugger;
		// }
	}

	static clear() {
		this.#tkey.down.clear();
		this.#tkey.up.clear();
		this.#key.down.clear();
		this.#key.press.clear();
		this.#key.up.clear();
		this.#tmouse.down = null;
		this.#tmouse.move = null;
		this.#tmouse.up = null;
		this.mouse.position = null;
		this.mouse.down = null;
		this.mouse.move = null;
		this.mouse.up = null;
	}
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

You.Asset.Image = class {
	
	static #data = new Map();
	static #refCount = new Map();

	static load(file) {
		if (this.#data.has(file)) {
			this.#refCount.set(file, this.#refCount.get(file) + 1);

			return this.#data.get(file);
		}
		else {
			let image = new You.Graphics.Image(file);

			if (image.loaded != null) {
				this.#data.set(file, image);
				this.#refCount.set(file, 1);
			}

			return image;
		}
	}

	static unload(file) {
		if (this.#data.has(file)) {
			this.#refCount.set(file, this.#refCount.get(file) - 1);

			if (this.#refCount.get(file) == 0) {
				this.#refCount.delete(file);

				this.#data.delete(file);
			}
		}
	}
};

You.Asset.Image.Loader = class {
	
	#images = [];

	load(...args) {
		args.forEach((e) => this.#images.push(new You.Asset.Image.load(e)));

		return this;
	}

	unload() {
		this.#images.forEach((e) => You.Asset.Image.unload(e.file));

		return this;
	}

	get rate() {
		return this.#images.filter((e) => e.loaded).length / this.#images.length;
	}

	get loaded() {
		return this.#images.every((e) => e.loaded);
	}
};

You.Scene = class {

	static scenes = [];

	static in(scene, ...args) {
		this.scenes = [];
		if (scene) { this.push(scene, ...args); }
	}

	static transit(scene, ...args) {
		this.pop();
		this.push(scene, ...args);
	}

	static push(scene, ...args) {
		scene.in(...args);
		this.scenes.unshift(scene);
	}

	static pop() {
		if (this.scenes.length > 0) {
			this.scenes.shift().out();
		}
	}

	static update(delta) {
		if (this.scenes.length > 0) {
			this.scenes[0].update(delta);
		}
	}

	static draw(context) {
		if (this.scenes.length > 0) {
			this.scenes[0].draw(context);
		}
	}

	static clear() {
		while (this.scenes.length > 0) {
			this.pop();
		}
	}

	images = [];
	sprites = [];
	objects = [];

	in(...args) {}
	out() {}
	update(delta, ...args) {}
	draw(context, ...args) {}

	toJSON() {
		// images, sprites, objects
		// images
		let images = this.images;

		let sprites = this.sprites;

		return {
			images: images,
			sprites: sprites,
			objects: objects
		};
	}

	static fromJSON(data) {
		let instance = new this();

		instance.images = data.images.map((e) => You.Asset.Image(e));

		instance.sprites = data.sprites.map((e) => Korea.Graphics.Sprite());

		return instance;
	}
};

You.Object = class You_Object {

	#disposed = false;

	constructor(name) {
		Object.defineProperty(this, 'parent', {
			value: null,
			writable: true
		});

		this.name = name;
		this.enable = true;
		this.components = [];
		this.tags = [];

		this.onCreate();
	}

	set order(value) {
		if (this.parent) {
			let comps = this.parent.components;

			comps.splice(comps.indexOf(this), 1);
			comps.splice(Math.max(value, 0), 0, this);
		}
	}

	get order() {
		if (this.parent) {
			return this.parent.components.indexOf(this);
		}

		return null;
	}

	addComponents(...components) {
		for (let component of components) {
			if (!component) {
				throw 'argumentError';
			}

			if (component.disposed) {
				continue;
			}

			component.parent = this;
			this.components.push(component);
			component.onAdded(this);

			if (component.name) {
				if (this[component.name] == undefined) {
					Object.defineProperty(this, component.name, {
						value: component,
						configurable: true
					});
				}
			}
		}

		return this;
	}

	removeComponents(...components) {
		for (let component of components) {
			if (!component) {
				throw 'argumentError';
			}

			let idx = this.components.indexOf(component);

			if (idx > -1) {
				let component = this.components.splice(idx, 1)[0];

				component.parent = null;
				component.onRemoved(this);

				if (this.hasOwnProperty(component.name) && this[component.name] == component) {
					delete this[component.name];
				}
			}
		}

		return this;
	}

	findComponent(expression) {
		let [name, ...tags] = expression.split('#');

		loopComponent:
		for (let c of this.components) {
			if (c.disposed) {
				continue;
			}

			if (name && c.name != null && c.name != name) {
				continue;
			}

			for (let tag of tags) {
				if (!c.tags.includes(tag)) {
					continue loopComponent;
				}
			}

			return c;
		}

		return null;
	}

	findComponents(expression) {
		let [name, ...tags] = expression.split('#');
		let found = [];

		loopComponent:
		for (let c of this.components) {
			if (c.disposed) {
				continue;
			}

			if (name && c.name != null && c.name != name) {
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

	addTags(...values) {
		for (let value of values) {
			this.tags.push(value);
		}

		return this;
	}

	removeTags(...values) {
		for (let value of values) {
			let index = this.tags.indexOf(value);

			if (index > -1) {
				this.tags.splice(index, 1);
			}
		}

		return this;
	}

	onAdded(parent) {}
	onRemoved(parent) {}

	dispose() {
		this.#disposed = true;
		this.onDispose();
	}

	get disposed() {
		return this.#disposed;
	}

	onCreate() {}
	onDispose() {}

	update(delta, ...args) {
		if (this.enable && !this.#disposed) {
			this.onUpdate(delta, ...args);
			[...this.components].forEach((c) => c.update(delta, ...args));
		}

		this.components.filter((c) => c.disposed).forEach((c) => this.removeComponents(c));
	}
	onUpdate(delta, ...args) {}

	draw(context, ...args) {
		if (this.enable && !this.#disposed) {
			this.onDraw(context, ...args);
			this.components.forEach((c) => c.draw(context, ...args));
		}
	}
	onDraw(context, ...args) {}

	toJSON() {
		return {
			'@class': this.constructor.name,
			...this
		};
	}

	static fromJSON(data) {
		let instance = new this();

		delete data['@class'];

		for (let prop in data) {
			if (prop == 'components') {
				instance.addComponents(...You.Data.fromJSON(data[prop]));
			}
			else {
				instance[prop] = You.Data.fromJSON(data[prop]);
			}
		}

		return instance;
	}
};

You.State = class You_State extends You.Object {
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

You.State.Context = class You_State_Context extends You.Object {
	constructor(name) {
		super(name);

		this.state = null;
	}

	addComponents(...components) {
		super.addComponents(...components);

		if (this.state == null) {
			this.transit(components[0].name);
		}

		return this;
	}

	update(delta, ...args) {
		this.onUpdate(delta, ...args);

		if (this.state) {
			this.state.update(delta, ...args);
		}
	}

	draw(context, ...args) {
		this.onDraw(context, ...args);

		if (this.state) {
			this.state.draw(context, ...args);
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
				this.state = state;
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

	toJSON() {
		let props = {...this};

		delete props.state;

		return {
			'@class': this.constructor.name,
			...props,
			state: this.state.name
		};
	}

	static fromJSON(object) {
		let instance = super.fromJSON(object);

		instance.state = instance.findComponent(object.state);

		return instance;
	}
};

You.Area = class extends You.Object {
	constructor(name) {
		super(name);

		this.position = [0, 0];
		this.size = [0, 0];

		this.color = null;
	}

	mouseDown(event) {
		if (!event.stop) {
			this.onMouseDown(event);
		}

		if (!event.stop) {
			[event.x, event.y] = [event.x, event.y].subv(this.position);

			for (let c = this.components.length-1; c >= 0; c--) {
				if (this.components[c].mouseDown) {
					this.components[c].mouseDown(event);
				}

				if (event.stop) {
					break;
				}
			}

			[event.x, event.y] = [event.x, event.y].addv(this.position);
		}
	}

	onMouseDown(event) {}

	mouseMove(event) {
		if (!event.stop) {
			this.onMouseMove(event);
		}

		if (!event.stop) {
			[event.x, event.y] = [event.x, event.y].subv(this.position);

			for (let c = this.components.length-1; c >= 0; c--) {
				if (this.components[c].mouseMove) {
					this.components[c].mouseMove(event);
				}

				if (event.stop) {
					break;
				}
			}

			[event.x, event.y] = [event.x, event.y].addv(this.position);
		}
	}

	onMouseMove(event) {}

	mouseUp(event) {
		if (!event.stop) {
			this.onMouseUp(event);
		}

		if (!event.stop) {
			[event.x, event.y] = [event.x, event.y].subv(this.position);

			for (let c = this.components.length-1; c >= 0; c--) {
				if (this.components[c].mouseUp) {
					this.components[c].mouseUp(event);
				}

				if (event.stop) {
					break;
				}
			}

			[event.x, event.y] = [event.x, event.y].addv(this.position);
		}
	}

	onMouseUp(event) {}

	onUpdate(delta) {
		if (this.parent == null) {
			let mouse = You.Input.mouse;

			if (mouse.down) {
				this.mouseDown({
					x: mouse.down[0],
					y: mouse.down[1],
					stop: false
				});
			}

			if (mouse.move) {
				this.mouseMove({
					x: mouse.move[0],
					y: mouse.move[1],
					stop: false
				});
			}

			if (mouse.up) {
				this.mouseUp({
					x: mouse.up[0],
					y: mouse.up[1],
					stop: false
				});
			}
		}
	}

	draw(context, ...args) {
		context.save();

		if (this.color) {
			context.fillStyle = this.color;
			context.fillRect(...this.position, ...this.size);
		}

		this.onDraw(context, ...args);
		this.components.forEach((c) => c.draw(context, ...args));

		context.restore();
	}

	intersect(other) {
		if (other instanceof You.Area) {
			return this.x < other.x + other.width && other.x < this.x + this.width &&
				this.y < other.y + other.height && other.y < this.y + this.height;
		}

		return null;
	}

	contain(point) {
		return this.position[0] < point[0] && point[0] < this.position[0] + this.size[0] &&
				this.position[1] < point[1] && point[1] < this.position[1] + this.size[1];
	}

	localToGlobal(point) {
		return this.parent && this.parent instanceof You.Area ? this.parent.localToGlobal(point.addv(this.position)) : point.addv(this.position);
	}

	globalToLocal(point) {
		return this.parent && this.parent instanceof You.Area ? this.parent.globalToLocal(point.subv(this.position)) : point.subv(this.position);
	}

	setPosition(position) {
		this.position = position || [0, 0];

		return this;
	}

	setSize(size) {
		this.size = size || [0, 0];

		return this;
	}

	setColor(color) {
		this.color = color || null;

		return this;
	}

	get x() { return this.position[0]; }
	get y() { return this.position[1]; }
	get width() { return this.size[0]; }
	get height() { return this.size[1]; }
};

You.Panel = class extends You.Area {
	constructor(name) {
		super(name);

		this.clip = true;
	}

	draw(context, ...args) {
		context.save();

		context.translate(...this.position);
		
		if (this.clip) {
			context.beginPath();
			context.rect(0, 0, ...this.size);
			context.clip();
		}

		if (this.color) {
			context.fillStyle = this.color;
			context.fillRect(0, 0, ...this.size);
		}

		this.onDraw(context, ...args);
		this.components.forEach((c) => c.draw(context, ...args));

		context.restore();
	}

	setClip(clip) {
		this.clip = clip;

		return this;
	}
};

You.ScrollPanel = class extends You.Panel {

	#mouseOver = false;
	#mouseDown = false;
	#anchorPosition = null;
	#deltaPosition = null;
	#originalPosition = null;

	constructor(name) {
		super(name);

		this.panelPosition = [0, 0];
		this.panelSize = [0, 0];

		this.scrollDirection = 'vertical'; // vertical, horizontal, both
		this.align = 'left';
		this.valign = 'top';
	}

	mouseDown(event) {
		if (!event.stop) {
			this.onMouseDown(event);
		}

		if (!event.stop) {
			if (this.clip && this.contain([event.x, event.y])) {
				// if (this.contain([event.x, event.y])) {
					[event.x, event.y] = [event.x, event.y].subv(this.position).subv(this.panelPosition);
					// this.contain -> comps
					for (let c = this.components.length-1; c >= 0; c--) {
						this.components[c].mouseDown(event);

						if (event.stop) {
							break;
						}
					}

					[event.x, event.y] = [event.x, event.y].addv(this.position).addv(this.panelPosition);
				// }
			}
		}
	}

	mouseMove(event) {
		if (!event.stop) {
			this.onMouseMove(event);
		}

		if (!event.stop) {
			if (this.clip && this.contain([event.x, event.y])) {
				[event.x, event.y] = [event.x, event.y].subv(this.position).subv(this.panelPosition);

				for (let c = this.components.length-1; c >= 0; c--) {
					this.components[c].mouseMove(event);

					if (event.stop) {
						break;
					}
				}

				[event.x, event.y] = [event.x, event.y].addv(this.position).addv(this.panelPosition);
			}
		}
	}

	mouseUp(event) {
		if (!event.stop) {
			this.onMouseUp(event);
		}

		if (!event.stop) {
			[event.x, event.y] = [event.x, event.y].subv(this.position).subv(this.panelPosition);
			
			for (let c = this.components.length-1; c >= 0; c--) {
				this.components[c].mouseUp(event);
				if (event.stop) {
					break;
				}
			}

			[event.x, event.y] = [event.x, event.y].addv(this.position).addv(this.panelPosition);
		}
	}

	onMouseDown(event) {
		if (!this.#mouseDown) {
			if (this.#mouseOver) {
				this.#anchorPosition = [event.x, event.y];
				this.#deltaPosition = [0, 0];

				this.#originalPosition = [...this.panelPosition];

				this.#mouseDown = true;
			}
		}
	}

	onMouseMove(event) {
		if (this.#mouseDown) {
			this.#deltaPosition = [event.x, event.y].subv(this.#anchorPosition);
			
			if (this.scrollDirection == 'horizontal' || this.scrollDirection == 'both') {
				this.panelPosition[0] = this.#originalPosition[0] + this.#deltaPosition[0];
			}
			else if (this.scrollDirection == 'vertical' || this.scrollDirection == 'both') {
				this.panelPosition[1] = this.#originalPosition[1] + this.#deltaPosition[1];
			}

			if (this.scrollDirection == 'vertical' || this.size[0] > this.panelSize[0]) {
				let dx = { left: 0, center: 1, right: 2 };

				this.panelPosition[0] = dx[this.align] * (this.size[0] - this.panelSize[0]) / 2;
			}
			else {
				this.panelPosition[0] = Math.min(0, Math.max(this.size[0] - this.panelSize[0], this.panelPosition[0]));
			}

			if (this.scrollDirection == 'horizontal' || this.size[1] > this.panelSize[1]) {
				let dy = { top: 0, middle: 1, bottom: 2 };

				this.panelPosition[1] = dy[this.valign] * (this.size[1] - this.panelSize[1]) / 2;
			}
			else {
				this.panelPosition[1] = Math.min(0, Math.max(this.size[1] - this.panelSize[1], this.panelPosition[1]));
			}
		}
		else {
			if (this.contain([event.x, event.y])) {
				this.#mouseOver = true;
			}
			else {
				this.#mouseOver = false;
			}
		}
	}

	onMouseUp(event) {
		this.#mouseDown = false;

		if (this.#deltaPosition[0] != 0 || this.#deltaPosition[1] != 0) {
			event.stop = true;
		}
	}

	draw(context, ...args) {
		context.save();

		context.translate(...this.position.map((e) => Math.floor(e)));
		
		if (this.clip) {
			context.beginPath();
			context.rect(0, 0, ...this.size);
			context.clip();
		}

		context.translate(...this.panelPosition);

		this.onDraw(context, ...args);
		this.components.forEach((c) => c.draw(context, ...args));

		context.restore();
	}

	onDraw(context) {
		context.save();

		context.fillStyle = this.color;
		context.fillRect(0, 0, ...this.panelSize);

		context.restore();
	}

	setPanelPosition(panelPosition) {
		this.panelPosition = panelPosition || [0, 0];

		return this;
	}

	setPanelSize(panelSize) {
		this.panelSize = panelSize || [0, 0];

		return this;
	}

	setScrollDirection(scrollDirection) {
		this.scrollDirection = scrollDirection || 'vertical';

		return this;
	}

	setAlign(align) {
		this.align = align || 'left';

		return this;
	}

	setVAlign(valign) {
		this.valign = valign || 'top';

		return this;
	}
};

You.Text = class extends You.Area {

	#textHeight = 0;

	constructor(name) {
		super(name);

		this.padding = [0, 0];

		this.text = '';
		this.font = '15px Arial';
		this.align = 'left';
		this.valign = 'top';
		this.color = 'white';
		this.backgroundColor = null;

		this.#textHeight = 0;
	}

	draw(context, ...args) {
		context.save();

		if (this.backgroundColor) {
			context.fillStyle = this.backgroundColor;
			context.fillRect(...this.position, ...this.size);
		}

		this.onDraw(context, ...args);
		this.components.forEach((c) => c.draw(context, ...args));

		context.restore();
	}

	onDraw(context) {
		context.save();

		if (this.text) {
			context.font = this.font;
			context.textAlign = this.align;
			context.textBaseline = this.valign;
			context.fillStyle = this.color;
			
			let [tx, ty] = this.position;

			let dx = { left: 0, center: 1, right: 2 };

			tx += dx[this.align] * this.size[0] / 2;
			tx += (1 - dx[this.align]) * this.padding[0];

			let dy = { top: 0, middle: 1, bottom: 2 };

			ty += dy[this.valign] * this.size[1] / 2;
			ty += (1 - dy[this.valign]) * this.padding[1];

			context.beginPath();
			context.rect(...this.position, ...this.size);
			context.clip();

			let lines = this.text.split('\n');

			for (let i = 0; i < lines.length; i++) {
				context.fillText(lines[i], tx, ty + this.#textHeight * i);
			}
		}

		context.restore();
	}

	setPadding(padding) {
		this.padding = padding || [0, 0];

		return this;
	}

	setText(text) {
		this.text = text.replace(/\t/g, '') || '';

		let oldFont = You.context.font;

		You.context.font = this.font;

		let textMetrics = You.context.measureText(this.text);

		this.#textHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

		You.context.font = oldFont;

		return this;
	}

	setFont(font) {
		this.font = font || '15px Arial';

		return this;
	}

	setAlign(align) {
		this.align = align || 'left';

		return this;
	}

	setVAlign(valign) {
		this.valign = valign || 'top';

		return this;
	}

	setColor(color) {
		this.color = color || 'white';

		return this;
	}

	setBackgroundColor(backgroundColor) {
		this.backgroundColor = backgroundColor || null;

		return this;
	}
};

You.Button = class extends You.Text {

	#mouseOver = false;
	#mouseDown = false;

	constructor(name) {
		super(name);

		this.handlers = [];
		this.args = [];
	}

	onMouseDown(event) {
		if (!this.#mouseDown) {
			if (this.#mouseOver) {
				this.#mouseDown = true;
			}
		}
	}

	onMouseMove(event) {
		if (this.contain([event.x, event.y])) {
			this.#mouseOver = true;
		}
		else {
			this.#mouseOver = false;
		}
	}

	onMouseUp(event) {
		if (this.#mouseDown && this.#mouseOver) {
			this.handlers.forEach((h, i) => h(...this.args[i]));
		}
	}

	onDraw(context) {
		super.onDraw(context);

		if (this.#mouseOver) {
			context.save();

			context.fillStyle = 'rgba(255, 255, 255, 0.1)';
			context.fillRect(...this.position, ...this.size);

			context.restore();
		}
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

	handle(point) {
		if (this.contain(point)) {
			this.handlers.forEach((h, i) => h(...this.args[i]));
		}
	}
};

You.Graphics = {};

You.Graphics.Area = class {
	constructor(position=null, size=null) {
		this.position = position;
		this.size = size;
	}

	setPosition(position) {
		this.position = position || [0, 0];

		return this;
	}

	setSize(size) {
		this.size = size || [0, 0];

		return this;
	}

	contains(point) {

	}

	intersects(area) {

	}
};

You.Graphics.Image = class You_Graphics_Image {

	#loaded = false;

	constructor(file) {
		this.file = file;

		Object.defineProperty(this, 'raw', {
			value: new Image(),
			writable: true
		});

		this.raw.onload = () => {
			this.#loaded = true;
		}

		this.raw.onerror = () => {
			this.#loaded = null;
		}

		this.raw.src = 'image/' + file;
	}

	draw(context, ...args) {
		if (this.raw && this.#loaded) {
			context.drawImage(this.raw, ...args);
		}
	}

	get loaded() {
		return this.#loaded;
	}

	get width() {
		return this.#loaded ? this.raw.naturalWidth : null;
	}

	get height() {
		return this.#loaded ? this.raw.naturalHeight : null;
	}

	toJSON() {
		return {
			'@class': this.constructor.name,
			...this
		}
	}

	static fromJSON(object) {
		return You.Asset.Image.load(object.file);
	}
};