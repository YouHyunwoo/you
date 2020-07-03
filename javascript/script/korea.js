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
				// 1. 테스트 맵 생성
				// 2. 테스트 캐릭터 생성
				// 3. 캐릭터 움직임
				// 4. 캐릭터 애니메이션
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
							.setSize([200, 200])
							.setColor('rgba(255, 255, 255, 0.2)')
							.addComponents(
								new Korea.ObjectArrangement('object arrangement')
							);

				// 2. 테스트 캐릭터 생성
				this.character = new Korea.GameObject('character')
									.setPosition([10, 10])
									.setSize([50, 50])
									.addComponents(
										new Korea.SpriteRenderer('sprite renderer')
											.setSprite(
												new Korea.Graphics.Sprite()
												.setSheet(Korea.Graphics.Image.load('logo.png'))
											)
									);

				this.map.addComponents(this.character);
			},

			out() {

			},

			update(delta) {
				// this.map.update(delta);

				if (You.Input.key.press('a')) {
					this.character.transform.position[0] -= 100 * delta;
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

	onUpdate(delta) {}
	onDraw(context) {
		super.onDraw(context);

		if (this.background) {
			context.save();

			this.background.draw(context, ...this.position, ...this.size);

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
	}

	setPosition(position) {
		this.transform.position = position;

		return this;
	}

	setSize(size) {
		this.transform.size = size;

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
	}

	setSprite(sprite) {
		this.sprite = sprite || null;

		return this;
	}
};

Korea.Graphics = {};
Korea.Graphics.Image = class {

	#loaded = false;

	constructor() {
		this.raw = null;
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

	setImage(image) {
		this.raw = image || null;

		return this;
	}

	static load(file) {
		let image = new this();

		let raw = new Image();

		raw.onload = () => {
			image.#loaded = true;
		}

		raw.src = 'image/' + file;

		return image.setImage(raw);
	}
};

// Korea.Asset.Image = class {};

Korea.Graphics.Sprite = class {
	constructor() {
		this.sheet = null;

		this.sx = 0;
		this.sy = 0;
		this.swidth = null;
		this.sheight = null;
	}

	out() {
		this.sheet = null;
	}

	draw(context, ...args) {
		if (this.sheet && this.sheet.loaded) {
			if (args.length == 2) {
				let [w, h] = [this.swidth || this.sheet.width, this.sheight || this.sheet.height];
				// console.log([this.sx, this.sy, w, h, ...args, w, h]);
				this.sheet.draw(context, this.sx, this.sy, w, h, ...args, w, h);
			}
			else if (args.length == 4) {
				let [w, h] = [this.swidth || this.sheet.width, this.sheight || this.sheet.height];

				this.sheet.draw(context, this.sx, this.sy, w, h, ...args);
			}
			else {
				this.sheet.draw(context, ...args);
			}
		}
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
};

Korea.Graphics.Animation = class {

	#apply = null;
	#interpolator = null;

	#progress = null; // start:0, end:1, speed:1, repeat:$repeat, limit:!$repeat
	#on = false;
	

	constructor(object) {
		// all property -> set get
		// set: changed
	}

	play() {
		this.#on = true;
	}

	pause() {
		this.#on = false;
	}

	stop() {
		this.#on = false;
		this.#progress.current = this.#progress.start;
	}

	update(delta) {
		if (this.#apply) {
			this.#interpolator.update(delta);
			this.#apply(this.#interpolator.value);
		}
	}

	setApply(apply) {
		this.#apply = apply || null;
	}

	setInterpolator(animator) {
		this.animator = animator || null;

		return this;
	}

	setSpeed(speed) {
		this.progress.speed = speed || 1;

		return this;
	}
};

Korea.Graphics.IInterpolator = class {
	constructor() {
		this.value = 0;
	}

	update(delta) {
		this.value = 0;
	}
};

// Korea.Graphics.Interpolator.Linear = class extends Korea.Graphics.IInterpolator {
// 	update(delta) {
// 		this.value += delta;
// 	}
// };