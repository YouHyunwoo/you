var Korea = {

	name: "Korea",
	desc: "made by You",

	debug: true,

	asset: {
		theme: {
			red: {
				backgroundColor: '#000',
				button: {
					backgroundColor: 'rgba(255, 0, 0, 0.5)',
					textColor: '#fff',
				}
			}
		},
	},

	scene: {
		title: {
			in() {
				// login
				// 
				// 1. 타이틀 표시
				// 2. 'press enter to continue' 표시
				// 3. 텍스트 입력 상자 생성: id, pw
				// 4. 버튼 표시: login
				// 5. 로그인 검사
				// 6. character 장면 생성해서 계정 index를 보내주기
			},

			out() {

			},

			update(delta) {

			},

			draw(context) {

			},
		},
		character: {
			in() {
				// select character
			},

			out() {

			},

			update(delta) {

			},

			draw(context) {

			},
		},
		game: {
			in() {
				// v. Image
				// 1. 테스트 맵 생성
				// 2. 테스트 캐릭터 생성
				// 3. 캐릭터 움직임: keyboard, obj.transform
				// v. Asset.Image, Asset.Image.Loader
				// 4. 캐릭터 애니메이션: Frame, Animation
				// 5. 테스트 몬스터 생성: Stats
				// 6. 캐릭터 근접 공격, 주문: Animator
				// 7. 몬스터 AI: AI, You.dispose, You.onCreate
				// 8. 맵 저장: You.Data
				// 9. 캐릭터 저장: toJSON, fromJSON
				// 10. 오브젝트 저장
				// (에디터 만들기: 맵, 오브젝트, )
				// 11. 실제 맵 기획, 생성
				// 12. 실제 캐릭터 기획, 생성
				// 13. 실제 몬스터 기획, 생성

				let sheets = Korea.Graphics.Sprite.Sheet;

				sheets.add(
					new Korea.Graphics.Sprite.Sheet('logo', You.Asset.Image.load('logo.png'))
						.addSprites(
							['logo', [0, 0, null, null], [0.5, 0.5], [0.15, 0.25]]
						),
					new Korea.Graphics.Sprite.Sheet('stone', You.Asset.Image.load('stone.png'))
						.addSprites(
							['stone', [0, 0, null, null], [0.5, 0.5], [0.3, 0.3]]
						),
					new Korea.Graphics.Sprite.Sheet('buildings', You.Asset.Image.load('buildings.png'))
						.addSprites(
							['building1', [0, 0, null, null], [0.5, 0.8], [5, 5]]
						),
					new Korea.Graphics.Sprite.Sheet('trees', You.Asset.Image.load('trees.png'))
						.addSprites(
							['tree0', [0, 0, 64, 64], [0.5, 0.8], [5, 5]],
							['tree1', [65, 0, 63, 64], [0.5, 0.8], [8, 8]]
						),
					new Korea.Graphics.Sprite.Sheet('squirrel', You.Asset.Image.load('squirrel.png'))
						.addSprites(
							['idle', [0, 0, 48, 32], [0.5, 0.8], [1, 1]],
							['move', [0, 32, 48, 32], [0.5, 0.8], [1, 1]]
						)
				);

				// 1. 테스트 맵 생성
				this.map = new Korea.Map('map')
							.setPosition([50, 50])
							.setSize([2000, 2000])
							.setColor('rgba(120, 100, 70, 1)')
							.addComponents(
								new Korea.ObjectArrangement('object arrangement')
							);

				this.buildings = [];
				let building = new Korea.GameObject('building' + 0)
								.addTags('building')
								.setPosition([500, 500])
								.setSize([50, 50])
								.setAnchor([0.5, 0.5])
								.addComponents(
									new Korea.SpriteRenderer('sprite renderer')
										.setSprite(sheets.get('buildings').building1)
								);
				this.buildings.push(building);
				this.map.addComponents(building);

				this.trees = [];
				for (let i = 0; i < 4; i++) {
					let tree = new Korea.GameObject('tree' + i)
							.addTags('object')
							.setPosition([Math.random() * this.map.width, Math.random() * this.map.height])
							.setSize([20, 20])
							.setAnchor([0.5, 0.5])
							.addComponents(
								new Korea.SpriteRenderer('sprite renderer')
									.setSprite(sheets.get('trees')['tree' + parseInt(Math.random() * 2)])
							);

					this.trees.push(tree);
					this.map.addComponents(tree);
				}

				// 2. 테스트 캐릭터 생성

				// 3. 캐릭터 움직임

				// 4. 캐릭터 애니메이션

				this.character = new Korea.GameObject('character')
									.addTags('character', 'player')
									.setPosition([300, 300])
									.setSize([50, 50])
									.setAnchor([0.5, 0.5])
									.addComponents(
										new Korea.SpriteRenderer('sprite renderer')
											.setSprite(
												sheets.get('trees').tree0
											),
										new You.State.Context('animator')
											.addComponents(
												new Korea.Graphics.Animation('idle')
													.addFrames(
														new Korea.Graphics.Frame()
															.setTime(0)
															.setDuration(1)
															.setActions(new Korea.Event.Action(
																'change sprite',
																sheets.get('logo').logo
															))
													),
												new Korea.Graphics.Animation('attack')
													.addFrames(
														new Korea.Graphics.Frame()
															.setTime(0)
															.setDuration(0.5)
															.setActions(new Korea.Event.Action(
																'change sprite',
																sheets.get('trees').tree0
															)),
														new Korea.Graphics.Frame()
															.setTime(0.5)
															.setDuration(0.1)
															.setActions(
																new Korea.Event.Action('animation play', 0),
																new Korea.Event.Action('animation transit', 'idle'),
															)
													)
											),
										new Korea.Stats('stats')
											.setStats('hp', 10)
											.setStats('maxhp', 10)
											.setStats('mp', 2)
											.setStats('ap', 1)
											.setStats('dp', 0),
										new Korea.HPRepresenter('hp representer'),
										new Korea.Moveable('moveable').setSpeed(150),
										new Korea.Player.Attack('player attack'),
										new Korea.Player.Move('player move'),
										new Korea.Camera('camera')
									);

				this.map.addComponents(this.character);

				// 5. 테스트 몬스터 생성

				this.monster = new Korea.GameObject('monster')
								.addTags('character')
								.setPosition([100, 100])
								.setSize([50, 50])
								.setAnchor([0.5, 0.5])
								.addComponents(
									new Korea.SpriteRenderer('sprite renderer')
										.setSprite(
											sheets.get('stone').stone
										),
									new Korea.Stats('stats')
										.setStats('hp', 3)
										.setStats('maxhp', 3)
										.setStats('mp', 0)
										.setStats('ap', 1)
										.setStats('dp', 0),
									new Korea.HPRepresenter('hp representer'),
									new Korea.Moveable('moveable').setSpeed(100),
									new Korea.AI('ai')
										.setSight(200)
										.setAggressivePoint(-0.01)
								);

				this.map.addComponents(this.monster);

				this.squirrel = new Korea.GameObject('squirrel')
								.addTags('character')
								.setPosition([200, 200])
								.setSize([50, 50])
								.setAnchor([14, 22])
								.addComponents(
									new Korea.SpriteRenderer('sprite renderer')
										.setSprite(
											sheets.get('squirrel').idle
										),
									new Korea.Stats('stats')
										.setStats('hp', 3)
										.setStats('maxhp', 3)
										.setStats('mp', 0)
										.setStats('ap', 1)
										.setStats('dp', 0),
									new Korea.HPRepresenter('hp representer'),
									new Korea.Moveable('moveable').setSpeed(100),
									new Korea.AI('ai')
										.setSight(200)
										.setAggressivePoint(-0.01),
									new You.State.Context('animator')
										.addComponents(
											new Korea.Graphics.Animation('idle')
												.addFrames(
													new Korea.Graphics.Frame()
														.setTime(0)
														.setDuration(1)
														.setActions(new Korea.Event.Action(
															'change sprite',
															sheets.get('squirrel').idle
														))
												),
											new Korea.Graphics.Animation('attack')
												.addFrames(
													new Korea.Graphics.Frame()
														.setTime(0)
														.setDuration(0.5)
														.setActions(new Korea.Event.Action(
															'change sprite',
															sheets.get('squirrel').move
														)),
													new Korea.Graphics.Frame()
														.setTime(0.5)
														.setDuration(0.1)
														.setActions(
															new Korea.Event.Action('animation play', 0),
															new Korea.Event.Action('animation transit', 'idle'),
														)
												)
										)
									// new Korea.Event()
									// 	.addConditions((delta, object) => object.name == "squirrel")
									// 	.addActions((delta, object) => console.log(object.name))
								)

				this.map.addComponents(this.squirrel);

				// 8. 맵 저장
				let json = JSON.stringify(this.map, null, 4);

				// console.log(json);
				this.map = You.Data.fromJSON(JSON.parse(json));
			},

			out() {

			},

			update(delta) {
				this.map.update(delta);
			},

			draw(context) {
				this.map.draw(context);
			},
		},
	},
};

Korea.Map = class Korea_Map extends You.Panel {
	constructor(name) {
		super(name);

		this.background = null;
	}

	onDraw(context) {
		super.onDraw(context);

		if (this.background) {
			context.save();

			this.background.draw(context, 0, 0, ...this.size);

			context.restore();
		}
	}

	setBackground(background) {
		this.background = background || null;

		return this;
	}
};

Korea.ObjectArrangement = class Korea_ObjectArrangement extends You.Object {
	onUpdate(delta) {
		let map = this.parent;

		map.components.sort((a, b) => {
			if (a instanceof Korea.GameObject && b instanceof Korea.GameObject) {
				return a.transform.position[1] + a.transform.size[1] / 2 - b.transform.position[1] - b.transform.size[1] / 2;
			}

			return 0;
		});
	}
};

Korea.GameObject = class Korea_GameObject extends You.Object {
	constructor(name) {
		super(name);

		this.transform = {
			position: [0, 0],
			size: [0, 0],
		};

		this.anchor = [0, 0];
	}

	draw(context, ...args) {
		context.save();

		context.translate(...this.transform.position);

		this.onDraw(context, ...args);
		this.components.forEach((c) => c.draw(context, ...args));

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
};

Korea.Moveable = class Korea_Moveable extends You.Object {
	constructor(name) {
		super(name);

		this.destination = null;

		this.speed = 0;
	}

	onUpdate(delta) {
		let object = this.parent;

		if (this.destination != null) {
			let pos = object.transform.position;
			let diff = this.destination.subv(pos);
			let sq = diff.dotv(diff);

			if ((this.speed * delta) ** 2 < sq) {
				object.transform.position = pos.addv(diff.muls(this.speed * delta).divs(Math.sqrt(sq)));
			}
			else {
				object.transform.position = this.destination;
			}
		}
	}

	setDestination(destination) {
		this.destination = destination;

		return this;
	}

	setSpeed(speed) {
		this.speed = speed;

		return this;
	}
};

Korea.SpriteRenderer = class Korea_SpriteRenderer extends You.Object {

	sprite = null;

	onDraw(context) {
		if (this.sprite) {
			this.sprite.draw(context, 0, 0);
		}

		if (Korea.debug) {
			context.fillStyle = 'rgba(255, 0, 0, 0.2)';
			context.fillRect(...this.parent.transform.size.mulv(this.parent.anchor).muls(-1), ...this.parent.transform.size);

			context.strokeStyle = 'white';

			context.beginPath();
			context.moveTo(-5, 0);
			context.lineTo(5, 0);
			context.moveTo(0, -5);
			context.lineTo(0, 5);
			context.stroke();
		}
	}

	setSprite(sprite) {
		this.sprite = sprite || null;

		return this;
	}
};

Korea.Stats = class Korea_Stats extends You.Object {
	constructor(name) {
		super(name);

		this.hp = 0;
		this.maxhp = 0;
		this.mp = 0;
		this.ap = 0;
		this.dp = 0;

		this.attackRange = 60;
	}

	setStats(name, value) {
		this[name] = value;

		return this;
	}
};

Korea.HPRepresenter = class Korea_HPRepresenter extends You.Object {
	onDraw(context) {
		let object = this.parent;

		context.save();

		context.fillStyle = 'rgba(255, 0, 0, 0.7)';
		context.fillRect(-object.transform.size[0] / 2, -object.transform.size[1] / 2 - 15, object.stats.hp / object.stats.maxhp * object.transform.size[0], 10);

		context.strokeStyle = 'black';
		context.strokeRect(-object.transform.size[0] / 2, -object.transform.size[1] / 2 - 15, object.transform.size[0], 10);

		context.restore();
	}
};

Korea.AI = class Korea_AI extends You.Object {
	constructor(name) {
		super(name);

		this.state = 'idle';

		this.sight = 0;

		this.aggressivePoint = 0;
		this.attackProgress = new Progress(0, 1, 1, 1, { begin: false, end: false });

		this.target = null;

		this.aggressiveImage = You.Asset.Image.load('youtube.png');
	}

	onUpdate(delta) {
		let map = this.parent.parent;

		if (this.state == 'idle') {
			for (let object of map.findComponents('#player')) {
				if (object == this.parent) {
					continue;
				}

				let diff = object.transform.position.subv(this.parent.transform.position);

				if (diff.dotv(diff) <= this.sight ** 2 && this.target == null) {
					let prob = Math.random();

					if (Math.abs(this.aggressivePoint) > prob) {
						this.target = object;
						this.parent.moveable.destination = object.transform.position;

						this.state = this.aggressivePoint < 0 ? 'aggressive' : 'follow';

						// console.log('idle ->' + this.state);
					}
				}
			}

			let prob = Math.random();

			if (prob < 0.01) {
				// console.log('idle -> explore')
				this.parent.moveable.destination = [Math.random() * map.size[0], Math.random() * map.size[1]];
				this.state = 'explore';
			}
		}
		else if (this.state == 'explore') {
			let prob = Math.random();

			if (prob < 0.01) {
				// console.log('exp -> idle')
				this.parent.moveable.destination = null;
				this.state = 'idle';
			}
		}
		else if (this.state == 'aggressive') {
			let diff = this.target.transform.position.subv(this.parent.transform.position);
			let sq = diff.dotv(diff);

			this.attackProgress.update(delta);

			if (this.sight ** 2 < sq) {
				// console.log('aggressive -> idle')
				this.target = null;
				this.parent.moveable.destination = null;
				this.attackProgress.current = 0;
				this.state = 'idle'
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
				this.state = 'idle'
			}
			else if (this.parent.transform.size[0] ** 2 >= sq) {
				this.parent.moveable.destination = null;
			}
			else {
				this.parent.moveable.destination = this.target.transform.position;
			}
		}
	}

	onDraw(context) {
		if (Korea.debug) {
			context.save();

			context.fillStyle = 'rgba(0, 0, 255, 0.2)';

			context.beginPath();
			context.arc(0, 0, this.sight, 0, 2 * Math.PI);
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

	setSight(sight) {
		this.sight = sight;

		return this;
	}

	setAggressivePoint(aggressivePoint) {
		this.aggressivePoint = aggressivePoint;

		return this;
	}
};

Korea.Graphics = {};
Korea.Graphics.Sprite = class Korea_Graphics_Sprite {

	source = [0, 0, null, null];
	anchor = [0, 0];
	scale = [1, 1];

	constructor(sheet, id) {
		Object.defineProperty(this, 'sheet', {
			value: sheet
		});

		Object.defineProperty(this, 'id', {
			enumerable: true,
			value: id
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

		if (this.sheet.image && this.sheet.image.loaded) {
			let [w, h] = [this.source[2] || this.sheet.image.width, this.source[3] || this.sheet.image.height];

			this.sheet.image.draw(context,
				this.source[0], this.source[1], w, h,
				x - w * this.anchor[0] * this.scale[0], y - h * this.anchor[1] * this.scale[1], w * this.scale[0], h * this.scale[1]);
		}
	}

	get width() {
		return this.source[2] || (this.source[2] == 0) ? 0 : this.sheet.image.width;
	}

	get height() {
		return this.source[3] || (this.source[3] == 0) ? 0 : this.sheet.image.height;
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

	toJSON() {
		return {
			'@class': this.constructor.name,
			sheet: this.sheet.id,
			...this
		};
	}

	static fromJSON(data) {
		let sheet = Korea.Graphics.Sprite.Sheet.get(data.sheet);

		let instance = new this(sheet, data.id)
						.setSource(data.source)
						.setAnchor(data.anchor)
						.setScale(data.scale);

		return instance;
	}
};

Korea.Graphics.Sprite.Sheet = class Korea_Graphics_Sprite_Sheet {

	static #data = new Map();

	static add(...args) {
		for (let arg of args) {
			this.#data.set(arg.id, arg);
		}
	}

	static get(id) {
		return this.#data.get(id);
	}

	static remove(...args) {
		for (let arg of args) {
			this.#data.delete(arg);
		}
	}

	#sprites = [];

	constructor(id, image) {
		Object.defineProperty(this, 'id', {
			enumerable: true,
			value: id
		});

		Object.defineProperty(this, 'image', {
			value: image
		});
	}

	addSprites(...args) {
		console.log(this.id, args)
		for (let arg of args) {
			let [id, source, anchor, scale] = arg;

			if (this.hasOwnProperty(id)) {
				throw 'invalid id';
			}

			let sprite = new Korea.Graphics.Sprite(this, id)
							.setSource(source)
							.setAnchor(anchor)
							.setScale(scale);

			Object.defineProperty(this, id, {
				configurable: true,
				value: sprite
			})

			this.#sprites.push(sprite);
		}

		return this;
	}

	removeSprites(...args) {
		for (let arg of args) {
			let id = arg;

			delete this[id];
		}

		return this;
	}

	toJSON() {
		return {
			'@class': this.constructor.name,
			...this,
			sprites: this.#sprites,
		};
	}

	static fromJSON(data) {
		let instance = new this(data.id, You.Data.fromJSON(data.image));

		// console.log(data.sprites.map((e) => [e.id, e.source, e.anchor, e.scale]));
		instance.addSprites(...data.sprites.map((e) => [e.id, e.source, e.anchor, e.scale]));

		return instance;
	}
}

Korea.Graphics.Frame = class Korea_Graphics_Frame {
	constructor() {
		this.actions = [];
		this.time = 0;
		this.duration = 0;
	}

	update(delta, object) {
		this.actions.forEach((action) => action.run(delta, object));
	}

	setActions(...actions) {
		for (let action of actions) {
			this.actions.push(action);
		}

		return this;
	}

	setTime(time) {
		this.time = time;

		return this;
	}

	setDuration(duration) {
		this.duration = duration;

		return this;
	}

	toJSON = () => You.Data.toJSON(this);

	static fromJSON(object) {
		return new this()
				.setActions(...object.actions.map((action) => You.Data.fromJSON(action)))
				.setTime(object.time)
				.setDuration(object.duration);
	}
};

Korea.Event = class extends You.Object {
	constructor(name) {
		super(name);

		this.conditions = [];
		this.actions = [];
	}

	onUpdate(delta) {
		if (this.conditions.every((condition) => condition(delta, this.parent))) {
			this.actions.forEach(action => action(delta, this.parent));
		}
	}

	addConditions(...args) {
		for (let arg of args) {
			this.conditions.push(arg);
		}

		return this;
	}

	addActions(...args) {
		for (let arg of args) {
			this.actions.push(arg);
		}

		return this;
	}

	toJSON() {
		return {
			'@class': this.constructor.name,
			conditions: this.conditions.map((condition) => condition.toString()),
			actions: this.actions.map((action) => action.toString()),
		};
	}

	static fromJSON(data) {
		let instance = new this();

		instance.conditions = data.conditions.map((e) => eval(e));
		instance.actions = data.actions.map((e) => eval(e));

		return instance;
	}
};

Korea.Event.Condition = class Korea_Event_Condition {
	condition;

	check(delta, object) {
		return eval(condition);
	}
};

Korea.Event.Action = class Korea_Event_Action {
	constructor(name, ...args) {
		this.name = name;
		this.args = args;
	}

	run(delta, object) {
		if (this.name == 'change sprite') {
			object['sprite renderer'].sprite = this.args[0];
		}
		else if (this.name == 'animation play') {
			object['animator'].state.play(this.args.length == 1 ? this.args[0] : null);
		}
		else if (this.name == 'animation transit') {
			object['animator'].transit(this.args[0]);
		}
	}

	toJSON = () => You.Data.toJSON(this);

	static fromJSON(object) {
		return new this(object.name, ...You.Data.fromJSON(object.args));
	}
};

Korea.Graphics.Animation = class Korea_Graphics_Animation extends You.State {

	#playing = false;

	#progress = new Progress(0, 0, 1, 0, { begin: true, end: true });
	#frames = [];

	onUpdate(delta) {
		this.#progress.update(delta);

		let current = this.#progress.current;

		for (let frame of this.#frames) {
			if (frame.time <= current && current < frame.time + frame.duration) {
				frame.update(delta, this.parent.parent);
			}
		}
	}

	addFrames(...frames) {
		for (let frame of frames) {
			this.#frames.push(frame);

			let last = frame.time + frame.duration;

			if (this.#progress.end < last) {
				this.#progress.end = last;
			}
		}

		return this;
	}

	play(progress=null) {
		this.#playing = true;

		if (progress != null) {
			this.#progress.current = progress;
		}
	}

	pause() {
		this.#playing = false;
	}

	stop() {
		this.#playing = false;
		this.#progress.current = this.#progress.begin;
	}

	setSpeed(speed) {
		this.#progress.speed = speed || 1;

		return this;
	}

	toJSON = () => ({
		'@class': this.constructor.name,
		...this,
		playing: this.#playing,
		frames: this.#frames,
		progress: this.#progress.current,
		speed: this.#progress.speed
	});

	static fromJSON(object) {
		let instance = new this(object.name);

		instance.addFrames(...object.frames.map((frame) => You.Data.fromJSON(frame)));
		instance.play(object.progress);
		if (!object.playing) {
			instance.pause();
		}
		instance.setSpeed(object.speed);

		return instance;
	}
};

// Player
Korea.Player = {};
Korea.Player.Move = class Korea_Player_Move extends You.Object {
	onUpdate(delta) {
		if (You.Input.key.press('a')) {
			this.parent.transform.position[0] -= this.parent.moveable.speed * delta;
		}

		if (You.Input.key.press('d')) {
			this.parent.transform.position[0] += this.parent.moveable.speed * delta;
		}

		if (You.Input.key.press('s')) {
			this.parent.transform.position[1] += this.parent.moveable.speed * delta;
		}

		if (You.Input.key.press('w')) {
			this.parent.transform.position[1] -= this.parent.moveable.speed * delta;
		}
	}

	toJSON = () => ({ '@class': this.constructor.name });
};

Korea.Player.Attack = class Korea_Player_Attack extends You.Object {
	constructor(name) {
		super(name);

		this.selectedObject = null;
	}

	onUpdate(delta) {
		let mouse = You.Input.mouse;

		if (mouse.down) {
			if (this.parent.animator.state.name != 'attack') {
				this.parent.animator.transit('attack');
			}

			if (this.selectedObject) {
				this.selectedObject.stats.hp -= this.parent.stats.ap - this.selectedObject.stats.dp;

				if (this.selectedObject.stats.hp <= 0) {
					this.selectedObject.dispose();
					this.selectedObject = null;
				}
			}
		}

		if (mouse.move) {
			let map = this.parent.parent;

			for (let monster of map.findComponents('#monster')) {
				let monpos = monster.transform.position;
				let sq = monpos.subv(this.parent.transform.position);

				if (Math.sqrt(sq.dotv(sq)) < 100) {
					this.selectedObject = monster;
				}
			}
		}
	}

	toJSON = () => ({ '@class': this.constructor.name });
};

Korea.Camera = class Korea_Camera extends You.Object {

	#container = null;
	#target = null;

	// size = null;

	onAdded(parent) {
		this.#target = parent;
	}

	onUpdate(delta) {
		let container = this.#target.parent;
		let [sw, sh] = [You.canvas.width, You.canvas.height];
		container.position[0] = sw / 2 - this.#target.transform.position[0];
		container.position[1] = sh / 2 - this.#target.transform.position[1];
	}
};