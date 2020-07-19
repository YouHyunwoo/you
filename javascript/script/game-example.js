import U, { UObject } from '/script/uengine.js';

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

const id = 'example-game';
const date = '2020-07-18';
const creator = 'YouHyunwoo';
const description = 'Game for example';

class RectRenderer extends Module(UObject) {
    onDraw(context) {
		context.save();

		context.fillStyle = 'white';
		context.fillRect(0, 0, 100, 100);

		context.restore();
    }

    static fromJSON(json) {
        return new this(json.name);
    }
};

class SpriteRenderer extends Module(UObject) {
    
    sprite;

    onDraw(context) {
        this.sprite.draw(context, 0, 0);
    }

    static fromJSON(json, asset) {
        const instance = new this(json.name);

        instance.sprite = asset[json.sprite.substring(1)];

        return instance;
    }
}

export { id as default };
export { RectRenderer, SpriteRenderer };