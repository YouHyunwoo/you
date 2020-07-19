import { UScene, UObject, UGameObject, Input, Scene, fromJSON } from '/script/uengine.js';

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
    in() {
        console.log('title');
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

}

export class PlayerMove extends Module(UObject) {
    onUpdate(delta) {
        if (Input.key.press('a')) {
            this.parent.transform.position[0] -= this.parent.stats.speed * delta;
        }

        if (Input.key.press('d')) {
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

		this.attackRange = 60;
	}

	setStats(name, value) {
		this[name] = value;

		return this;
	}
};

export { id as default };