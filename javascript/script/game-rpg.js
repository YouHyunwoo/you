import { UScene, UObject, UGameObject, UCamera, Input, Scene, Asset, Camera, fromJSON } from '/script/uengine.js';
import * as Vector from '/script/util/vector.js';
import * as Module from '/script/util/module.js';
import * as Ray from '/script/util/ray.js';

Module.set(import.meta.url);

const id = "game-rpg";
export { id as default };



// Scene: title
export class TitleScene extends Module.apply(UScene) {
	
}

export class Arrangement extends Module.apply(UObject) {
	onUpdate(delta) {
		Scene.objects.sort((a, b) => {
			if ([a, b].every(x => x instanceof UGameObject)) {
				const aLayer = this.layerOrder.indexOf(a.layers[this.layerType]);
				const bLayer = this.layerOrder.indexOf(b.layers[this.layerType]);


				if (aLayer == -1 || bLayer == -1) {
					return 0;
				}

				if (aLayer == bLayer) {
					return a.transform.position[1] - b.transform.position[1];
				}

				return aLayer - bLayer;
			}

			return 0;
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
	onDraw(context) {
		context.save();

		context.fillStyle = 'rgb(100, 50, 10)';
		context.fillRect(0, 0, ...this.transform.size);

		context.restore();
	}
}

export class Box extends Module.apply(UGameObject) {

	constructor(name) {
		super(name);

		this.boxSize = [0, 0];
		this.boxAnchor = [0, 0];
		this.boxColor = 'white';
		this.boxFill = false;
	}

	onDraw(context) {
		context.save();

		context.strokeStyle = 'blue';
		context.strokeRect(...this.transform.position.subv(this.transform.size.mulv(this.anchor)), ...this.transform.size);

		if (this.boxFill) {
			context.fillStyle = this.boxColor;
			context.fillRect(...this.transform.position.subv(this.boxSize.mulv(this.boxAnchor)), ...this.boxSize);
		}
		else {
			context.strokeStyle = this.boxColor;
			context.strokeRect(...this.transform.position.subv(this.boxSize.mulv(this.boxAnchor)), ...this.boxSize);
		}
		
		context.restore();
	}

	static async fromJSON(json) {
		const box = await super.fromJSON(json);
		
		box.boxSize = json.boxSize;
		box.boxAnchor = json.boxAnchor;
		box.boxColor = json.boxColor;
		box.boxFill = json.boxFill;

		return box;
	}
}

export class SpriteRenderer extends Module.apply(UObject) {
	
	sprite;

	onInit() {
		this.anchor = this.parent.anchor;
	}

	onDraw(context) {
		this.sprite.draw(context, ...this.anchor);
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

		this.attackRange = 10;
	}

	setStats(name, value) {
		this[name] = value;

		return this;
	}
	
	static async fromJSON(json) {
		const instance = await super.fromJSON(json);

		instance.hp = json.hp || 0;
		instance.maxhp = json.maxhp || 0;
		instance.mp = json.mp || 0;
		instance.ap = json.ap || 0;
		instance.dp = json.dp || 0;
		instance.speed = json.speed || 1;

		instance.attackRange = json.attackRange || 10;

		return instance;
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
			// this.parent.spriteRenderer.sprite = Asset.get("@asset-example/sprites/sprite-stone");
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

export class PlayerView extends Module.apply(UCamera) {
	onInit() {
		this.cameraTf = this.parent.transform;
		this.playerTf = Scene.find('player', true);
	}

	onUpdate(delta) {
		this.cameraTf.position = [...this.playerTf.transform.position];
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