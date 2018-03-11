class Point {

	constructor(...args) {
		[this.x, this.y] = [0, 0];
		this.set(...args);
	}

	set(...args) {
		switch (args.length) {
			case 0:
				[this.x, this.y] = [0, 0];
				break;
			case 1:
				[this.x, this.y] = [args[0].x, args[0].y];
				break;
			default:
				[this.x, this.y] = args;
		}
	}

	list() {
		return [this.x, this.y];
	}

	add(...args) {
		switch (args.length) {
			case 1:
				return new Point(this.x + args[0].x, this.y + args[0].y);
				break;
			case 2:
				return new Point(this.x + args[0], this.y + args[1]);
				break;
		}
	}

	subtract(...args) {
		switch (args.length) {
			case 1:
				return new Point(this.x - args[0].x, this.y - args[0].y);
				break;
			case 2:
				return new Point(this.x - args[0], this.y - args[1]);
				break;
		}
	}

	multiply(value) {
		return new Point(this.x * value, this.y * value);
	}

	divide(value) {
		return new Point(this.x / value, this.y / value);
	}

	equals(...args) {
		switch (args.length) {
			case 0:
				return undefined;
			case 1:
				return this.x == args[0].x && this.y == args[0].y;
			default:
				return this.equals(new Point(...args));
		}
	}

	static fromJSON(json) {
		return new Point(JSON.parse(json));
	}

}

class Position extends Point {
	static fromJSON(json) {
		return new Position(JSON.parse(json));
	}
}

class Size extends Point {
	static fromJSON(json) {
		return new Size(JSON.parse(json));
	}
}

class Area {

	constructor(...args) {
		[this.x, this.y, this.width, this.height, this.anchor] = [0, 0, 0, 0, null];
		this.set(...args);
	}

	get left() { return this.x; }
	get center() { return this.x + this.width / 2; }
	get right() { return this.x + this.width; }

	get top() { return this.y; }
	get middle() { return this.y + this.height / 2; }
	get bottom() { return this.y + this.height; }

	get anchor_position() {
		return this.anchor.add(this.x, this.y);
	}

	set position(p) {
		[this.x, this.y] = [p.x, p.y];
	}
	get position() {
		return new Position(this.x, this.y);
	}

	set size(s) {
		[this.width, this.height] = [s.width, s.height];
	}
	get size() {
		return new Size(this.width, this.height);
	}

	set(...args) {
		switch (args.length) {
			case 0:
				[this.x, this.y, this.width, this.height, this.anchor] = [0, 0, 0, 0, new Position()];
				break;
			case 1:
				[this.x, this.y, this.width, this.height, this.anchor] = [args[0].x, args[0].y, args[0].width, args[0].height, new Position(args[0].anchor)];
				break;
			case 2:
				[this.x, this.y, this.width, this.height, this.anchor] = [args[0].x, args[0].y, args[1].width, args[1].height, new Position()];
				break;
			case 3:
				[this.x, this.y, this.width, this.height, this.anchor] = [args[0].x, args[0].y, args[1].width, args[1].height, new Position(args[2])];
				break;
			case 4:
				[this.x, this.y, this.width, this.height] = args;
				this.anchor = new Position();
				break;
			case 5:
				[this.x, this.y, this.width, this.height] = args.slice(0, 4);
				this.anchor = new Position(args[4]);
				break;
			default:
				[this.x, this.y, this.width, this.height] = args.slice(0, 4);
				this.anchor = new Position(args[4], args[5]);
		}
	}

	list() {
		return [this.x ,this.y, this.width, this.height, this.anchor];
	}

	contains(x, y, width, height) {
		if (x instanceof Area) { [x, y, width, height] = [x.x, x.y, x.width, x.height]; }
		return this.x <= x && x + width <= this.x + this.width && this.y <= y && y + height <= this.y + this.height;
	}

	intersects(x, y, width, height) {
		if (x instanceof Area) { [x, y, width, height] = [x.x, x.y, x.width, x.height]; }
		return this.x < x + width && x < this.x + this.width && this.y < y + height && y < this.y + this.height;
	}

	equals(...args) {
		switch (args.length) {
			case 0:
				return undefined;
			case 1:
				return this.x == args[0].x && this.y == args[0].y && this.width == args[0].width && this.height == args[0].height && this.anchor.equals(args[0].anchor);
			default:
				return this.equals(new Area(...args));
		}
	}

	toString(desc=false) {
		return `${desc ? 'Area: ' : ''}${this.x}, ${this.y}, ${this.width}, ${this.height}`;
	}

	static fromJSON(json) {
		return new Area(JSON.parse(json));
	}

}


class StateContext {

	constructor(states) {
		this.states = new Map();
		for (let s of states) { this.states.set(s.name, s); }
		this.state = states[0];
	}

	request(message) {
		this.state.request(this, message);
	}

	setState(state) {
		this.state = state;
	}

	toJSON() {
		return { states: Array.from(this.states.values()) };
	}

	static fromJSON(json) {
		let o = (typeof json == "string") ? JSON.parse(json) : json;
		return new StateContext(o.states.map((v) => State.fromJSON(v)));
	}

}

class State {

	constructor(name, responses) {
		this.name = name;
		this.responses = responses;
	}

	request(context, message) {
		if (context.states.has(this.responses[message])) {
			context.setState(context.states.get(this.responses[message]));
		}
	}

	static fromJSON(json) {
		let o = (typeof json == "string") ? JSON.parse(json) : json;
		return new State(o.name, o.responses);
	}

}


class Layer extends Area {

	constructor(area, objects) {
		super(area);
		this.objects = objects || [];
	}

	add(object) {
		if (object) { this.objects.push(object); }
	}

	remove(object) {
		i = this.objects.indexOf(object);
		if (i >= 0) { this.objects.splice(i, 1); }
	}

	update(delta) {
		this.objects.sort((a, b) => ((a.y + a.anchor.y) - (b.y + b.anchor.y)));
		this.objects.forEach((o) => o.update(delta));
	}

	draw(context) {
		context.save();

		context.rect(this.x, this.y, this.width, this.height);
		context.clip();

		context.globalAlpha = 0.2;
		context.fillStyle = "#fff";
		context.fillRect(this.x, this.y, this.width, this.height);

		context.restore();

		for (let o of this.objects) { o.draw(context); }
	}

	static fromJSON(json) {
		let o = (typeof json == "string") ? JSON.parse(json) : json;
		return new Layer(o, o.objects.map((v) => GameObject.fromJSON(v)));
	}

}

// !
class GameWorld {

	constructor(maps) {
		this.maps = maps || [];
	}



}

class GameMap extends Layer {

	constructor(area, objects, background) {
		super(area, objects);
		this.background = background
	}

	draw(context) {
		context.save();

		// panel
		context.globalAlpha = 0.2;
		context.fillStyle = "#fff";
		context.fillRect(0, 0, this.width, this.height);

		// grid
		context.globalAlpha = 0.2;
		context.beginPath();
		for (let i = 0; i < this.width; i+=30) {
			context.moveTo(i, 0);
			context.lineTo(i, this.height);
		}
		for (let i = 0; i < this.height; i+=30) {
			context.moveTo(0, i);
			context.lineTo(this.width, i);
		}
		context.strokeStyle = "#fff";
		context.stroke();
		context.strokeRect(0, 0, this.width, this.height);
		
		// background
		context.globalAlpha = 1;
		if (this.background) {
			if (this.background instanceof Image) {
				context.drawImage(this.background, this.width, this.height);
			}
			else {
				context.fillStyle = this.background;
				context.fillRect(0, 0, this.width, this.height);
			}
		}

		context.restore();

		// objects
		for (let o of this.objects) { o.draw(context); }
	}

	intersects(x, y, width, height) {
		if (x instanceof Area) { [x, y, width, height] = [x.x, x.y, x.width, x.height]; }
		for (let o of this.objects) {
			if (o.blockable && o.intersects(x, y, width, height)) { return true; }
		}
		return false;
	}

	static fromJSON(json) {
		let o = (typeof json == "string") ? JSON.parse(json) : json;
		return new GameMap(o, o.objects.map((v) => GameObject.fromJSON(v)), o.background);
	}

}

class GameObject extends Area {

	constructor(area, animation, blockable=false) {
		super(area);
		this.animation = animation;
		this.blockable = blockable;
	}

	update(delta) {
		this.animation.update(delta);
	}

	draw(context) {
		context.save();

		context.translate(Math.floor(this.x), Math.floor(this.y));
		context.strokeStyle = '#f00';
		context.strokeRect(0, 0, Math.floor(this.width), Math.floor(this.height));

		this.animation.draw(context, this.anchor);

		context.restore();
	}

	static fromJSON(json) {
		let o = (typeof json == "string") ? JSON.parse(json) : json;
		return new GameObject(o, Animation.fromJSON(o.animation), o.blockable);
	}

}

class GameCharacter extends GameObject {

	constructor(area, state_machine, blockable=false, speed=1) {
		super(area, state_machine, blockable);
		this.speed = speed;
	}

	static fromJSON(json) {
		let o = (typeof json == "string") ? JSON.parse(json) : json;
		return new GameCharacter(o, Animation.fromJSON(o.animation), o.blockable, o.speed);
	}

}

class Animation extends StateContext {

	constructor(sprites) {
		super(sprites);
	}

	update(delta) {
		this.state.update(this, delta);
	}

	draw(context, anchor) {
		this.state.draw(this, context, anchor);
	}

	toJSON() {
		return { states: Array.from(this.states.values()) };
	}

	static fromJSON(json) {
		let o = (typeof json == "string") ? JSON.parse(json) : json;
		return new Animation(o.states.map((v) => Sprite.fromJSON(v)));
	}

}

class Sprite extends State {

	constructor(name, responses, frames, speed) {
		super(name, responses);

		this.frames = frames || [];
		this.progress = new Progress(0, 0, speed);
		for (let f of this.frames) {
			this.progress.end += f.duration;
		}
	}

	update(state_context, delta) {
		this.progress.update(delta);
	}

	draw(state_context, context, anchor) {
		let frame = this.frame;
		if (frame) {
			let [fa, fs] = [frame.anchor, frame.scale];
			let [x, y, w, h] = [anchor.x - fa.x * fs.x, anchor.y - fa.y * fs.y, frame.width * fs.x, frame.height * fs.y];
			context.drawImage(frame.image.raw, frame.x, frame.y, frame.width, frame.height, x, y, w, h);
		}
	}

	get frame() {
		let [start, end] = [0, 0];

		for (let frame of this.frames) {
			[start, end] = [end, end + frame.duration];
			if (start <= this.progress.current && this.progress.current < end) { return frame; }
		}

		return (this.frames.length > 0) ? this.frames[this.frames.length - 1] : null;
	}

	static fromJSON(json) {
		let o = (typeof json == "string") ? JSON.parse(json) : json;
		let result = new Sprite(o.name, o.responses, o.frames.map((v) => Frame.fromJSON(v)), o.progress.speed);
		result.progress.current = o.progress.current;
		return result;
	}

}

class Frame extends Area {

	constructor(area, image, scale, duration) {
		super(area);
		this.image = image;
		this.scale = scale;
		this.duration = duration;
	}

	static fromJSON(json) {
		let o = (typeof json == "string") ? JSON.parse(json) : json;
		return new Frame(o, You.asset.get(o.image.name), new Point(o.scale), o.duration);
	}

}




function createMap() {
	let objects = [];

	// tree
	{
		let position = [ [0, 0], [30, 200], [400, 50], [500, 600], [520, 1380], [1000, 200], [1800, 1500], [720, 240], [1820, 320], [1510, 560], [710, 890], [40, 1040], [260, 1840], [750, 1840], [1070, 1690], [1290, 1310], [1810, 1870], [1790, 1100], [1660, 920], [1810, 700], [1660, 490], [1440, 530], [1630, 680], [1910, 220], [1730, 200], [1900, 380] ];

		for (let [x, y] of position) {
			let frame = new Frame(new Area(0, 0, 128, 252, new Position(64, 246)), You.asset.get('tree.png'), new Size(1, 1), 1);
			let sprite = new Sprite('tree', {}, [frame], 1);
			objects.push(new GameObject(new Area(x, y, 24, 12, new Position(12, 6)), new Animation([sprite]), true));
		}
	}
	
	// stone
	{
		let position = [ [ 1000, 1000] ];

		for (let [x, y] of position) {
			let frame = new Frame(new Area(0, 0, 160, 128, new Position(80, 110)), You.asset.get('stone.png'), new Size(0.1, 0.1), 1);
			let sprite = new Sprite('stone', {}, [frame]);
			objects.push(new GameObject(new Area(x, y, 12, 6, new Position(6, 3)), new Animation([sprite])));
		}
	}

	return new GameMap(new Area(0, 0, 2000, 2000), objects, "#4a3");
}

function createPlayer() {
	let sprites = [];

	// idle
	{
		let frames = [];
		frames.push(new Frame(new Area(0, 0, 350, 190, new Position(175, 175)), You.asset.get('logo.png'), new Size(0.175, 0.175), 1));
		sprites.push(new Sprite('idle', { move: 'move' }, frames, 1));
	}

	// move
	{
		let frames = [];
		for (let i = 0; i < 5; i++) {
			frames.push(new Frame(new Area(0, 0, 350, 190, new Position(175, 175)), You.asset.get('logo.png'), new Size(0.05 * (Math.abs(i - 2.5) + 1), 0.05 * (Math.abs(i - 2.5) + 1)), 0.05 * (Math.abs(i - 2.5) + 1)));
		}
		sprites.push(new Sprite('move', { idle: 'idle'}, frames, 1));
	}

	return new GameCharacter(new Area(100, 200, 30, 30, new Position(15, 15)), new Animation(sprites), false, 500);
}


var Game = {

	name: "Game",
	desc: "game made by You 2018-02-01",


	scene: {
		title: {
			in() {
				this.prg_cont = new Progress(2, 8, 10, 2, { begin: false, end: false });
				return this;
			},
			out() {
				this.prg_cont = null;
			},
			update(delta) {
				this.prg_cont.update(delta);

				if (this.prg_cont.isEmpty || this.prg_cont.isFull) { this.prg_cont.speed *= -1; }

				if (You.input.key.down(Input.KEY_ENTER)) {
					You.scene.transit(Game.scene.game);
				}
			},
			draw(context) {
				context.save();

					context.globalAlpha = 1;
					context.fillStyle = "#fff";

					context.drawImage(You.asset.get('logo.png').raw, 10, 10, You.canvas.width / 30, You.canvas.height / 30);

					context.font = "24px Arial";
					context.textAlign = "center";
					context.textBaseline = "middle";
					context.fillText(Game.name, You.canvas.width / 2, You.canvas.height / 3);

					context.globalAlpha = this.prg_cont.rate;
					context.font = "12px Arial";
					context.fillText("press Enter to continue", You.canvas.width / 2, You.canvas.height * 3 / 4);

				context.restore();
			}
		},

		game: {
			in: function() {
				// load player (info)
				// load world (info)

				// load map
				// this.map = createMap();
				this.map = GameMap.fromJSON(`{"x":0,"y":0,"width":1000,"height":1000,"anchor":{"x":0,"y":0},"objects":[{"x":943,"y":52,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":977,"y":68,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":100,"y":113,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":226,"y":124,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":341,"y":126,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":913,"y":128,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":569,"y":128,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":415,"y":130,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":756,"y":136,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":315,"y":138,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":153,"y":153,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":491,"y":165,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":818,"y":168,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":761,"y":174,"width":12,"height":6,"anchor":{"x":6,"y":3},"animation":{"states":[{"name":"stone","responses":{},"frames":[{"x":0,"y":0,"width":160,"height":128,"anchor":{"x":80,"y":110},"image":{"name":"stone.png"},"scale":{"x":0.1,"y":0.1},"duration":1}],"progress":{"begin":0,"end":1,"current":null,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":false},{"x":101,"y":178,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":884,"y":197,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":659,"y":205,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":148,"y":220,"width":12,"height":6,"anchor":{"x":6,"y":3},"animation":{"states":[{"name":"stone","responses":{},"frames":[{"x":0,"y":0,"width":160,"height":128,"anchor":{"x":80,"y":110},"image":{"name":"stone.png"},"scale":{"x":0.1,"y":0.1},"duration":1}],"progress":{"begin":0,"end":1,"current":null,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":false},{"x":854,"y":224,"width":12,"height":6,"anchor":{"x":6,"y":3},"animation":{"states":[{"name":"stone","responses":{},"frames":[{"x":0,"y":0,"width":160,"height":128,"anchor":{"x":80,"y":110},"image":{"name":"stone.png"},"scale":{"x":0.1,"y":0.1},"duration":1}],"progress":{"begin":0,"end":1,"current":null,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":false},{"x":355,"y":236,"width":12,"height":6,"anchor":{"x":6,"y":3},"animation":{"states":[{"name":"stone","responses":{},"frames":[{"x":0,"y":0,"width":160,"height":128,"anchor":{"x":80,"y":110},"image":{"name":"stone.png"},"scale":{"x":0.1,"y":0.1},"duration":1}],"progress":{"begin":0,"end":1,"current":null,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":false},{"x":281,"y":239,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":763,"y":314,"width":12,"height":6,"anchor":{"x":6,"y":3},"animation":{"states":[{"name":"stone","responses":{},"frames":[{"x":0,"y":0,"width":160,"height":128,"anchor":{"x":80,"y":110},"image":{"name":"stone.png"},"scale":{"x":0.1,"y":0.1},"duration":1}],"progress":{"begin":0,"end":1,"current":null,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":false},{"x":189,"y":422,"width":12,"height":6,"anchor":{"x":6,"y":3},"animation":{"states":[{"name":"stone","responses":{},"frames":[{"x":0,"y":0,"width":160,"height":128,"anchor":{"x":80,"y":110},"image":{"name":"stone.png"},"scale":{"x":0.1,"y":0.1},"duration":1}],"progress":{"begin":0,"end":1,"current":null,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":false},{"x":957,"y":431,"width":12,"height":6,"anchor":{"x":6,"y":3},"animation":{"states":[{"name":"stone","responses":{},"frames":[{"x":0,"y":0,"width":160,"height":128,"anchor":{"x":80,"y":110},"image":{"name":"stone.png"},"scale":{"x":0.1,"y":0.1},"duration":1}],"progress":{"begin":0,"end":1,"current":null,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":false},{"x":653,"y":442,"width":12,"height":6,"anchor":{"x":6,"y":3},"animation":{"states":[{"name":"stone","responses":{},"frames":[{"x":0,"y":0,"width":160,"height":128,"anchor":{"x":80,"y":110},"image":{"name":"stone.png"},"scale":{"x":0.1,"y":0.1},"duration":1}],"progress":{"begin":0,"end":1,"current":null,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":false},{"x":810,"y":516,"width":12,"height":6,"anchor":{"x":6,"y":3},"animation":{"states":[{"name":"stone","responses":{},"frames":[{"x":0,"y":0,"width":160,"height":128,"anchor":{"x":80,"y":110},"image":{"name":"stone.png"},"scale":{"x":0.1,"y":0.1},"duration":1}],"progress":{"begin":0,"end":1,"current":null,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":false},{"x":699,"y":637,"width":12,"height":6,"anchor":{"x":6,"y":3},"animation":{"states":[{"name":"stone","responses":{},"frames":[{"x":0,"y":0,"width":160,"height":128,"anchor":{"x":80,"y":110},"image":{"name":"stone.png"},"scale":{"x":0.1,"y":0.1},"duration":1}],"progress":{"begin":0,"end":1,"current":null,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":false},{"x":884,"y":712,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":928,"y":772,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":17,"y":776,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":417,"y":778,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":962,"y":802,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":765,"y":827,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":579,"y":849,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":158,"y":851,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":223,"y":862,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":72,"y":862,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":727,"y":867,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":837,"y":871,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":283,"y":881,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":367,"y":884,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":482,"y":886,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":234,"y":889,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":945,"y":892,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":616,"y":903,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":659,"y":922,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":634,"y":931,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":179,"y":932,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":211,"y":946,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":724,"y":950,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":449,"y":953,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":79,"y":956,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":749,"y":961,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":85,"y":961,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":825,"y":963,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":910,"y":968,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":458,"y":973,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":125,"y":975,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":581,"y":977,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":250,"y":977,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":31,"y":984,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":981,"y":986,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":393,"y":1003,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true}]}`);

				// load player
				this.player = createPlayer();
				this.map.add(this.player);

				// view
				this.view = new Area(0, 0, You.canvas.width, You.canvas.height);

				// user input
				this.target = new Position(this.player.position.add(this.player.anchor));
				this.mouse_position = new Position();
				this.movement = false;

				return this;
			},
			out: function() {
				// save & release player (info)
				// release world
			},
			update: function(delta) {
				for (let m = You.input.mouse; m != null; m = You.input.mouse) {
					if (m[0] == 'down') {
						// 땅 찍었을 때
						this.mouse_position.set(m[1]);
						this.movement = true;
					}
					else if (m[0] == 'move') {
						if (this.movement) {
							this.mouse_position.set(m[1]);
						}
					}
					else if (m[0] == 'up') {
						if (this.movement) {
							this.movement = false;
						}
					}
				}

				if (You.input.key.down(Input.KEY_SPACE)) {
					this.player.animation.request('attack');
				}

				if (this.movement) {
					let r = You.canvas.getBoundingClientRect();
					this.target.set(this.mouse_position.add(this.view).subtract(r.left, r.top));
					this.player.animation.request('move');
				}

				if (this.player.animation.state.name == 'move' && this.target.equals(this.player.anchor_position)) {
					this.player.animation.request('idle');
				}

				let [t, p] = [this.target, this.player];
				if (!this.target.equals(this.player.anchor_position)) {
					let d = Math.sqrt(Math.pow(t.x - (p.x + p.anchor.x), 2) + Math.pow(t.y - (p.y + p.anchor.y), 2));
					let next;
					if (d > this.player.speed * delta) {
						next = p.position.add(t.subtract(p.anchor_position).multiply(this.player.speed * delta / d));
					}
					else {
						next = t.subtract(p.anchor);
					}
					if (!this.map.intersects(next.x, p.y, p.width, p.height)) {
						this.player.x = next.x;
					}
					if (!this.map.intersects(p.x, next.y, p.width, p.height)) {
						this.player.y = next.y;
					}
				}

				// view
				this.view.x = Math.min(this.map.width - this.view.width, Math.max(0, Math.floor(this.player.x) + (this.player.width - this.view.width) / 2));
				this.view.y = Math.min(this.map.height - this.view.height, Math.max(0, Math.floor(this.player.y) + (this.player.height - this.view.height) / 2));

				this.map.update(delta);
			},
			draw: function(context) {
				context.save();

					context.rect(0, 0, You.canvas.width, You.canvas.height);
					context.clip();

					context.translate(-Math.floor(this.view.x), -Math.floor(this.view.y));

					this.map.draw(context, this.view);

				context.restore();

				context.save();

					context.strokeStyle = '#fff';
					// context.save();
					// context.rect(20, 20, 20 + this.view.width / 6, 20 + this.view.height / 6);
					// context.clip();
					// context.translate();
					// context.restore();
					context.strokeRect(20, 20, 100, 100);
					let [ xrate, yrate ] = [ 100 / this.map.width, 100 / this.map.height ];
					context.strokeRect(20 + Math.floor(this.view.x * xrate), 20 + Math.floor(this.view.y * yrate), Math.floor(this.view.width * xrate), Math.floor(this.view.height * yrate));

				context.restore();
			},
		},

		game_over: {

		}
	}

};