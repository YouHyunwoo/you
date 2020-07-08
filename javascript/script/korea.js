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
				// play selected character
				// v. Image
				// 1. 테스트 맵 생성
				// 2. 테스트 캐릭터 생성
				// 3. 캐릭터 움직임: keyboard, obj.transform
				// v. Asset.Image, Asset.Image.Loader
				// 4. 캐릭터 애니메이션: Frame, Animation
				// 5. 테스트 몬스터 생성: Stats
				// 6. 캐릭터 근접 공격, 주문: Animator
				// 7. 몬스터 AI: AI
				// 8. 맵 저장
				// 9. 캐릭터 저장
				// 10. 오브젝트 저장
				// (에디터 만들기: 맵, 오브젝트, )
				// 11. 실제 맵 기획, 생성
				// 12. 실제 캐릭터 기획, 생성
				// 13. 실제 몬스터 기획, 생성

				// 1. 테스트 맵 생성
				this.map = new Korea.Map('map')
							.setPosition([50, 50])
							.setSize([1000, 1000])
							.setColor('rgba(255, 255, 255, 0.2)')
							.addComponents(
								new Korea.ObjectArrangement('object arrangement')
							);

				// 2. 테스트 캐릭터 생성

				// 3. 캐릭터 움직임

				// 4. 캐릭터 애니메이션

				let sprites = {
					tree: new Korea.Graphics.Sprite()
							.setSheet(Korea.Asset.Image.load('tree.png'))
							.setAnchor([0.5, 0.5]),
					logo: new Korea.Graphics.Sprite()
							.setSheet(Korea.Asset.Image.load('logo.png'))
							.setAnchor([0.5, 0.5]),
					stone: new Korea.Graphics.Sprite()
							.setSheet(Korea.Asset.Image.load('stone.png'))
							.setAnchor([0.5, 0.5]),
				};

				this.character = new Korea.GameObject('character')
									.addTags('character')
									.setPosition([300, 300])
									.setSize([50, 50])
									.setAnchor([0.5, 0.5])
									.addComponents(
										new Korea.SpriteRenderer('sprite renderer')
											.setSprite(
												sprites.tree
											),
										new You.State.Context('animator')
											.addComponents(
												new Korea.Graphics.Animation('idle')
													.addFrames(
														new Korea.Graphics.Frame()
															.setTime(0)
															.setDuration(1)
															.setAction(function (delta, animator, animation) {
																this['sprite renderer'].sprite = sprites.logo;
															})
													),
												new Korea.Graphics.Animation('attack')
													.addFrames(
														new Korea.Graphics.Frame()
															.setTime(0)
															.setDuration(0.5)
															.setAction(function (delta, animator, animation) {
																this['sprite renderer'].sprite = sprites.tree;
															}),
														new Korea.Graphics.Frame()
															.setTime(0.5)
															.setDuration(0.1)
															.setAction(function (delta, animator, animation) {
																animation.play(0);
																animator.transit('idle');
															}),
													)
											),
										new Korea.Stats('stats')
											.setStats('hp', 10)
											.setStats('maxhp', 10)
											.setStats('mp', 2)
											.setStats('ap', 1)
											.setStats('dp', 0),
										new Korea.Attack('attack'),
										new Korea.HPRepresenter('hp representer'),
										new Korea.Moveable('moveable').setSpeed(150)
									);

				this.map.addComponents(this.character);

				// 5. 테스트 몬스터 생성

				this.monster = new Korea.GameObject('monster')
								.addTags('monster', 'character')
								.setPosition([0, 0])
								.setSize([50, 50])
								.setAnchor([0.5, 0.5])
								.addComponents(
									new Korea.SpriteRenderer('sprite renderer')
										.setSprite(
											sprites.stone
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
			},

			out() {

			},

			update(delta) {
				this.map.update(delta);

				if (You.Input.key.press('a')) {
					this.character.transform.position[0] -= this.character.moveable.speed * delta;
				}

				if (You.Input.key.press('d')) {
					this.character.transform.position[0] += this.character.moveable.speed * delta;
				}

				if (You.Input.key.press('s')) {
					this.character.transform.position[1] += this.character.moveable.speed * delta;
				}

				if (You.Input.key.press('w')) {
					this.character.transform.position[1] -= this.character.moveable.speed * delta;
				}
			},

			draw(context) {
				this.map.draw(context);
			},
		},
	},
};

Korea.Map = class extends You.Panel {
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

Korea.ObjectArrangement = class extends You.Object {
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

Korea.GameObject = class extends You.Object {

	#toBeReleased = false;

	constructor(name) {
		super(name);

		this.transform = {
			position: [0, 0],
			size: [0, 0],
		};

		this.anchor = [0, 0];
	}

	deleteObject() {
		this.#toBeReleased = true;
	}

	onUpdate(delta) {
		if (this.#toBeReleased && this.parent) {
			this.parent.removeComponents(this);
		}
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

Korea.Moveable = class extends You.Object {
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

Korea.SpriteRenderer = class extends You.Object {
	constructor(name) {
		super(name);

		this.sprite = null;
	}

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

Korea.Stats = class extends You.Object {
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

Korea.Attack = class extends You.Object {
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
					this.selectedObject.deleteObject();
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
}

Korea.HPRepresenter = class extends You.Object {
	onDraw(context) {
		let object = this.parent;

		context.save();

		context.fillStyle = 'rgba(255, 0, 0, 0.7)';
		context.fillRect(-object.transform.size[0] / 2, -object.transform.size[1] / 2 - 15, object.stats.hp / object.stats.maxhp * object.transform.size[0], 10);

		context.strokeStyle = 'black';
		context.strokeRect(-object.transform.size[0] / 2, -object.transform.size[1] / 2 - 15, object.transform.size[0], 10);

		context.restore();
	}
}

Korea.AI = class extends You.Object {
	constructor(name) {
		super(name);

		this.state = 'idle';

		this.sight = 0;

		this.aggressivePoint = 0;
		this.attackProgress = new Progress(0, 1, 1, 1, { begin: false, end: false });

		this.target = null;

		this.aggressiveImage = Korea.Asset.Image.load('youtube.png');
	}

	onUpdate(delta) {
		let map = this.parent.parent;

		if (this.state == 'idle') {
			for (let object of map.findComponents('#character')) {
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

						console.log('idle ->' + this.state);
					}
				}
			}

			let prob = Math.random();

			if (prob < 0.01) {
				console.log('idle -> explore')
				this.parent.moveable.destination = [Math.random() * map.size[0], Math.random() * map.size[1]];
				this.state = 'explore';
			}
		}
		else if (this.state == 'explore') {
			let prob = Math.random();

			if (prob < 0.01) {
				console.log('exp -> idle')
				this.parent.moveable.destination = null;
				this.state = 'idle';
			}
		}
		else if (this.state == 'aggressive') {
			let diff = this.target.transform.position.subv(this.parent.transform.position);
			let sq = diff.dotv(diff);

			this.attackProgress.update(delta);

			if (this.sight ** 2 < sq) {
				console.log('aggressive -> idle')
				this.target = null;
				this.parent.moveable.destination = null;
				this.attackProgress.current = 0;
				this.state = 'idle'
			}
			else if (this.parent.stats.attackRange ** 2 >= sq) {
				if (this.target.stats) {
					if (this.attackProgress.isFull) {
						console.log('attack!')
						this.target.stats.hp -= this.parent.stats.ap - this.target.stats.dp;
						this.attackProgress.current = 0;
					}
					if (Korea.debug) console.log(this.attackProgress.rate)
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
				console.log('follow -> idle')
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

Korea.Asset = {};
Korea.Asset.Image = class {
	
	static #data = new Map();
	static #refCount = new Map();

	static load(file) {
		if (this.#data.has(file)) {
			this.#refCount.set(file, this.#refCount.get(file) + 1);

			return this.#data.get(file);
		}
		else {
			let image = new Korea.Graphics.Image(file);

			if (image.loaded != null) {
				this.#data.set(file, image);
				this.#refCount.set(file, 1);
			}

			return image;
		}
	}

	static unload(file) {
		if (this.#data.has(file)) {
			this.#refCount.set(file, this.#refCount.get(file) - 1);

			if (this.#refCount.get(file) == 0) {
				this.#refCount.delete(file);

				this.#data.delete(file);
			}
		}
	}
};

Korea.Asset.Image.Loader = class {
	
	#images = [];

	load(...args) {
		args.forEach((e) => this.#images.push(new Korea.Asset.Image.load(e)));

		return this;
	}

	unload() {
		this.#images.forEach((e) => Korea.Asset.Image.unload(e.file));

		return this;
	}

	get rate() {
		return this.#images.filter((e) => e.loaded).length / this.#images.length;
	}

	get loaded() {
		return this.#images.every((e) => e.loaded);
	}
};

Korea.Graphics = {};
Korea.Graphics.Image = class {

	#loaded = false;

	constructor(file) {
		this.file = file;

		this.raw = new Image();

		this.raw.onload = () => {
			this.#loaded = true;
		}

		this.raw.onerror = () => {
			this.#loaded = null;
		}

		this.raw.src = 'image/' + file;
	}

	draw(context, ...args) {
		if (this.raw && this.#loaded) {
			context.drawImage(this.raw, ...args);
		}
	}

	get loaded() {
		return this.#loaded;
	}

	get width() {
		return this.#loaded ? this.raw.naturalWidth : null;
	}

	get height() {
		return this.#loaded ? this.raw.naturalHeight : null;
	}
};

Korea.Graphics.Sprite = class {
	constructor() {
		this.sheet = null;

		this.sx = 0;
		this.sy = 0;
		this.swidth = null;
		this.sheight = null;

		this.anchor = [0, 0];
		this.scale = [1, 1];
	}

	out() {
		this.sheet = null;
	}

	draw(context, x, y) {
		if (this.swidth == 0 || this.sheight == 0) {
			return;
		}

		if (this.sheet && this.sheet.loaded) {
			let [w, h] = [this.swidth || this.sheet.width, this.sheight || this.sheet.height];

			this.sheet.draw(context, this.sx, this.sy, w, h, x - w * this.anchor[0] * this.scale[0], y - h * this.anchor[1] * this.scale[1], w * this.scale[0], h * this.scale[1]);
		}
	}

	get width() {
		return this.swidth || (this.swidth == 0) ? 0 : this.sheet.width;
	}

	get height() {
		return this.sheight || (this.sheight == 0) ? 0 : this.sheet.height;
	}

	setSheet(sheet) {
		this.sheet = sheet || null;

		return this;
	}

	setSource(source) {
		let [sx, sy, swidth, sheight] = source;

		this.sx = sx || (sx == 0 ? sx : this.sx);
		this.sy = sy || (sy == 0 ? sy : this.sy);
		this.swidth = swidth || (swidth == 0 ? swidth : this.swidth);
		this.sheight = sheight || (sheight == 0 ? sheight : this.sheight);

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
};

Korea.Graphics.Frame = class {

	#action;

	constructor() {
		this.#action = null;
		this.time = 0;
		this.duration = 0;
	}

	update(delta, animator, animation) {
		this.#action.call(animator.parent instanceof Korea.GameObject ? animator.parent : null, delta, animator, animation)
	}

	setAction(action) {
		this.#action = action;

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
};

Korea.Graphics.Animation = class extends You.State {

	#playing = false;

	#progress = new Progress(0, 0, 1, 0, { begin: true, end: true });
	#frames = [];

	update(delta) {
		this.#progress.update(delta);

		let current = this.#progress.current;

		for (let frame of this.#frames) {
			if (frame.time <= current && current < frame.time + frame.duration) {
				frame.update(delta, this.parent, this);
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
		this.progress.speed = speed || 1;

		return this;
	}
};