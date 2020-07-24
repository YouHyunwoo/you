import { UScene, UObject, UGameObject, UCamera, Input, Scene, Asset, Camera, fromJSON } from '/script/uengine.js';
import * as Vector from '/script/util/vector.js';
import * as Module from '/script/util/module.js';
import * as Ray from '/script/util/ray.js';

Module.set(import.meta.url);

const id = "game-rpg";
export { id as default };



export class TitleScene extends Module.apply(UScene) {
	
}

// export class BoxCollision extends Module.apply(UObject) {
// 	onInit() {
// 		this.map = Scene.find('map');
// 		this.object = this.parent;
// 	}
	
// 	collide(self) {
// 		for (const object of this.map.components) {

// 		}
// 	}
// }

export class Arrangement extends Module.apply(UObject) {
	onUpdate(delta) {
		this.parent.components.sort((a, b) => {
			if (a instanceof GameObject && b instanceof GameObject) {
				return a.transform.position[1] + a.transform.size[1] / 2 - b.transform.position[1] - b.transform.size[1] / 2;
			}

			return 0;
		});
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
		if (Input.key.press('a')) {
			this.parent.transform.position[0] -= this.parent.stats.speed * delta;
		}

		if (Input.key.press('d')) {
			// this.parent.spriteRenderer.sprite = Asset.get("@asset-example/sprites/sprite-stone");
			this.parent.transform.position[0] += this.parent.stats.speed * delta;
		}

		if (Input.key.press('s')) {
			this.parent.transform.position[1] += this.parent.stats.speed * delta;
		}

		if (Input.key.press('w')) {
			this.parent.transform.position[1] -= this.parent.stats.speed * delta;
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