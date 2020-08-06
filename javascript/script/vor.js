import { UState, UScene, UObject, UGameObject, UCamera, Input, Scene, Asset, Camera, Screen, fromJSON } from '/script/uengine.js';
import * as Vector from '/script/util/vector.js';
import * as Module from '/script/util/module.js';
import * as Ray from '/script/util/ray.js';
import { Progress } from '/script/util/progress.js';
import Rectangle from './util/rect.js';

Module.set(import.meta.url);

const id = "vor";
export { id as default };



export class Arrangement extends Module.apply(UObject) {
	onUpdate(delta) {
		const temp = Scene.objects.slice();
		
		Scene.objects = Scene.objects.filter(e => e instanceof UGameObject && e.layers[this.layerType]);

		Scene.objects.sort((a, b) => {
			const al = this.layerOrder.indexOf(a.layers[this.layerType]);
			const bl = this.layerOrder.indexOf(b.layers[this.layerType]);
			
			if (al < bl) {
				return -1;
			}
			else if (al > bl) {
				return 1;
			}
			
			return a.transform.position[1] - b.transform.position[1];
		});

		temp.forEach((e, i) => {
			if (!(e instanceof UGameObject && e.layers[this.layerType])) {
				Scene.objects.splice(i, 0, e);
			}
		});
	}

	static async fromJSON(json) {
		const instance = await super.fromJSON(json);

		instance.layerType = json.layerType;
		instance.layerOrder = json.layerOrder;

		return instance;
	}
}

export class Map extends Module.apply(UGameObject) {
	constructor(name) {
		super(name);

		this.color = null;
	}

	onInit() {
		// for (let i = 0; i < 1; i++) {
		// 	const tree = Asset.get('@object/objects/tree-' + parseInt(Math.random() * 2)).clone();
			
		// 	tree.transform.position = [Math.random(), Math.random()].mulv(this.transform.size);
		// 	tree.init();
	
		// 	Scene.objects.push(tree);
		// }

		// for (let i = 0; i < 100; i++) {
		// 	const stone = Asset.get('@object/objects/stone').clone();

		// 	stone.transform.position = [Math.random(), Math.random()].mulv(this.transform.size);
		// 	stone.spriteRenderer.sprite.scale = [1, 1].muls(Math.random() * 0.05 + 0.01);
		// 	stone.init();

		// 	Scene.objects.push(stone);
		// }
	}

	onDraw(context) {
		if (this.color) {
			context.save();

			context.fillStyle = this.color;
			context.fillRect(0, 0, ...this.transform.size);
	
			context.restore();
		}
	}

	static async fromJSON(json, asset) {
		const map = await super.fromJSON(json, asset);

		if (json['color']) {
			map.color = json['color'];
		}

		return map;
	}
}

export class SpriteRenderer extends Module.apply(UObject) {
	
	sprite;

	clone() {
		const clone = super.clone();

		if (clone) {
			clone.sprite = this.sprite.clone();
		}

		return clone;
	}

	onInit() {
		this.anchor = this.parent.anchor;
	}

	onDraw(context) {
		this.sprite.draw(context, ...this.anchor);
	}

	setSprite(sprite) {
		this.sprite = sprite;

		return this;
	}

	getRect() {
		const position = this.parent.transform.position.subv(this.sprite.anchor.mulv(this.sprite.size));
		const size = this.sprite.size;

		return new Rectangle(...position, ...size);
	}

	static async fromJSON(json, asset) {
		const instance = await super.fromJSON(json, asset);

		instance.sprite = await fromJSON(json.sprite, asset);

		return instance;
	}
}

export class Inventory extends Module.apply(UObject) {

	#items = {};
	// capacity = 0;

	addItem(name, count) {
		if (!this.#items.hasOwnProperty(name)) {
			this.#items[name] = 0;
		}

		this.#items[name] += count;

		return this;
	}

	removeItem(name, count) {
		const index = this.#items.indexOf(name);

		if (index >= 0) {
			this.#items.splice(index, 1);
		}

		return this;
	}

	getCount(name) {
		return this.#items.hasOwnProperty(name) ? this.#items[name] : 0;
	}

	clear() {
		this.#items = {};
	}

	static async fromJSON(json, asset) {
		const inventory = await super.fromJSON(json, asset);

		// inventory.capacity = json['capacity'] || 0;

		return inventory;
	}
}

export class Stats extends Module.apply(UObject) {
	constructor(name) {
		super(name);

		this.hp = 0;
		this.maxhp = 0;
		this.mp = 0;
		this.ap = 0;
		this.dp = 0;
		this.speed = 1;

		this.sight = 10;
		this.attackRange = 10;
		this.probeRange = 10;

		this['@clone'] = ['hp', 'maxhp', 'mp', 'ap', 'dp', 'speed', 'sight', 'attackRange', 'probeRange'];
	}

	clone() {
		const clone = super.clone();

		for (const p of this['@clone']) {
			clone[p] = this[p];
		}

		return clone;
	}

	setStats(name, value) {
		this[name] = value;

		return this;
	}
	
	static async fromJSON(json) {
		const instance = await super.fromJSON(json);

		instance.hp = json['hp'] || 0;
		instance.maxhp = json['maxhp'] || 0;
		instance.mp = json['mp'] || 0;
		instance.ap = json['ap'] || 0;
		instance.dp = json['dp'] || 0;
		instance.speed = json['speed'] || 1;

		instance.sight = json['sight'] || 10;
		instance.attackRange = json['attackRange'] || 10;
		instance.probeRange = json['probeRange'] || 10;

		return instance;
	}
}

export class Moveable extends Module.apply(UObject) {
	constructor(name) {
		super(name);

		this.destination = null;
	}

	onUpdate(delta) {
		const object = this.parent;

		if (this.destination != null) {
			const pos = object.transform.position;
			const diff = this.destination.subv(pos);
			const sq = diff.dotv(diff);
			const speed = object.stats.speed * delta;

			if (speed ** 2 < sq) {
				object.transform.position = pos.addv(diff.muls(speed).divs(Math.sqrt(sq)));
			}
			else {
				object.transform.position = this.destination;
			}
		}
	}
}

export class HitArea extends Module.apply(UObject) {
	constructor(name) {
		super(name);

		this.areas = {};
	}
}


// Player
export class PlayerView extends Module.apply(UObject) {
	onInit() {
		this.cameraTf = Camera.transform;
		this.playerTf = this.parent.transform;

		this.size = this.cameraTf.size;
		this.scaleStep = 0;
	}

	onUpdate(delta) {
		this.cameraTf.position = this.playerTf.position.slice();

		console.log(Camera.getRect());
		const cameraRt = Camera.getRect();

		if (cameraRt.x < 0) {
			this.cameraTf.position[0] = 0;
		}
		else if (cameraRt.right > Scene.find('map')) {
			this.cameraTf.position[1] = 0;
		}

		const mouse = Input.mouse;

		if (mouse.wheel) {
			if (mouse.wheel[1] > 0) {
				this.scaleStep = Math.max(-5, this.scaleStep - 1);
			}
			else {
				this.scaleStep = Math.min(5, this.scaleStep + 1);
			}

			this.cameraTf.size = this.size.divs(Math.pow(1.3, this.scaleStep));
		}
	}
}

export class PlayerController extends Module.apply(UObject) {
	onInit() {
		this.state = this.parent.state;

		this.action = null;

		this.mouse = null;
		this.hover = null;
	}

	onUpdate(delta) {
		const mouse = Input.mouse;

		// if (Input.key.down('s')) {
		// 	this.action = 'stop';
		// }

		if (Input.key.down('m')) {
			this.action = null;
		}

		if (Input.key.down('a')) {
			this.action = 'attack';
		}

		if (Input.key.down('p')) {
			this.action = 'probe';
		}

		if (Input.key.down('Escape')) {
			this.action = null;
		}

		if (this.action == null) {
			if (mouse.down) {
				this.state.request({
					type: 'move',
					point: mouse.down.slice()
				});
			}
		}

		if (this.action == 'attack') {
			if (mouse.down) {
				this.state.request({
					type: 'attack',
					point: mouse.down.slice()
				});

				this.action = null;
			}
		}

		if (this.action == 'probe') {
			if (mouse.down) {
				this.state.request({
					type: 'probe',
					point: mouse.down.slice()
				});

				this.action = null;
			}
		}

		if (mouse.move) {
			this.mouse = mouse.move;
		}

		if (this.mouse) {
			const screenPoint = this.mouse;
			const worldPoint = Camera.screenToWorld(screenPoint);

			const candidates = Scene.objects.filter(object => object instanceof UGameObject && object.spriteRenderer).reverse();

			this.hover = null;

			for (const candidate of candidates) {
				if (!candidate.layers.collision) {
					continue;
				}

				const spriteArea = candidate.spriteRenderer.getRect();

				if (spriteArea.contains(worldPoint)) {
					this.hover = spriteArea;
					break;
				}
			}
		}
	}

	onDraw(context) {
		context.save();

		context.strokeStyle = 'white';

		if (this.hover) {
			context.strokeRect(...this.hover.position.subv(this.parent.transform.position), ...this.hover.size);
		}

		if (this.action) {
			const screen = Screen.context;

			screen.save();

			screen.font = '18px Arial';
			screen.fillStyle = 'white';
			screen.fillText(this.action, 20, 90);

			screen.restore();
		}

		context.restore();
	}
}

export class PlayerStateIdle extends Module.apply(UState) {
	request(message) {
		if (message) {
			if (message.type == 'move') {
				const sp = message.point;
				const wp = Camera.screenToWorld(sp);
				const candidates = Scene.objects.filter(object => object instanceof UGameObject && object.spriteRenderer).reverse();

				let target = wp;

				for (const candidate of candidates) {
					if (candidate == this.parent.parent) {
						continue;
					}

					if (!candidate.layers.collision) {
						continue;
					}

					if (candidate.spriteRenderer.getRect().contains(wp)) {
						target = candidate;
						break;
					}
				}
				
				this.transit('move', [target]);
			}
			else if (message.type == 'probe') {
				const sp = message.point;
				const wp = Camera.screenToWorld(sp);
				const candidates = Scene.objects.filter(object => object instanceof UGameObject && object.spriteRenderer).reverse();

				let target = wp;

				for (const candidate of candidates) {
					if (candidate == this.parent.parent) {
						continue;
					}

					if (!candidate.layers.collision) {
						continue;
					}

					if (candidate.spriteRenderer.getRect().contains(wp)) {
						target = candidate;
						break;
					}
				}
				
				this.transit('probe', [target]);
			}
		}
		else {
			throw 'message is null';
		}
	}
}

export class PlayerStateMove extends Module.apply(UState) {
	request(message) {
		if (message) {
			if (message.type == 'move') {
				const sp = message.point;
				// point: message.point -> position in map || object in map
				// 1. point in screen to position in map(Camera)
				const wp = Camera.screenToWorld(sp);
				
				// 2. target: find object containing the position in Scene.objects
				const candidates = Scene.objects.filter(object => object instanceof UGameObject && object.spriteRenderer).reverse();

				let target = wp;

				for (const candidate of candidates) {
					if (candidate == this.parent.parent) {
						continue;
					}

					if (!candidate.layers.collision) {
						continue;
					}

					if (candidate.spriteRenderer.getRect().contains(wp)) {
						target = candidate;
						break;
					}
				}
				
				// 3. else location: position
				this.transit('move', [target]);
			}

			if (message.type == 'attack') {

			}
		}
		else {
			throw 'message is null';
		}
	}

	onInit() {
		this.object = this.parent.parent;
	}

	onEnter(target) {
		this.target = target;
	}

	onExit() {
		this.target = null;
	}

	onUpdate(delta) {
		if (this.target == null) {
			return;
		}

		const isLocation = this.target instanceof Array;
		const targetPosition = isLocation ? this.target : this.target.transform.position.slice();
		const objectPosition = this.object.transform.position.slice();
		const diff = targetPosition.subv(objectPosition);
		const sq = diff.dotv(diff);
		const speed = this.object.stats.speed * delta;

		if (sq > speed ** 2) {
			// move
			if (isLocation || sq > this.object.transform.size[0] ** 2) {
				// this.object.transform.position = objectPosition.addv(diff.muls(speed).divs(Math.sqrt(sq)));

				const magnitude = Math.sqrt(sq);

				const start = objectPosition;
				const end = start.addv(diff.muls(speed).divs(magnitude));

				const position = end.slice();

				// version 1
				const rays = [];

				const anchor = this.object.anchor;
				const size = this.object.transform.size;
				const adjust = size.mulv([0.5, 0.5].subv(anchor));

				Scene.findAll('#block', true).forEach(block => {
					const rayResult = Ray.Boxcast(size, start.addv(adjust), end.addv(adjust), block.getRect());

					if (rayResult.hit) {
						rayResult.point = rayResult.point.subv(adjust);
						rays.push(rayResult);
					}
				});

				const minRay = [null, null];
				rays.filter(ray => ray.normal[0] != 0).forEach(ray => {
					if (minRay[0] == null || minRay[0].distance > ray.distance) {
						minRay[0] = ray;
						position[0] = ray.point[0];
					}
				});

				rays.filter(ray => ray.normal[1] != 0).forEach(ray => {
					if (minRay[1] == null || minRay[1].distance > ray.distance) {
						minRay[1] = ray;
						position[1] = ray.point[1];
					}
				});

				this.object.transform.position.setv(position);
			}
		}
		else {
			// reached
			this.object.transform.position = targetPosition;

			if (isLocation) {
				this.transit('idle');
			}
		}
	}

	onDraw(context) {
		context.save();

		context.strokeStyle = 'white';

		const position = this.target instanceof Array ? this.target.subv(this.object.transform.position) : this.target.transform.position.subv(this.object.transform.position);
		
		context.strokeRect(...position.subv([2, 2]), ...[4, 4])

		context.restore();
	}
}

export class PlayerStateProbe extends Module.apply(UState) {
	request(message) {
		if (message) {
			if (message.type == '') {

			}
		}
	}

	onInit() {
		this.object = this.parent.parent;

		this.progress = new Progress(0, 1, 1, 0);
	}

	onEnter(target) {
		this.target = target;

		this.progress.value = this.progress.begin;
	}

	onExit() {
		this.target = null;

		this.progress.value = this.progress.begin;
	}

	onUpdate(delta) {
		if (this.target) {
			const isLocation = this.target instanceof Array;

			const targetPosition = isLocation ? this.target : this.target.transform.position.slice();
			const objectPosition = this.object.transform.position.slice();
			const diff = targetPosition.subv(objectPosition);
			const sq = diff.dotv(diff);
			const speed = this.object.stats.speed * delta;

			if (sq > speed ** 2) {
				// move
				if (isLocation || sq > this.object.transform.size[0] ** 2) {
					const magnitude = Math.sqrt(sq);

					const start = objectPosition;
					const end = start.addv(diff.muls(speed).divs(magnitude));

					const position = end.slice();

					// version 1
					const rays = [];

					const anchor = this.object.anchor;
					const size = this.object.transform.size;
					const adjust = size.mulv([0.5, 0.5].subv(anchor));

					Scene.findAll('#block', true).forEach(block => {
						const rayResult = Ray.Boxcast(size, start.addv(adjust), end.addv(adjust), block.getRect());

						if (rayResult.hit) {
							rayResult.point = rayResult.point.subv(adjust);
							rays.push(rayResult);
						}
					});

					const minRay = [null, null];
					rays.filter(ray => ray.normal[0] != 0).forEach(ray => {
						if (minRay[0] == null || minRay[0].distance > ray.distance) {
							minRay[0] = ray;
							position[0] = ray.point[0];
						}
					});

					rays.filter(ray => ray.normal[1] != 0).forEach(ray => {
						if (minRay[1] == null || minRay[1].distance > ray.distance) {
							minRay[1] = ray;
							position[1] = ray.point[1];
						}
					});

					this.object.transform.position.setv(position);
				}
			}
			else {
				// reached
				this.object.transform.position = targetPosition;

				this.target = null;
			}
		}
		else {
			this.progress.update(delta);

			if (this.progress.isFull) {
				const count = parseInt(Math.random() * 3);

				if (count > 0) {
					this.object.inventory.addItem('stone', count);
				
					const log = Scene.find('log');

					log.log(`${'stone'}을(를) ${count}개 획득하였습니다.`, 'white');
				}
				

				this.transit('idle');
			}
		}
	}

	onDraw(context) {
		if (this.target == null) {
			context.save();

			context.fillStyle = 'black';
			context.fillRect(-52, 18, 104, 20);

			context.fillStyle = 'orange';
			context.fillRect(-50, 20, this.progress.rate * 100, 16);

			context.restore();
		}
	}
}


// Character
export class RandomCharacterGenerator extends Module.apply(UObject) {
	onInit() {
		this.map = Scene.find('map', true);
		this.count = 0;
	}

	onUpdate(delta) {
		if (Math.random() < 0.01 && this.count < 1) {
			const character = Asset.get('@object/objects/squirrel').clone();

			character.transform.position = [Math.random(), Math.random()].mulv(this.map.transform.size);

			character.init();

			Scene.objects.push(character);
			this.count += 1;
		}
	}
}

export class Character extends Module.apply(UGameObject) {
	// constructor(name) {
	// 	super(name);

	// 	this.tall = 0;
	// 	this.fat = 0;
	// 	this.age = 0;
	// 	this.speed = 10;
	// }

	onUpdate(delta) {
		// this.age += this.speed * delta;

		// this.tall += this.speed * delta * 0.05;
		// this.fat += this.speed * delta * 0.02;

		// if (this.age > 100) {
		// 	console.log('dead');
		// 	this.dispose();
		// }
	}

	onDraw(context) {
		// super.onDraw(context);

		// context.save();

		// context.strokeStyle = `rgb(255, ${255 - this.age / 100 * 255}, ${255 - this.age / 100 * 255})`;
		// context.strokeRect(-this.fat / 2, -this.tall, this.fat, this.tall);

		// context.restore();
	}

	static async fromJSON(json, asset) {
		const character = await super.fromJSON(json, asset);

		// character.tall = json.tall;
		// character.fat = json.fat;

		return character;
	}
}

export class AI extends Module.apply(UObject) {
	constructor(name) {
		super(name);

		this.state = 'idle';

		this.aggressive = 0; // probability
		this.aggressiveImage = null;

		this.attackProgress = new Progress(0, 1, 1, 1, { begin: false, end: false });

		this.target = null;
	}

	clone() {
		const clone = super.clone();

		clone.state = this.state;

		clone.aggressive = this.aggressive;
		clone.aggressiveImage = this.aggressiveImage;

		clone.attackProgress = this.attackProgress.clone();
		
		clone.target = this.target == null ? null : this.target.slice();

		return clone;
	}

	onInit() {
		this.map = Scene.find('map');
	}

	onUpdate(delta) {
		if (this.state == 'idle') {
			const players = Scene.findAll('#player', true);
			
			if (players) {
				for (const object of players) {
					if (object == this.parent) {
						continue;
					}
	
					const diff = object.transform.position.subv(this.parent.transform.position);
	
					if (diff.dotv(diff) <= this.parent.stats.sight ** 2 && this.target == null) {
						let prob = Math.random();
	
						if (Math.abs(this.aggressive) > prob) {
							this.target = object;
							this.parent.moveable.destination = object.transform.position;
							this.parent.spriteRenderer.sprite = Asset.get('@object/sprites/squirrel-move');

							this.state = this.aggressive < 0 ? 'aggressive' : 'follow';
	
							// console.log('idle ->' + this.state);
						}
					}
				}
			}

			let prob = Math.random();

			if (prob < 0.01) {
				// console.log('idle -> explore')
				this.parent.moveable.destination = [Math.random(), Math.random()].mulv(this.map.transform.size);
				this.parent.spriteRenderer.sprite = Asset.get('@object/sprites/squirrel-move');

				this.state = 'explore';
			}
		}
		else if (this.state == 'explore') {
			let prob = Math.random();

			if (prob < 0.01) {
				// console.log('exp -> idle')
				this.parent.moveable.destination = null;
				this.parent.spriteRenderer.sprite = Asset.get('@object/sprites/squirrel-idle');
				this.state = 'idle';
			}
		}
		else if (this.state == 'aggressive') {
			const diff = this.target.transform.position.subv(this.parent.transform.position);
			const sq = diff.dotv(diff);

			this.attackProgress.update(delta);

			if (this.parent.stats.sight ** 2 < sq) {
				// console.log('aggressive -> idle')
				this.target = null;
				this.parent.moveable.destination = null;
				this.attackProgress.value = 0;
				this.parent.spriteRenderer.sprite = Asset.get('@object/sprites/squirrel-idle');
				this.state = 'idle';
			}
			else if (this.parent.stats.attackRange ** 2 >= sq) {
				if (this.target.stats) {
					if (this.attackProgress.isFull) {
						// console.log('attack!')
						this.target.stats.hp -= this.parent.stats.ap - this.target.stats.dp;
						this.attackProgress.value = 0;
					}
				}

				this.parent.moveable.destination = null;
			}
			else {
				this.parent.moveable.destination = this.target.transform.position;
			}
		}
		else if (this.state == 'follow') {
			let diff = this.target.transform.position.subv(this.parent.transform.position);
			let sq = diff.dotv(diff);

			if (this.sight ** 2 < sq) {
				// console.log('follow -> idle')
				this.target = null;
				this.parent.moveable.destination = null;
				this.parent.spriteRenderer.sprite = Asset.get('@object/sprites/squirrel-idle');
				this.state = 'idle'
			}
			else if (this.parent.transform.size[0] ** 2 >= sq) {
				this.parent.moveable.destination = null;
			}
			else {
				const prob = Math.random();
				
				if (prob < 0.005) {
					this.target = null;
					this.parent.spriteRenderer.sprite = Asset.get('@object/sprites/squirrel-idle');
					this.parent.moveable.destination = null;
					this.state = 'idle';
				}
				else {
					this.parent.moveable.destination = this.target.transform.position;
				}
			}
		}
	}

	onDraw(context) {
		if (true) {
			context.save();

			context.fillStyle = 'rgba(0, 0, 255, 0.2)';

			context.beginPath();
			context.arc(0, 0, this.parent.stats.sight, 0, 2 * Math.PI);
			context.fill();

			context.fillStyle = 'rgba(0, 255, 0, 0.2)';

			context.beginPath();
			context.arc(0, 0, this.parent.stats.attackRange, 0, 2 * Math.PI);
			context.fill();

			context.restore();
		}

		if (this.state == 'aggressive') {
			if (this.aggressiveImage) {
				this.aggressiveImage.draw(context, -20, -this.parent.transform.size[1] / 2 - 40, 40, 20);
			}
		}
	}

	static async fromJSON(json, asset) {
		const ai = await super.fromJSON(json, asset);

		ai.state = json['state'] || 'idle';
		ai.aggressive = json['aggressive'] || 0;

		if (json['aggressiveImage']) {
			ai.aggressiveImage = asset.get(json['aggressiveImage']);
		}

		if (json['attackProgress']) {
			ai.attackProgress = await fromJSON(json['attackProgress']);
		}

		ai.target = null;

		return ai;
	}
}


// UI
export class UI extends Module.apply(UObject) {
	constructor(name) {
		super(name);
	}

	onInit() {
		this.player = Scene.find('player'); // user.player.name�� ã��
	}

	onDraw(context) {
		const screen = Screen.context;

		screen.save();

		screen.fillStyle = 'black';
		screen.fillRect(18, 18, 204, 24);

		screen.fillStyle = 'red';
		screen.fillRect(20, 20, (this.player.stats.hp / this.player.stats.maxhp) * 200, 20);

		screen.fillStyle = 'white';
		screen.font = '18px Arial';
		screen.textBaseline = 'middle';
		screen.fillText(this.player.stats.hp, 22, 31);

		screen.restore();
	}
}

export class Log extends Module.apply(UObject) {
	constructor(name) {
		super(name);

		this.logs = [];
		this.capacity = 10;
		this.showCount = 5;

		this.position = [0, 0];
		this.size = [0, 0];
		this.color = 'white';
	}

	onInit() {
		this.player = Scene.find('player');
	}

	onDraw(context) {
		const screen = Screen.context;

		screen.save();

		screen.fillStyle = this.color;
		screen.fillRect(...this.position, ...this.size);

		screen.font = '16px serif';
		screen.textBaseline = 'top';

		for (let i = 0; i < Math.min(this.logs.length, this.showCount); i++) {
			screen.fillStyle = this.logs[this.logs.length - 1 - i].color;
			screen.fillText(this.logs[this.logs.length - 1 - i].message, this.position[0] + 4, this.position[1] + i * 20 + 4);
		}

		screen.restore();
	}

	log(message, color='black') {
		this.logs.push({
			message: message,
			color: color
		});

		if (this.logs.length > this.capacity) {
			this.logs.shift();
		}

		return this;
	}

	static async fromJSON(json, asset) {
		const log = await super.fromJSON(json, asset);

		log.capacity = log['capacity'] || 10;
		log.position = json['position'] || [0, 0];
		log.size = json['size'] || [0, 0];
		log.color = json['color'] || 'white';

		return log;
	}
}
