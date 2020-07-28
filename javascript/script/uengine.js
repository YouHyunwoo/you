import Rectangle from './util/rect.js';
import * as Module from '/script/util/module.js';

Module.set(import.meta.url);



let currentInput = null;
let currentScene = null;
let currentAsset = null;
let currentCamera = null;
let currentScreen = {
	width: 0,
	height: 0
};

export async function fromJSON (json, asset={}) {
	if (json[0] == '@') {
		return json.substring(1).split('/').reduce((acc, cur) => acc[cur], asset);
	}
	else if (json instanceof Array) {
		return await Promise.all(json.map(async (d) => await fromJSON(d, asset)));
	}
	else if (json instanceof Object) {
		if (json.hasOwnProperty('@class')) {
			const moduleUrl = json['@module'];
			const module = await import(moduleUrl);
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

	static addListeners(...engines) {
		for (const engine of engines) {
			this.#listeners.push(engine);
		}
	}

	static removeListeners(...engines) {
		for (const engine of engines) {
			let index = this.#listeners.indexOf(engine);

			if (index >= 0) {
				this.#listeners.splice(index, 1);
			}
		}
	}

	static init() {
		this.#handler = window.requestAFrame(() => this.loop(Date.now()));
	}

	static quit() {
		window.cancelAFrame(this.#handler);

		this.#listeners.clear();
	}

	static loop(timeLast) {
		const timeNow = Date.now();

		const delta = (timeNow - timeLast) / 1000;

		this.#listeners.forEach(listener => {
			currentInput = listener.input;
			currentAsset = listener.asset;
			currentScene = listener.scene.get();
			currentCamera = listener.scene.camera;
			
			listener.loop(delta);
		});

		this.#handler = window.requestAFrame(() => this.loop(timeNow));
	}

	constructor(canvasId) {
		this.canvas = document.getElementById(canvasId);
		this.context = this.canvas.getContext("2d");

		this.resizeHandler = () => {
			let size = Math.min(window.innerWidth, window.innerHeight) - 10;

			currentScreen.width = currentScreen.height = size;
			this.canvas.width = this.canvas.height = size;
			this.canvas.style.left = Math.floor((window.innerWidth - this.canvas.width) / 2) + "px";
			this.canvas.style.top = Math.floor((window.innerHeight - this.canvas.height) / 2) + "px";

			this.context.imageSmoothingEnabled = false;
		}

		window.addEventListener('resize', this.resizeHandler);

		this.resizeHandler();
		

		this.input = new Input(canvasId);
		this.asset = null;
		this.scene = new Scene(this);
	}

	run(app) {
		Object.defineProperty(this, 'app', {
			enumerable: true,
			value: app
		});

		currentInput = this.input;
		currentAsset = app.assets;
		currentScene = app.entry;
		currentCamera = this.scene.camera;

		this.asset = app.assets;
		this.scene.init(app.entry);
		this.input.addEventListeners();

		Engine.addListeners(this);
	}

	stop() {
		Engine.removeListeners(this);

		this.input.removeEventListeners();
		this.scene.clear();
		this.asset = null;

		Object.defineProperty(this, 'app', {
			enumerable: true,
			value: null
		});
	}

	loop(delta) {
		if (!this.scene) {
			return;
		}

		this.input.update();
		this.scene.update(delta);

		this.context.save();
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		// console.log("clear: " + this.canvas.width);

		this.scene.draw(this.context);
		
		this.context.restore();
	}
}

export class Application {

	constructor(id, assets, scenes, entry) {
		Object.defineProperty(this, 'id', {
			enumerable: true,
			value: id
		});

		Object.defineProperty(this, 'assets', {
			enumerable: true,
			value: assets
		});

		Object.defineProperty(this, 'scenes', {
			enumerable: true,
			value: scenes
		});

		Object.defineProperty(this, 'entry', {
			enumerable: true,
			value: entry
		});
	}

	static async load(appId) {
		const data = await fetch(`/app/${appId}/app.json`);
		const json = await data.json();
		const application = this.fromJSON(json)
		
		return application;
	}

	static async fromJSON(json) {
		let assets = await Promise.all(
			json.assets.map(async asset => await Asset.load(`app/${json.id}/asset/${asset}.json`))
		);

		assets = assets.reduce((acc, cur, idx) => { acc[json.assets[idx]] = cur; return acc; }, new Asset());

		const scenes = await Promise.all(
			json.scenes.map(async scene => await UScene.load(`app/${json.id}/scene/${scene}.json`, assets))
		);

		const entryIndex = json.scenes.indexOf(json.entry);

		const app = new this(json.id, assets, scenes, scenes[entryIndex]);

		return app;
	}
}

class Asset {
	get(reference) {
		return reference.substring(1).split('/').reduce((acc, cur) => acc[cur], this)
	}

	static async load(assetFile) {
		const data = await fetch(`/${assetFile}`);
		const json = await data.json();
		const asset = this.fromJSON(json);

		return asset;
	}

	static async fromJSON(json) {
		const asset = new this();

		for (const p in json) {
			Object.defineProperty(asset, p, {
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
					Object.keys(json[p]).map(async id => await cls.fromJSON({ id: id, ...json[p][id] }, asset))
				);

				result.forEach(e => {
					Object.defineProperty(asset[p], e.id, {
						enumerable: true,
						value: e,
					});
				});
			}
			else {
				Object.keys(json[p]).forEach(id => {
					Object.defineProperty(asset[p], id, {
						enumerable:true,
						value: json[p][id]
					});
				});
			}
		}

		return asset;
	}
}

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
		scene.enter(...args);
		this.#scenes.unshift(scene);
	}

	pop() {
		if (this.#scenes.length > 0) {
			let scene = this.#scenes.shift();
			scene.exit();
			scene.engine = null;
		}
	}

	get() {
		return this.#scenes[0];
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
}

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
			position: null,
			down: null,
			move: null,
			up: null,
			wheel: null,
		};

		this.mouse = {
			position: null,
			down: null,
			move: null,
			up: null,
			wheel: null,
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

			this.#tmouse.position = [e.offsetX, e.offsetY];
			this.#tmouse.down = [e.offsetX, e.offsetY];
		});

		this.canvas.addEventListener('pointermove', (e) => {
			this.#tmouse.position = [e.offsetX, e.offsetY];
			this.#tmouse.move = [e.offsetX, e.offsetY];
		});

		this.canvas.addEventListener('pointerup', (e) => {
			e.target.releasePointerCapture(e.pointerId);

			this.#tmouse.position = [e.offsetX, e.offsetY];
			this.#tmouse.up = [e.offsetX, e.offsetY];
		});

		this.canvas.addEventListener('wheel', (e) => {
			this.#tmouse.position = [e.offsetX, e.offsetY];
			this.#tmouse.wheel = [e.deltaX, e.deltaY, e.deltaZ];
		});
	}
	
	removeEventListeners() {
		window.removeEventListener('keydown');
		window.removeEventListener('keyup');
		this.canvas.removeEventListener('pointerdown');
		this.canvas.removeEventListener('pointermove');
		this.canvas.removeEventListener('pointerup');
		this.canvas.removeEventListener('wheel');
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

		this.mouse.position = this.#tmouse.position;
		this.#tmouse.position = null;

		this.mouse.down = this.#tmouse.down;
		this.#tmouse.down = null;

		this.mouse.move = this.#tmouse.move;
		this.#tmouse.move = null;

		this.mouse.up = this.#tmouse.up;
		this.#tmouse.up = null;

		this.mouse.wheel = this.#tmouse.wheel;
		this.#tmouse.wheel = null;
	}

	clear() {
		this.#tkey.down.clear();
		this.#tkey.up.clear();
		this.#key.down.clear();
		this.#key.press.clear();
		this.#key.up.clear();
		this.#tmouse.position = null;
		this.#tmouse.down = null;
		this.#tmouse.move = null;
		this.#tmouse.up = null;
		this.#tmouse.wheel = null;
		this.mouse.position = null;
		this.mouse.down = null;
		this.mouse.move = null;
		this.mouse.up = null;
		this.mouse.wheel = null;
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

	camera;

	constructor(id) {
		Object.defineProperty(this, 'id', {
			enumerable: true,
			value: id
		});
	}

	find(expression, recursively=false) {
		const [name, ...tags] = expression.split('#');

		function match(self, name, tags) {
			if (!name || self.name == null || self.name == name) {
				for (const tag of tags) {
					if (!self.tags.includes(tag)) {
						return null;
					}
				}

				return self;
			}

			if (recursively) {
				for (const c of self.components) {
					const result = match(c, name, tags);
					
					if (result != null) {
						return result;
					}
				}
			}

			return null;
		}

		for (const o of this.objects) {
			const result = match(o, name, tags);
			
			if (result != null) {
				return result;
			}
		}

		return null;
	}

	findAll(expression, recursively=false) {
		const [name, ...tags] = expression.split('#');
		
		function matchAll(self, name, tags, result) {
			if (!name || self.name == null || self.name == name) {
				for (const tag of tags) {
					if (self.tags.includes(tag)) {
						result.push(self);
						return;
					}
				}
			}

			if (recursively) {
				for (const c of self.components) {
					matchAll(c, name, tags, result);
				}
			}
		}

		const result = [];

		for (const o of this.objects) {
			matchAll(o, name, tags, result);
		}

		return result;
	}

	enter() {
		this.objects.forEach((object) => object.init());
	}
	exit() {
		this.objects.forEach((object) => object.dispose());
	}
	update(delta, ...args) {
		this.objects.forEach(object => object.update(delta, ...args));
	}
	draw(context, ...args) {
		if (this.camera) {
			context.save();

			const camera = this.camera;
			const size = camera.transform.size[0] > 0 && camera.transform.size[0] > 0
				? camera.transform.size
				: [this.engine.canvas.width, this.engine.canvas.height];

			const scale = [
				this.engine.canvas.width / size[0],
				this.engine.canvas.height / size[1]
			];

			if (scale[0] != 1 || scale[1] != 1) {
				context.scale(scale[0], scale[1]);
			}

			context.translate(
				-camera.transform.position[0] + size[0] * camera.anchor[0],
				-camera.transform.position[1] + size[1] * camera.anchor[1]
			);
		}
		
		this.objects.forEach(object => object.draw(context, ...args));

		if (this.camera) {
			context.restore();
		}
	}

	static async load(sceneFile, asset={}) {
		const data = await fetch(`/${sceneFile}`);
		const json = await data.json();
		const scene = json['@class'] ? fromJSON(json, asset) : this.fromJSON(json, asset);

		return scene;
	}

	static async fromJSON(json, asset={}) {
		const scene = new this(json.id);

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

		for (const o of scene.objects) {
			if (o instanceof UCamera) {
				scene.camera = o;
				break;
			}
		}

		return scene;
	}
}

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
}

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
			let size = [this.source[2] || this.sheet.width, this.source[3] || this.sheet.height];

			this.sheet.draw(context, ...this.source.slice(0, 2), ...size, ...[x, y].subv(size.mulv(this.anchor).mulv(this.scale)), ...size.mulv(this.scale))
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
}

export class UObject extends Module.apply() {
	constructor(name) {
		super();

		Object.defineProperty(this, 'disposed', {
			configurable: true,
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

	set(data) {
		for (const prop in data) {
			this[prop] = data[prop];
		}

		return this;
	}

	set order(value) {
		if (this.parent) {
			const comps = this.parent.components;

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

	hasTags(...tags) {
		return tags.every(tag => this.tags.includes(tag));
	}

	init() {
		this.onInit();

		this.components.forEach(component => component.init());

		this.onPostInit();
	}

	dispose() {
		Object.defineProperty(this, 'disposed', {
			value: true
		});

		this.onPreDispose();

		this.components.forEach(component => component.dispose());

		this.onDispose();
	}

	update(delta, ...args) {
		if (this.enable && !this.disposed) {
			this.onUpdate(delta, ...args);

			[...this.components].forEach(component => component.update(delta, ...args));
		}

		this.components
			.filter(component => component.disposed)
			.forEach(component => {
				component.onDelete();
				this.removeComponents(component);
			});
	}

	draw(context, ...args) {
		if (this.enable && !this.disposed) {
			this.onDraw(context, ...args);
			
			this.components.forEach((c) => c.draw(context, ...args));
		}
	}
	
	onCreate() {}
	onDelete() {}

	onInit() {}
	onPostInit() {}
	onPreDispose() {}
	onDispose() {}

	onUpdate(delta, ...args) {}
	onDraw(context, ...args) {}

	onAdded(parent) {}
	onRemoved(parent) {}

	static async fromJSON(json, asset) {
		let object = new this(json['name'] == undefined ? '' : json.name);

		object.enable = json['enable'] == undefined ? true : json.enable;
		object.tags = json['tags'] == undefined ? [] : json.tags;
		object.addComponents(
			...(await fromJSON(json['components'] == undefined ? [] : json.components, asset))
		);

		return object;
	}
}

export class UState extends Module.apply(UObject) {
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
}

export class UContext extends Module.apply(UObject) {
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
}

export class UGameObject extends Module.apply(UObject) {
	constructor(name) {
		super(name);

		this.layers = {};

		this.transform = {
			position: [0, 0],
			size: [0, 0],
		};

		this.anchor = [0, 0];
	}

	draw(context, ...args) {
		if (this.enable && !this.disposed) {
			context.save();

			context.translate(...this.transform.position);

			this.onDraw(context, ...args);

			this.components.forEach(component => component.draw(context, ...args));

			context.restore();
		}
	}

	onDraw(context) {
		context.save();

		context.strokeStyle = 'blue';
		context.strokeRect(...this.transform.size.mulv(this.anchor).muls(-1), ...this.transform.size);
		
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

	getRect() {
		return new Rectangle(...this.transform.position.subv(this.transform.size.mulv(this.anchor)), ...this.transform.size);
	}

	static async fromJSON(json, asset) {
		let gameObject = await super.fromJSON(json, asset);
		
		if (json.layers) {
			gameObject.layers = json.layers;
		}

		if (json.transform) {
			if (json.transform.position) {
				gameObject.transform.position = json.transform.position;
			}
			
			if (json.transform.size) {
				gameObject.transform.size = json.transform.size;
			}
		}

		if (json.anchor) {
			gameObject.anchor = json.anchor;
		}

		return gameObject;
	}
}

export class UCamera extends UGameObject {
	onDraw(context) {}
}

export { currentInput as Input, currentScene as Scene, currentAsset as Asset, currentCamera as Camera, currentScreen as Screen };