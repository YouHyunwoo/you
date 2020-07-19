const Module = function (superclass=null) {
	if (superclass) {
		return class extends superclass {
			static module = new URL(import.meta.url).pathname;
		};
	}
	else {
		return class {
			static module = new URL(import.meta.url).pathname;
		};
	}
};

let currentInput = null;
let currentScene = null;
let currentAsset = null;

export async function fromJSON (json, asset={}) {
	if (json[0] == '@') {
		console.log(json);
		console.log(asset);
		return json.substring(1).split('/').reduce((acc, cur) => acc[cur], asset);
	}
	else if (json instanceof Array) {
		return await Promise.all(json.map(async (d) => await fromJSON(d, asset)));
	}
	else if (json instanceof Object) {
		if (json.hasOwnProperty('@class')) {
			const moduleUrl = json['@module'];
			const module = await import(`${moduleUrl}`);
			const cls = module[json['@class']];
			// console.log(json)
			// console.log(module);
			// console.log(cls);

			delete json['@module'];
			delete json['@class'];
			
			let result = cls.fromJSON(json, asset);
			
			return result;
		}
		else {
			for (let p in json) {
				json[p] = fromJSON(json[p], asset);
			}

			return json;
		}
	}
	else {
		return json;
	}
}

export class Engine {

	static #listeners = [];
	static #handler = null;

	static addListener(engine) {
		this.#listeners.push(engine);
	}

	static removeListener(engine) {
		let index = this.#listeners.indexOf(engine);

		if (index >= 0) {
			this.#listeners.splice(index, 1);
		}
	}

	static init() {
		this.#handler = window.requestAFrame(() => this.loop(Date.now()));
	}

	static loop(timeLast) {
		const timeNow = Date.now();

		const delta = (timeNow - timeLast) / 1000;

		this.#listeners.forEach(listener => {
			currentInput = listener.input;
			currentScene = listener.scene;
			currentAsset = listener.asset;
			listener.loop(delta);
		});

		this.#handler = window.requestAFrame(() => this.loop(timeNow));
	}

	static quit() {
		window.cancelAFrame(this.#handler);

		this.#listeners.clear();
	}

	constructor(canvasId) {
		this.canvas = document.getElementById(canvasId);
		this.context = this.canvas.getContext("2d");

		this.resizeHandler = () => {
			let size = Math.min(window.innerWidth, window.innerHeight) - 10;

			this.canvas.width = this.canvas.height = size;
			this.canvas.style.left = Math.floor((window.innerWidth - this.canvas.width) / 2) + "px";
			this.canvas.style.top = Math.floor((window.innerHeight - this.canvas.height) / 2) + "px";
		}

		window.addEventListener('resize', this.resizeHandler);

		this.resizeHandler()

		this.input = new Input(canvasId);
		this.scene = new Scene(this);
		this.asset = new Asset();
	}

	loop(delta) {
		if (!this.scene) {
			return;
		}

		this.input.update();
		this.scene.update(delta);

		this.context.save();
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.scene.draw(this.context);
		
		this.context.restore();
	}

	run(app) {
		Object.defineProperty(this, 'app', {
			enumerable: true,
			value: app
		});

		this.input.addEventListeners();
		this.scene.init(app.entry);

		Engine.addListener(this);
	}

	stop() {
		Engine.removeListener(this);

		this.scene.clear();
		this.input.addEventListeners();

		Object.defineProperty(this, 'app', {
			enumerable: true,
			value: null
		});
	}
};

export class Application {

	constructor(id, scenes, asset, entry) {
		Object.defineProperty(this, 'id', {
			enumerable: true,
			value: id
		});

		Object.defineProperty(this, 'scenes', {
			enumerable: true,
			value: scenes
		});

		Object.defineProperty(this, 'asset', {
			enumerable: true,
			value: asset
		});

		Object.defineProperty(this, 'entry', {
			enumerable: true,
			value: entry
		});
	}

	static async load(appId) {
		const data = await fetch(`http://localhost:8000/app/${appId}/app.json`);
		const json = await data.json();
		
		return this.fromJSON(json);
	}

	static async fromJSON(json) {
		const assets = await Promise.all(
			json.assets.map(async asset => await Asset.load(`app/${json.id}/asset/${asset}.json`))
		);

		console.log(json);

		const asset = Object.keys(json.assets).reduce((acc, cur, idx) => ({ ...acc, [cur]: assets[idx] }), {});

		const scenes = await Promise.all(
			json.scenes.map(async scene => await UScene.load(`app/${json.id}/scene/${scene}.json`, asset))
		);

		const entryIndex = json.scenes.indexOf(json.entry);

		const app = new this(json.id, scenes, asset, scenes[entryIndex]);

		return app;
	}
};

class Scene {

	#scenes = [];
	#engine;

	constructor(engine) {
		this.#engine = engine;
	}

	init(scene, ...args) {
		this.clear();

		if (scene) {
			this.push(scene, ...args);
		}
	}

	transit(scene, ...args) {
		this.pop();
		this.push(scene, ...args);
	}

	push(scene, ...args) {
		scene.engine = this.#engine;
		scene.in(...args);
		this.#scenes.unshift(scene);
	}

	pop() {
		if (this.#scenes.length > 0) {
			let scene = this.#scenes.shift();
			scene.out();
			scene.engine = null;
		}
	}

	update(delta) {
		if (this.#scenes.length > 0) {
			this.#scenes[0].update(delta);
		}
	}

	draw(context) {
		if (this.#scenes.length > 0) {
			this.#scenes[0].draw(context);
		}
	}

	clear() {
		while (this.#scenes.length > 0) {
			this.pop();
		}
	}
};

class Input {

	#tkey;
	#key;
	#tmouse;

	constructor(canvasId) {
		this.canvas = document.getElementById(canvasId);

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
	}

	addEventListeners() {
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

		this.canvas.addEventListener('pointerdown', (e) => {
			e.target.setPointerCapture(e.pointerId);

			this.mouse.position = [e.offsetX, e.offsetY];
			this.#tmouse.down = [e.offsetX, e.offsetY];
		});

		this.canvas.addEventListener('pointermove', (e) => {
			this.mouse.position = [e.offsetX, e.offsetY];
			this.#tmouse.move = [e.offsetX, e.offsetY];
		});

		this.canvas.addEventListener('pointerup', (e) => {
			e.target.releasePointerCapture(e.pointerId);

			this.mouse.position = [e.offsetX, e.offsetY];
			this.#tmouse.up = [e.offsetX, e.offsetY];
		});
	}
	
	removeEventListeners() {
		window.removeEventListener('keydown');
		window.removeEventListener('keyup');
		this.canvas.removeEventListener('pointerdown');
		this.canvas.removeEventListener('pointermove');
		this.canvas.removeEventListener('pointerup');
	}

	update() {
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
	}

	clear() {
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

class Asset {
	static async load(assetFile) {
		const data = await fetch(`http://localhost:8000/${assetFile}`);
		const json = await data.json();
		const asset = this.fromJSON(json);

		return asset;
	}

	static async fromJSON(json) {
		const instance = new this();

		for (const p in json) {
			Object.defineProperty(instance, p, {
				enumerable: true,
				value: json[p]
			});

			if (json[p]['@module'] && json[p]['@class']) {
				const moduleUrl = json[p]['@module'];
				const module = await import(`${moduleUrl}`);
				const cls = module[json[p]['@class']];

				delete json[p]['@module'];
				delete json[p]['@class'];

				const result = await Promise.all(
					Object.keys(json[p]).map(async id => await cls.fromJSON({ id: id, ...json[p][id] }, instance))
				);

				result.forEach(e => {
					Object.defineProperty(instance[p], e.id, {
						enumerable: true,
						value: e,
					});
				});
			}
			else {
				Object.keys(json[p]).forEach(id => {
					Object.defineProperty(instance[p], id, {
						enumerable:true,
						value: json[p][id]
					});
				});
			}
		}

		return instance;
	}

	static combine(assets) {

	}
}

export class UScene {
	
	engine;

	assets = {
		images: {},
		sprites: {},
		objects: {}
	};

	objects = [];

	constructor(id) {
		Object.defineProperty(this, 'id', {
			enumerable: true,
			value: id
		});
	}

	in(...args) {}
	out() {}
	update(delta, ...args) {
		this.objects.forEach(object => object.update(delta, ...args));
	}
	draw(context, ...args) {
		this.objects.forEach(object => object.draw(context, ...args));
	}

	static async load(sceneFile, asset={}) {
		const data = await fetch(`http://localhost:8000/${sceneFile}`);
		const json = await data.json();
		const scene = json['@class'] ? fromJSON(json, asset) : this.fromJSON(json, asset);

		return scene;
	}

	static async fromJSON(json, asset={}) {
		console.log(`dd!!`);
		console.log(asset);
		const scene = new this(json.id);

		// Object.keys(json.assets.images).forEach(imageId => {
		// 	const image = new UImage(imageId, json.assets.images[imageId]);
			
		// 	scene.assets.images[imageId] = image;
		// 	asset[imageId] = image;
		// });

		// Object.keys(json.assets.sprites).forEach(spriteId => {
		// 	const sheetId = json.assets.sprites[spriteId].sheet.substring(1);
		// 	const sheet = scene.assets.images[sheetId];
		// 	const sprite = new USprite(spriteId, sheet);

		// 	sprite.source = json.assets.sprites[spriteId].source;
		// 	sprite.anchor = json.assets.sprites[spriteId].anchor;
		// 	sprite.scale = json.assets.sprites[spriteId].scale;
			
		// 	scene.assets.sprites[spriteId] = sprite;
		// 	asset[spriteId] = sprite;
		// });

		// Object.keys(json.assets.objects).forEach(objectId => {
		// 	const object = GameObject.fromJSON(json.assets.objects[objectId], asset);

		// 	scene.assets.objects[objectId] = object;
		// 	asset[objectId] = object;
		// });

		scene.objects = await Promise.all(
			json.objects.map(async object => {
				if (object['@class']) {
					return await fromJSON(object, asset);
				}
				else {
					return await GameObject.fromJSON(object, asset);
				}
			})
		);

		return scene;
	}
};

export class UImage {

	#loaded = false;

	constructor(id, file) {
		Object.defineProperty(this, 'id', {
			enumerable: true,
			value: id,
		});

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

		this.raw.src = file;
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

	static fromJSON(json) {
		return new this(json.id, json.file);
	}
};

export class USprite {

	source = [0, 0, null, null];
	anchor = [0, 0];
	scale = [1, 1];

	constructor(id, sheet) {
		Object.defineProperty(this, 'id', {
			enumerable: true,
			value: id
		});

		Object.defineProperty(this, 'sheet', {
			value: sheet
		});
	}

	dispose() {
		Object.defineProperty(this, 'sheet', {
			value: null
		});
	}

	draw(context, x, y) {
		if (this.source[2] == 0 || this.source[3] == 0) {
			return;
		}

		if (this.sheet && this.sheet.loaded) {
			let [w, h] = [this.source[2] || this.sheet.width, this.source[3] || this.sheet.height];

			this.sheet.draw(context,
				this.source[0], this.source[1], w, h,
				x - w * this.anchor[0] * this.scale[0], y - h * this.anchor[1] * this.scale[1], w * this.scale[0], h * this.scale[1]);
		}
	}

	get width() {
		return this.source[2] || (this.source[2] == 0) ? 0 : this.sheet.width;
	}

	get height() {
		return this.source[3] || (this.source[3] == 0) ? 0 : this.sheet.height;
	}

	setSource(source) {
		this.source = source;

		return this;
	}

	setAnchor(anchor) {
		this.anchor = anchor;

		return this;
	}

	setScale(scale) {
		this.scale = scale;

		return this;
	}

	static async fromJSON(json, asset={}) {
		const instance = new this(json.id, await fromJSON(json.sheet, asset));

		instance.source = json.source;
		instance.anchor = json.anchor;
		instance.scale = json.scale;

		return instance;
	}
};

export class UObject extends Module() {
	constructor(name) {
		super();

		Object.defineProperty(this, 'disposed', {
			value: false
		});

		Object.defineProperty(this, 'parent', {
			value: null,
			writable: true
		});

		this.name = name;
		this.enable = true;
		this.tags = [];
		this.components = [];

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
		Object.defineProperty(this, 'disposed', {
			value: true
		});

		this.onDispose();
	}

	onCreate() {}
	onDispose() {}

	update(delta, ...args) {
		if (this.enable && !this.disposed) {
			this.onUpdate(delta, ...args);
			[...this.components].forEach((c) => c.update(delta, ...args));
		}

		this.components.filter((c) => c.disposed).forEach((c) => this.removeComponents(c));
	}
	onUpdate(delta, ...args) {}

	draw(context, ...args) {
		if (this.enable && !this.disposed) {
			this.onDraw(context, ...args);
			this.components.forEach((c) => c.draw(context, ...args));
		}
	}
	onDraw(context, ...args) {}

	static async fromJSON(json, asset) {
		let object = new this(json.name);

		object.enable = json.enable;
		object.tags = json.tags;
		object.addComponents(
			...(await fromJSON(json.components, asset))
		);

		return object;
	}
};

export class UState extends Module(UObject) {
	request(...args) {}

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

export class UContext extends Module(UObject) {
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

export class UGameObject extends Module(UObject) {
	constructor(name) {
		super(name);

		this.transform = {
			position: [0, 0],
			size: [0, 0],
		};

		this.anchor = [0, 0];
	}

	draw(context, ...args) {
		context.save();

		context.translate(...this.transform.position);

		this.onDraw(context, ...args);
		this.components.forEach((c) => c.draw(context, ...args));

		context.restore();
	}

	setPosition(position) {
		this.transform.position = position;

		return this;
	}

	setSize(size) {
		this.transform.size = size;

		return this;
	}

	setAnchor(anchor) {
		this.anchor = anchor;

		return this;
	}

	static async fromJSON(json, asset) {
		let gameObject = await super.fromJSON(json, asset);
		
		if (json.transform) {
			if (json.transform.position) {
				gameObject.transform.position = json.transform.position;
			}
			
			if (json.transform.size) {
				gameObject.transform.size = json.transform.size;
			}
		}

		if (json.anchor) {
			gameObject.anchor = anchor;
		}

		return gameObject;
	}
};

export { currentInput as Input, currentScene as Scene };