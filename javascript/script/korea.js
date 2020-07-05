var Korea = {

	name: "Korea",
	desc: "made by You",

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
				// 5. 테스트 몬스터 생성
				// 6. 캐릭터 근접 공격, 주문
				// 7. 몬스터 AI
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
							.setSize([500, 500])
							.setColor('rgba(255, 255, 255, 0.2)')
							.addComponents(
								new Korea.ObjectArrangement('object arrangement')
							);

				// 2. 테스트 캐릭터 생성
				this.character = new Korea.GameObject('character')
									.setPosition([10, 10])
									.setSize([50, 50])
									.setAnchor([0.5, 0.5])
									.addComponents(
										new Korea.SpriteRenderer('sprite renderer')
											.setSprite(
												new Korea.Graphics.Sprite()
												.setSheet(Korea.Asset.Image.load('tree.png'))
												.setAnchor([0.5, 0.5])
											)
									);


				this.map.addComponents(this.character);

				// 3. 캐릭터 움직임

				// 4. 캐릭터 애니메이션

				// 5. 
			},

			out() {

			},

			update(delta) {
				// this.map.update(delta);

				if (You.Input.key.press('a')) {
					this.character.transform.position[0] -= 100 * delta;
				}

				if (You.Input.key.press('d')) {
					this.character.transform.position[0] += 100 * delta;
				}

				if (You.Input.key.press('s')) {
					this.character.transform.position[1] += 100 * delta;
				}

				if (You.Input.key.press('w')) {
					this.character.transform.position[1] -= 100 * delta;
				}
			},

			draw(context) {
				this.map.draw(context);

				context.fillStyle = `rgba(255, 255, 255, ${this.light})`;
				context.fillRect(0, 0, You.canvas.width, You.canvas.height);
			},
		},
	},
};

Korea.Map = class extends You.Panel {
	constructor(name) {
		super(name);

		this.background = null;
	}

	onUpdate(delta) {}
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

		this.componenets.sort((a, b) => {
			if (a instanceof Korea.GameObject && b instanceof Korea.GameObject) {
				return a.transform.position[1] + a.transform.size[1] / 2 - b.transform.position[1] + b.transform.size[1] / 2;
			}

			return 0;
		});
	}
};

Korea.GameObject = class extends You.Object {
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

Korea.SpriteRenderer = class extends You.Object {
	constructor(name) {
		super(name);

		this.sprite = null;
	}

	onDraw(context) {
		if (this.sprite) {
			this.sprite.draw(context, this.parent.transform.size[0] * this.parent.anchor[0], this.parent.transform.size[1] * this.parent.anchor[1]);
		}

		context.fillStyle = 'rgba(255, 0, 0, 0.5)';
		context.fillRect(0, 0, ...this.parent.transform.size);
	}

	setSprite(sprite) {
		this.sprite = sprite || null;

		return this;
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

Korea.Graphics.Sprite = class {
	constructor() {
		this.sheet = null;

		this.sx = 0;
		this.sy = 0;
		this.swidth = null;
		this.sheight = null;

		this.anchor = [0, 0];
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

			this.sheet.draw(context, this.sx, this.sy, w, h, x - w * this.anchor[0], y - h * this.anchor[1], w, h);
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
};

Korea.Graphics.Frame = class {
	constructor(animation) {
		this.#animation = animation;

		this.sprite = null;
		this.action = null;
		this.duration = 0;
	}

	update(delta) {
		this.action(delta);
	}

	draw(context) {
		this.sprite.draw(context, 0, 0);
	}

	setSprite(sprite) {
		this.sprite = sprite;

		return this;
	}

	setAction(action) {
		this.action = action;

		return this;
	}

	setDuration(duration) {
		this.duration = duration;

		return this;
	}
};

// Korea.Graphics.Animator = class extends You.Object {

// 	#animations = null;

// 	update(delta) {
// 		if (this.#animations) {
// 			this.#animations.forEach((e) => e.update(delta);
// 		}
// 	}
// }

Korea.Graphics.Animation = class extends You.Object {

	#playing = false;

	#progress = new Progress(0, 0, 1, 0, { begin: true, end: true });
	#frames = [];

	update(delta) {
		this.#progress.update(delta);

		let current = this.#progress.current;

		for (let [time, frame] of this.#frames) {
			if (time <= current && current < time + frame.duration) {
				frame.update(delta);
			}
		}
	}

	addFrame(time, frame) {
		this.#frames.push([time, frame]);

		let last = time + frame.duration;

		if (this.#progress.end < last) {
			this.#progress.end = last;
		}
	}

	play() {
		this.#playing = true;
	}

	pause() {
		this.#playing = false;
	}

	stop() {
		this.#playing = false;
		this.#progress.current = this.#progress.start;
	}

	setSpeed(speed) {
		this.progress.speed = speed || 1;

		return this;
	}
};

Korea.Graphics.Interpolator = class {
	constructor() {
		this.value = 0;
	}

	update(delta) {}
};

Korea.Graphics.Interpolator.Linear = class extends Korea.Graphics.Interpolator {
	update(delta) {
		this.value += delta;
	}
};