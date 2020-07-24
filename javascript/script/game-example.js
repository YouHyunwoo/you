import U, { UObject } from '/script/uengine.js';
import * as Module from '/script/util/module.js';

Module.set(import.meta.url);

const id = 'example-game';
const date = '2020-07-18';
const creator = 'YouHyunwoo';
const description = 'Game for example';

class RectRenderer extends Module.apply(UObject) {
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

class SpriteRenderer extends Module.apply(UObject) {
    
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