import { UScene, UObject, UGameObject, UCamera, Input, Scene, Asset, Camera, fromJSON } from '/script/uengine.js';

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

const id = "game-rpg";



export class TitleScene extends Module(UScene) {
	// in() {
	// 	console.log('title');
	// }
}

export class PlayerView extends Module(UCamera) {
	onInit() {
		this.cameraTf = this.parent.transform;
		console.log(Scene);
		this.playerTf = Scene.find('player', true);
	}

	onUpdate(delta) {
		// this.cameraTf.position = ;
	}
}

export class SpriteRenderer extends Module(UObject) {
	
	sprite;

	onDraw(context) {
		this.sprite.draw(context, 0, 0);
	}

	static async fromJSON(json, asset) {
		const instance = await super.fromJSON(json, asset);

		instance.sprite = await fromJSON(json.sprite, asset);

		return instance;
	}
}

export class Arrangement extends Module(UObject) {
	onUpdate(delta) {
		this.parent.components.sort((a, b) => {
			if (a instanceof GameObject && b instanceof GameObject) {
				return a.transform.position[1] + a.transform.size[1] / 2 - b.transform.position[1] - b.transform.size[1] / 2;
			}

			return 0;
		});
	}
}

export class Map extends Module(UGameObject) {
	onDraw(context) {
		context.save();

		context.fillStyle = 'rgb(100, 50, 10)';
		context.fillRect(0, 0, ...this.transform.size);

		context.restore();
	}
}

export class PlayerMove extends Module(UObject) {
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

export class Stats extends Module(UObject) {
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
};

export { id as default };