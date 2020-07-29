import { UScene, UObject, UGameObject, UCamera, Input, Scene, Asset, Camera, Screen, fromJSON } from '/script/uengine.js';
import * as Vector from '/script/util/vector.js';
import * as Module from '/script/util/module.js';
import * as Ray from '/script/util/ray.js';
import { Progress } from '/script/util/progress.js';

Module.set(import.meta.url);

const id = "game-rpg";
export { id as default };



// Scene: title
export class TitleScene extends Module.apply(UScene) {
	
}

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
	onInit() {
		for (let i = 0; i < 20; i++) {
			const tree = Asset.get('@asset-example/objects/tree-' + parseInt(Math.random() * 2)).clone();
			
			tree.transform.position = [Math.random(), Math.random()].mulv(this.transform.size);
			tree.init();
	
			Scene.objects.push(tree);
		}

		for (let i = 0; i < 100; i++) {
			const stone = Asset.get('@asset-example/objects/stone').clone();

			stone.transform.position = [Math.random(), Math.random()].mulv(this.transform.size);
			stone.spriteRenderer.sprite.scale = [1, 1].muls(Math.random() * 0.05 + 0.01);
			stone.init();

			Scene.objects.push(stone);
		}
	}

	onDraw(context) {
		context.save();

		context.fillStyle = 'rgb(100, 50, 10)';
		context.fillRect(0, 0, ...this.transform.size);

		context.restore();
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

	static async fromJSON(json, asset) {
		const instance = await super.fromJSON(json, asset);

		instance.sprite = await fromJSON(json.sprite, asset);

		return instance;
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

export class PlayerMove extends Module.apply(UObject) {
	onUpdate(delta) {
		const velocity = [0, 0];

		if (Input.key.press('a')) {
			velocity[0] = -1;
		}

		if (Input.key.press('d')) {
			velocity[0] = 1;
		}

		if (Input.key.press('s')) {
			velocity[1] = 1;
		}

		if (Input.key.press('w')) {
			velocity[1] = -1;
		}

		const magnitude = velocity.magnitude;

		if (magnitude > 0) {
			const speed = this.parent.stats.speed * delta;

			const start = this.parent.transform.position.slice();
			const end = start.addv(velocity.muls(speed).divs(magnitude));

			const position = end.slice();

			// version 1
			const rays = [];

			const anchor = this.parent.anchor;
			const size = this.parent.transform.size;
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

			this.parent.transform.position.setv(position);
		}
	}
}

export class PlayerView extends Module.apply(UObject) {
	onInit() {
		this.cameraTf = Camera.transform;
		this.playerTf = this.parent.transform;

		this.size = this.cameraTf.size;
		this.scaleStep = 0;
	}

	onUpdate(delta) {
		this.cameraTf.position = this.playerTf.position.slice();

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

export class PlayerProbe extends Module.apply(UObject) {
	onUpdate(delta) {

	}
}

// Monsters
export class RandomCharacterGenerator extends Module.apply(UObject) {
	onInit() {
		this.map = Scene.find('map', true);
		this.count = 0;
	}

	onUpdate(delta) {
		if (Math.random() < 0.01 && this.count < 1) {
			const character = Asset.get('@asset-example/objects/squirrel').clone();
			// const character = new Character('character');

			// character.layers['collision'] = 'field';
			// character.tags = ['block']
			character.transform.position = [Math.random(), Math.random()].mulv(this.map.transform.size);
			// character.transform.size = [50, 35];
			// character.anchor = [0.5, 0.5];

			character.tall = Math.random() * 20 + 40;
			character.fat = Math.random() * 20 + 20;

			// character.addComponents(
			// 	new Moveable('moveable'),
			// 	new Stats('stats')
			// 		.set({
			// 			hp: 3,
			// 			maxhp: 3,
			// 			ap: 1,
			// 			sight: 100,
			// 			speed: 100,
			// 		}),
			// 	new SpriteRenderer('sprite renderer')
			// 		.setSprite(Asset.get('@asset-example/sprites/sprite-squirrel-idle')),
			// 	new AI('ai')
			// 		.set({
			// 			aggressive: -0.3
			// 		})
			// );

			character.init();

			Scene.objects.push(character);
			this.count += 1;

			console.log('new character');
			console.log(character);
		}
	}
}

export class Character extends Module.apply(UGameObject) {
	constructor(name) {
		super(name);

		this.tall = 0;
		this.fat = 0;
		this.age = 0;
		this.speed = 10;
	}

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
		super.onDraw(context);

		context.save();

		context.strokeStyle = `rgb(255, ${255 - this.age / 100 * 255}, ${255 - this.age / 100 * 255})`;
		context.strokeRect(-this.fat / 2, -this.tall, this.fat, this.tall);

		context.restore();
	}

	static async fromJSON(json, asset) {
		const character = await super.fromJSON(json, asset);

		character.tall = json.tall;
		character.fat = json.fat;

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
		this.aggressiveImage = Asset.get('@asset-example/images/image-youtube');
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
						console.log('dd');
	
						if (Math.abs(this.aggressive) > prob) {
							this.target = object;
							this.parent.moveable.destination = object.transform.position;
	
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
				this.parent.spriteRenderer.sprite = Asset.get('@asset-example/sprites/sprite-squirrel-move');

				this.state = 'explore';
			}
		}
		else if (this.state == 'explore') {
			let prob = Math.random();

			if (prob < 0.01) {
				// console.log('exp -> idle')
				this.parent.moveable.destination = null;
				this.parent.spriteRenderer.sprite = Asset.get('@asset-example/sprites/sprite-squirrel-idle');
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
				this.attackProgress.current = 0;
				this.parent.spriteRenderer.sprite = Asset.get('@asset-example/sprites/sprite-squirrel-idle');
				this.state = 'idle';
			}
			else if (this.parent.stats.attackRange ** 2 >= sq) {
				if (this.target.stats) {
					if (this.attackProgress.isFull) {
						// console.log('attack!')
						this.target.stats.hp -= this.parent.stats.ap - this.target.stats.dp;
						this.attackProgress.current = 0;
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
				this.parent.spriteRenderer.sprite = Asset.get('@asset-example/sprites/sprite-squirrel-idle');
				this.state = 'idle'
			}
			else if (this.parent.transform.size[0] ** 2 >= sq) {
				this.parent.moveable.destination = null;
			}
			else {
				const prob = Math.random();
				
				if (prob < 0.005) {
					this.target = null;
					this.parent.spriteRenderer.sprite = Asset.get('@asset-example/sprites/sprite-squirrel-idle');
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
			context.drawImage(this.aggressiveImage.raw, -20, -this.parent.transform.size[1] / 2 - 40, 40, 20);
		}
	}
}



// Scene: collision
export class RayTest extends Module.apply(UObject) {
	constructor(name) {
		super(name);

		this.start = null;
		this.end = null;
	}

	onInit() {
		this.box = Scene.find('box', true);
		this.ray = null;
	}

	onUpdate(delta) {
		const mouse = Input.mouse;

		if (mouse.down) {
			this.start = mouse.down.slice();
		}

		if (mouse.move) {
			if (this.start) {
				this.end = mouse.move.slice();
				this.ray = Ray.Raycast(this.start, this.end, this.box);
				console.log(this.ray.hit);
			}
		}
	}

	onDraw(context) {
		context.save();

		if (this.start && this.end) {
			context.strokeStyle = 'red';
			context.beginPath();
			context.moveTo(...this.start);
			context.lineTo(...this.end);
			context.stroke();

			if (this.ray && this.ray.hit) {
				context.strokeStyle = 'white';

				context.beginPath();
				context.moveTo(...this.ray.point);
				context.lineTo(...this.ray.point.addv(this.ray.normal.muls(10)));
				context.stroke();
			}
		}

		context.restore();
	}

	static async fromJSON(json) {
		const ray = await super.fromJSON(json);

		ray.start = json['start'] || null;
		ray.end = json['end'] || null;

		return ray
	}
}

export class BoxTest extends Module.apply(UObject) {
	constructor(name) {
		super(name);

		this.mouse = null;

		this.start = null;
		this.end = null;

		this.size = [0, 0];
		this.anchor = [0, 0];
	}

	onInit() {
		this.boxes = Scene.findAll('#collider#box', true);
		this.rays = [];

		this.position = [0, 0];
	}

	onUpdate(delta) {
		const mouse = Input.mouse;

		if (mouse.down) {
			this.start = mouse.down.slice();
		}

		if (mouse.move) {
			if (this.start) {
				this.end = mouse.move.slice();

				const position = this.end.slice();

				// version 1
				const rays = [];

				const adjust = this.size.mulv([0.5, 0.5].subv(this.anchor));

				this.boxes.forEach(box => {
					const rayResult = Ray.Boxcast(this.size, this.start.addv(adjust), this.end.addv(adjust), box);

					if (rayResult.hit) {
						rayResult.point = rayResult.point.subv(adjust);
						rays.push(rayResult);
					}
				});

				let minRay = [null, null];
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

				
				

				// version 2
				// let minDistanceRay = null;
				// let hitBox = null;

				// const adjust = this.size.mulv([0.5, 0.5].subv(this.anchor));

				// this.boxes.forEach(box => {
				// 	const rayResult = Ray.Boxcast(this.size, this.start.addv(adjust), this.end.addv(adjust), box);

				// 	if (rayResult.hit) {
				// 		if (minDistanceRay == null || minDistanceRay.distance > rayResult.distance) {
				// 			hitBox = box;
				// 			rayResult.point = rayResult.point.subv(adjust);
				// 			minDistanceRay = rayResult;
				// 		}
				// 	}
				// });

				// if (minDistanceRay) {
				// 	if (minDistanceRay.normal[0]) {
				// 		position[0] = minDistanceRay.point[0];
				// 	}

				// 	if (minDistanceRay.normal[1]) {
				// 		position[1] = minDistanceRay.point[1];
				// 	}

				// 	// const [start, end] = [minDistanceRay.point.slice(), position.slice()];

				// 	// minDistanceRay = null;

				// 	// this.boxes.filter(box => box != hitBox).forEach(box => {
				// 	// 	const enlarged = new UGameObject('');

				// 	// 	enlarged.transform.size = box.transform.size.addv(this.size);
				// 	// 	enlarged.transform.position = box.transform.position.addv(this.anchor.subv([1, 1]).mulv(this.size));

				// 	// 	const rayResult = Ray.Raycast(start, end, enlarged);

				// 	// 	if (rayResult.hit) {
				// 	// 		if (minDistanceRay == null || minDistanceRay.distance > rayResult.distance) {
				// 	// 			minDistanceRay = rayResult;
				// 	// 		}
				// 	// 	}
				// 	// });
					
				// 	// if (minDistanceRay) {
				// 	// 	if (minDistanceRay.normal[0]) {
				// 	// 		position[0] = minDistanceRay.point[0];
				// 	// 	}
	
				// 	// 	if (minDistanceRay.normal[1]) {
				// 	// 		position[1] = minDistanceRay.point[1];
				// 	// 	}
				// 	// }
				// }

				this.position = position;
			}
			
			this.mouse = mouse.move.slice();
		}
	}

	onDraw(context) {
		context.save();

		if (this.mouse) {
			context.fillStyle = 'blue';
			if (this.start == null) {
				context.fillRect(...this.mouse.subv(this.size.mulv(this.anchor)), ...this.size);
			}
			else {
				context.fillRect(...this.start.subv(this.size.mulv(this.anchor)), ...this.size);

				if (this.end) {
					context.fillRect(...this.end.subv(this.size.mulv(this.anchor)), ...this.size);
				}
			}
		}
		

		if (this.start && this.end) {
			context.strokeStyle = 'red';

			context.beginPath();
			context.moveTo(...this.start);
			context.lineTo(...this.end);
			context.stroke();

			context.strokeStyle = 'white';

			// for (const ray of this.rays) {
			// 	if (ray.hit) {
			// 		context.beginPath();
			// 		context.moveTo(...ray.point);
			// 		context.lineTo(...ray.point.addv(ray.normal.muls(10)));
			// 		context.stroke();

			// 		if (ray.normal[0]) {
			// 			position[0] = ray.point[0];

			// 			context.strokeStyle = 'orange';
			// 			context.beginPath();
			// 			context.moveTo(...ray.point);
			// 			context.lineTo(...position);
			// 			context.stroke();
			// 		}

			// 		if (ray.normal[1]) {
			// 			position[1] = ray.point[1];
			// 		}
			// 	}
			// }

			context.fillStyle = 'rgba(0, 0, 255, 0.5)';
			context.fillRect(...this.position.subv(this.size.mulv(this.anchor)), ...this.size);
		}

		context.restore();
	}

	static async fromJSON(json) {
		const box = await super.fromJSON(json);

		box.start = json['start'] || null;
		box.end = json['end'] || null;
		box.size = json['size'] || [0, 0];
		box.anchor = json['anchor'] || [0, 0];

		return box
	}
}

export class BoxCollider extends Module.apply(UGameObject) {
	onInit() {
		this.color = 'green';
	}
	onDraw(context) {
		context.save();

		context.fillStyle = this.color;
		context.fillRect(0, 0, ...this.transform.size);

		context.restore();
	}
}