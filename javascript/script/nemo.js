var Nemo = {

	name: "Nemo",
	desc: "rectangle grow up game made by You",

	asset: {
		characters: [
			{
				size: [1, 10, 1, 100], // level, current, next, price
				speed: [1, 100, 0.5, 100],
				color: 'white',
				money: 10000,
			}
		],
		stats: {
			size: [1, 10, 1, 100], // level, current, next, price
			speed: [1, 100, 0.5, 100],
			color: 'white',
			money: 10000,
		},
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
					You.scene.transit(Nemo.scene.character);
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
				context.fillText("Nemo", You.canvas.width / 2, You.canvas.height / 3);

				context.globalAlpha = this.prg_cont.rate;
				context.font = "12px Arial";
				context.fillText("press Enter to continue", You.canvas.width / 2, You.canvas.height * 3 / 4);

				context.restore();
			}
		},

		character: {
			in() {
				this.margin = {
					left: 50,
					right: 50,
					top: 50,
					bottom: 50
				};

				this.inner = {
					width: You.canvas.width - this.margin.left - this.margin.right,
					height: You.canvas.height - this.margin.top - this.margin.bottom
				}

				this.buttons = {
					choices: {
						stats: new You.Button('stats button')
								.setPosition([10, 10])
								.setSize([60, 50])
								.setText('상태')
								.setTextAlign('center')
								.setTextVerticalAlign('middle')
								.setBackgroundColor('rgba(255, 0, 0, 0.5)'),
						upgrade: new You.Button('upgrade button')
								.setPosition([80, 10])
								.setSize([100, 50])
								.setText('업그레이드')
								.setTextAlign('center')
								.setTextVerticalAlign('middle')
								.setBackgroundColor('rgba(255, 0, 0, 0.5)'),
						game: new You.Button('game button')
								.setPosition([190, 10])
								.setSize([80, 50])
								.setText('게임 시작')
								.setTextAlign('center')
								.setTextVerticalAlign('middle')
								.setBackgroundColor('rgba(255, 0, 0, 0.5)'),
					}
				};

				this.controller = new Nemo.MainController('main controller', this);
			},
			out() {
				this.controller = null;
			},
			update(delta) {
				this.controller.update(delta);
			},
			draw(context) {
				this.controller.draw(context);
			},
		},

		main: {
			in: function () {
				this.buttons = {
					menu: {
						stats: new You.Button('stats button')
								.setPosition([10, 10])
								.setSize([60, 50])
								.setText('상태')
								.setTextAlign('center')
								.setTextVerticalAlign('middle')
								.setBackgroundColor('rgba(255, 0, 0, 0.5)'),
						upgrade: new You.Button('upgrade button')
								.setPosition([80, 10])
								.setSize([100, 50])
								.setText('업그레이드')
								.setTextAlign('center')
								.setTextVerticalAlign('middle')
								.setBackgroundColor('rgba(255, 0, 0, 0.5)'),
						game: new You.Button('game button')
								.setPosition([190, 10])
								.setSize([80, 50])
								.setText('게임 시작')
								.setTextAlign('center')
								.setTextVerticalAlign('middle')
								.setBackgroundColor('rgba(255, 0, 0, 0.5)'),
					},
					upgrade: {
						size: new You.Button('upgrade button')
								.setPosition([160, 80])
								.setSize([100, 30])
								.setText(`$${Nemo.asset.stats.size[3]}`)
								.setTextAlign('center')
								.setTextVerticalAlign('middle')
								.setBackgroundColor('rgba(255, 0, 0, 0.5)'),
						speed: new You.Button('upgrade button')
								.setPosition([160, 120])
								.setSize([100, 30])
								.setText(`$${Nemo.asset.stats.speed[3]}`)
								.setTextAlign('center')
								.setTextVerticalAlign('middle')
								.setBackgroundColor('rgba(255, 0, 0, 0.5)'),
					},
				};

				this.controller = new Nemo.MainController('main controller', this);
			},

			out: function () {
				this.controller = null;
			},

			update: function (delta) {
				this.controller.update(delta);
			},

			draw: function (context) {
				this.controller.draw(context);
			},
		},

		game: {
			in: function() {
				this.score = 0;

				let size = Nemo.asset.stats.size[1];
				let color = Nemo.asset.stats.color;

				this.character = new Nemo.NemoObject('player'); // NemoObject
				this.character.transform.position = [ (You.canvas.width - 10) / 2, (You.canvas.height - 10) / 2 ];
				this.character.addComponent(new Nemo.Rectangle('sr', size, size, color));
				this.character.addComponent(new Nemo.BoxCollider('bc', size, size));
				this.character.tags = ['player'];
				this.character.speed = 100;
				this.character.hit = (...args) => this.character.findComponent('bc')[0].hit(...args);

				this.objects = [];
				this.objectCount = 10;

				this.objectGenerator = new Nemo.ObjectGenerator('object generator', this);

				this.controller = new Nemo.GameController('controller', this);
			},

			out: function() {
				Nemo.asset.stats.money += parseInt(this.score / 10);
				this.score = 0;

				this.character = null;

				this.objects = [];
				this.objectCount = 0;

				this.objectGenerator = null;

				this.controller = null;
			},

			update: function(delta) {
				this.controller.update(delta);
			},

			draw: function(context) {
				this.controller.draw(context);
			},
		},

		game_over: {
			// bgm: new Audio("audio/Dana.mp3"),
			score: 0,
			state: null,

			in: function(score, state) {
				// this.bgm.currentTime = 0;
				// this.bgm.play();
				this.score = score;
				this.state = state;
				this.prg_title = new Progress(0, 1, 5, null, { begin: false, end: false });
				this.prg_cont = new Progress(2, 8, 10, 2, { begin: false, end: false });

				return this;
			},

			out: function() {
				// this.bgm.pause();
				// this.bgm.currentTime = 0;
				this.score = 0;
				this.state = null;
				this.prg_title = null;
				this.prg_cont = null;
			},

			update: function(delta) {
				this.prg_title.update(delta);
				this.prg_cont.update(delta);

				if (this.prg_cont.isEmpty || this.prg_cont.isFull) { this.prg_cont.speed *= -1; }

				if (You.input.key.down(Input.KEY_ENTER)) {
					if (this.prg_title.isFull) {
						You.scene.transit(Nemo.scene.main);
						return;
					}
				}
			},

			draw: function(context) {
				context.globalAlpha = this.prg_title.rate;
				context.font = "24px Arial";
				context.fillStyle = "#fff";
				context.textAlign = "center";
            	context.textBaseline = "middle";
				context.fillText(this.state, You.canvas.width / 2, You.canvas.height / 3);

				if (this.prg_title.isFull) {
					context.globalAlpha = this.prg_cont.rate;
					context.font = "12px Arial";
					context.fillText("press Enter to continue", You.canvas.width / 2, You.canvas.height * 3 / 4);
				}

				context.globalAlpha = 1;
				context.font = "14px Arial";
				context.textBaseline = "top";
				context.fillText("Score ", You.canvas.width / 2, You.canvas.height / 2);
				context.fillText("" + Math.floor(this.score), You.canvas.width / 2, You.canvas.height / 2 + 20);
			},
		}
	}
};



Nemo.Rectangle = class extends You.Object {
	constructor(name, width, height, color) {
		super(name);

		this.width = width;
		this.height = height;
		this.color = color;
	}

	onDraw(context) {
		context.fillStyle = this.color;
		context.fillRect(this.parent.transform.position[0], this.parent.transform.position[1], this.width, this.height);
	}
}

Nemo.GameObject = class extends You.Object {
	constructor(name) {
		super(name);

		this.transform = {
			position: [ 0, 0 ],
			scale: [ 1, 1 ],
			rotate: [ 0, 0 ],
		};
	}
}

Nemo.Moveable = class extends You.Object {
	constructor(name, direction, speed) {
		super(name);

		this.direction = direction;
		this.speed = speed;
	}

	onUpdate(delta) {
		this.parent.transform.position[0] += this.direction[0] * this.speed * delta;
		this.parent.transform.position[1] += this.direction[1] * this.speed * delta;
	}
}

Nemo.Collider = class extends You.Object {
	constructor(name) {
		super(name);
	}

	hit(collider) {

	}
}

Nemo.BoxCollider = class extends Nemo.Collider {
	constructor(name, width, height) {
		super(name);

		this.width = width;
		this.height = height;
	}

	hit(collider) {
		if (collider instanceof Array) {
			let [x, y] = this.parent.transform.position;
			let [cx, cy, cw, ch] = collider;
			return cx < x + this.width && x < cx + cw && cy < y + this.height && y < cy + ch;
		}
		else if (collider instanceof Nemo.BoxCollider) {
			let [x, y] = this.parent.transform.position;
			let [sx, sy] = collider.parent.transform.position;
			return sx < x + this.width && x < sx + collider.width && sy < y + this.height && y < sy + collider.height;
		}
		else if (collider instanceof You.Object) {
			return this.hit(collider.findComponent('bc')[0]);
		}
	}
}

Nemo.NemoObject = class extends Nemo.GameObject {
	constructor(name) {
		super(name);
	}

	growUp(amount) {
		let sr = this.sr;
		let bc = this.findComponent('bc')[0];
		let size = Math.sqrt(sr.width ** 2 + amount);
		sr.width = sr.height = size;
		bc.width = bc.height = size;
		console.dir(sr.width);
	}

	getArea() {
		let sr = this.findComponent('sr')[0];
		return sr.width * sr.height;
	}
}

// Character Scene
Nemo.SelectState = class extends You.State {
	constructor(name, scene) {
		super(name);

		this.scene = scene;
	}

	onUpdate(delta) {
		let mouse_event = You.input.mouse;
		if (mouse_event) {
			if (mouse_event[0] == 'up') {
				let rect = You.canvas.getBoundingClientRect();

				let rx = mouse_event[1].clientX - rect.left;
				let ry = mouse_event[1].clientY - rect.top;

				Object.values(scene.buttons.menu).forEach((button) => button.handleMouse([rx, ry]));
			}
		}
	}

	onDraw(context) {
		context.save();

		context.beginPath();
		context.rect(this.margin.left, this.margin.top, this.inner.width, this.inner.height);
		context.clip();

		context.font = '15px Arial';
		context.textAlign = 'left';
		context.textBaseline = 'top';
		
		for (let i = 0; i < Nemo.asset.characters.length; i++) {
			context.fillStyle = 'rgba(255, 255, 255, 0.1)';
			context.fillRect(this.margin.left, this.margin.top, this.inner.width, 100);

			context.fillStyle = 'white';
			context.fillText(`소지금 ${Nemo.asset.characters[i].money}`, this.margin.left + 10, this.margin.top + 10);
			context.fillText(`크기 ${Nemo.asset.characters[i].size[1]}`, this.margin.left + 10, this.margin.top + 30);
			context.fillText(`이동속도 ${Nemo.asset.characters[i].speed[1]}`, this.margin.left + 10, this.margin.top + 50);
		}
		
		context.restore();
	}
}

Nemo.CharacterController = class extends You.Object {
	constructor(name, scene) {
		super(name);

		this.scene = scene;

		this.states = new You.State.Context('state context')
							.addComponent(new Nemo.SelectState('select state', scene));

		this.states.transit('select state');

		// scene.
	}

	onUpdate(delta) {
		this.states.update(delta);
	}

	onDraw(context) {
		this.states.draw(context);
	}
}

// Main Scene
Nemo.StatsState = class extends You.State {
	constructor(name, scene) {
		super(name);

		this.scene = scene;

		let size = Nemo.asset.stats.size[1];
		let color = Nemo.asset.stats.color;

		this.model = new Nemo.GameObject('player');
		this.model.transform.position = [ -size / 2, -size / 2 ];
		this.model.addComponent(new Nemo.Rectangle('sr', 10, 10, color));
		this.model.tags = ['model'];
		this.model.speed = 100;
	}

	onUpdate(delta) {
		let scene = this.scene;

		let mouse_event = You.input.mouse;
		if (mouse_event) {
			if (mouse_event[0] == 'up') {
				let rect = You.canvas.getBoundingClientRect();

				let rx = mouse_event[1].clientX - rect.left;
				let ry = mouse_event[1].clientY - rect.top;

				Object.values(scene.buttons.menu).forEach((button) => button.handleMouse([rx, ry]));
			}
		}
	}

	onDraw(context) {
		Object.values(this.scene.buttons.menu).forEach((button) => button.draw(context));

		context.font = '15px Arial';
		context.fillStyle = '#fff';
		context.textAlign = 'left';
		context.textBaseline = 'middle';

		context.fillText(`소지금: ${Nemo.asset.stats.money}`, You.canvas.width - 100, 30);

		context.save();

		context.translate(You.canvas.width / 4, You.canvas.height / 2);

		if (this.model) {
			this.model.draw(context);
		}

		context.restore();

		context.translate(You.canvas.width / 2, 70);

		context.textBaseline = 'top';

		context.fillText(`크기: ${Nemo.asset.stats.size[1]}`, 10, 10);
		context.fillText(`이동속도: ${Nemo.asset.stats.speed[1]}`, 10, 30);
	}
}

Nemo.UpgradeState = class extends You.State {
	constructor(name, scene) {
		super(name);

		this.scene = scene;
	}

	onUpdate(delta) {
		let scene = this.scene;

		let mouse_event = You.input.mouse;
		if (mouse_event) {
			if (mouse_event[0] == 'up') {
				let rect = You.canvas.getBoundingClientRect();

				let rx = mouse_event[1].clientX - rect.left;
				let ry = mouse_event[1].clientY - rect.top;

				Object.values(scene.buttons.menu).forEach((button) => button.handleMouse([rx, ry]));

				Object.values(scene.buttons.upgrade).forEach((button) => button.handleMouse([rx, ry]));
			}
		}
	}

	onDraw(context) {
		let scene = this.scene;

		Object.values(scene.buttons.menu).forEach((button) => button.draw(context));

		context.font = '15px Arial';
		context.fillStyle = '#fff';
		context.textAlign = 'left';
		context.textBaseline = 'middle';

		context.fillText(`소지금: ${Nemo.asset.stats.money}`, You.canvas.width - 100, 30);
		
		context.fillText('크기 업그레이드', 10, 80 + 15);
		context.fillText('이동속도 업그레이드', 10, 120 + 15);

		Object.values(scene.buttons.upgrade).forEach((button) => button.draw(context));
	}
}

Nemo.MainController = class extends You.Object {
	constructor(name, scene) {
		super(name);

		this.scene = scene;



		this.states = new You.State.Context('state context')
							.addComponent(new Nemo.StatsState('stats state', scene))
							.addComponent(new Nemo.UpgradeState('upgrade state', scene));

		this.states.transit('stats state');

		scene.buttons.menu.stats.addHandler(() => {
			if (this.states.state.name != 'stats state') {
				this.states.transit('stats state');
			}
		});

		scene.buttons.menu.upgrade.addHandler(() => {
			if (this.states.state.name != 'upgrade state') {
				this.states.transit('upgrade state');
			}
		});

		scene.buttons.menu.game.addHandler(() => {
			You.scene.transit(Nemo.scene.game);
		});

		scene.buttons.upgrade.size.addHandler(() => {
			let stats = Nemo.asset.stats;
			if (stats.size[0] < 10 && stats.money >= stats.size[3]) {
				stats.size[0]++;
				stats.size[1] += stats.size[2];
				stats.size[2] = stats.size[2] * (stats.size[0] + 1);
				stats.money -= stats.size[3];
				stats.size[3] = stats.size[3] * (stats.size[0] + 3);
				scene.buttons.upgrade.size.setText('$' + stats.size[3]);
			}
		});

		scene.buttons.upgrade.speed.addHandler(() => {
			let stats = Nemo.asset.stats;
			if (stats.speed[0] < 10 && stats.money >= stats.speed[3]) {
				stats.speed[0]++;
				stats.speed[1] += stats.speed[2];
				stats.speed[2] = stats.speed[2] * (stats.speed[0] + 1);
				stats.money -= stats.speed[3];
				stats.speed[3] = stats.speed[3] * (stats.speed[0] + 3);
				scene.buttons.upgrade.speed.setText('$' + stats.speed[3]);
			}
		});
	}

	onUpdate(delta) {
		this.states.update(delta);
	}

	onDraw(context) {
		this.states.draw(context);
	}
}

// Game Scene
Nemo.GameState = class extends You.State {
	constructor(name, scene) {
		super(name);

		this.scene = scene;
	}

	onUpdate(delta) {
		let scene = this.scene

		if (You.input.key.down(Input.KEY_ESCAPE)) {
			this.transit('menu state');
		}

		if (You.input.key.press(Input.KEY_LEFT)) {
			scene.character.transform.position[0] -= scene.character.speed * delta;
		}
		else if (You.input.key.press(Input.KEY_RIGHT)) {
			scene.character.transform.position[0] += scene.character.speed * delta;
		}
		if (You.input.key.press(Input.KEY_UP)) {
			scene.character.transform.position[1] -= scene.character.speed * delta;
		}
		else if (You.input.key.press(Input.KEY_DOWN)) {
			scene.character.transform.position[1] += scene.character.speed * delta;
		}

		scene.objects.forEach((o) => o.update(delta));

		let reset = false;

		for (let o of scene.objects) {
			if (scene.character.findComponent('bc')[0].hit(o)) {
				if (scene.character.getArea() > o.getArea()) {
					if (o.tags.includes('normal')) {

					}
					else if (o.tags.includes('speedUp')) {
						scene.character.speed *= 1.5;
					}
					else if (o.tags.includes('reset')) {
						reset = true;
					}

					scene.character.growUp(Math.sqrt(o.getArea()));
					scene.score += Math.sqrt(o.getArea());

					if (You.canvas.width * You.canvas.height < scene.character.getArea()) {
						// Game Clear
						You.scene.transit(Nemo.scene.game_over, scene.score, "Game Clear");
						return;
					}
				}
				else {
					// Game Over
					You.scene.transit(Nemo.scene.game_over, scene.score, "Game Over");
					return;
				}
			}
		}

		if (reset) {
			scene.objects = [];
			scene.objectCount = 10;
		}

		scene.objects = scene.objects.filter((o) => o.hit([0, 0, You.canvas.width, You.canvas.height]));
		scene.objects = scene.objects.filter((o) => !o.hit(scene.character));

		scene.objectGenerator.update(delta);
	}

	onDraw(context) {
		let scene = this.scene;

		scene.character.draw(context);

		scene.objects.forEach((o) => o.draw(context));

		context.globalAlpha = 1;
		context.font = '12px Arial';
		context.textBaseline = 'top';
		context.fillStyle = '#fff';
		context.textAlign = 'left';
		context.fillText('Score ', 10, 10);
		context.textAlign = 'right';
		context.fillText('' + Math.floor(scene.score), 100, 10);

		context.textAlign = 'left';
		context.fillText('Object ', 10, 30);
		context.textAlign = 'right';
		context.fillText('' + Math.floor(scene.objects.length), 100, 30);
	}
}

Nemo.MenuState = class extends You.State {
	constructor(name, scene) {
		super(name);

		this.scene = scene;
	}

	onUpdate(delta) {
		if (You.input.key.down(Input.KEY_ESCAPE)) {
			this.transit('game state');
		}
	}

	onDraw(context) {
		context.globalAlpha = 0.5;
		context.fillStyle = '#000';
		context.fillRect(0, 0, You.canvas.width, You.canvas.height);

		context.globalAlpha = 1;
		context.fillStyle = '#555';
		context.fillRect((You.canvas.width - 200) / 2, 100, 200, 300);
	}
}

Nemo.GameController = class extends You.Object {
	constructor(name, scene) {
		super(name);

		this.scene = scene;

		this.states = new You.State.Context('state context');

		this.gameState = new Nemo.GameState('game state', scene);
		this.menuState = new Nemo.MenuState('menu state', scene);

		this.states.addComponent(this.gameState);
		this.states.addComponent(this.menuState);

		this.states.transit('game state');
	}

	onUpdate(delta) {
		this.states.update(delta);
	}

	onDraw(context) {
		this.gameState.draw(context);

		if (this.states.state.name == 'menu state') {
			this.menuState.draw(context);
		}
	}
}

Nemo.ObjectGenerator = class extends You.Object {
	constructor(name, scene) {
		super(name);

		this.scene = scene;

		this.generationProgress = new Progress(0, 1, 2, 0);
	}

	onUpdate(delta) {
		let scene = this.scene;

		this.generationProgress.update(delta);
		if (this.generationProgress.isFull) {
			let prob = Math.random();
			if (prob > 0.8) {
				scene.objectCount += 1;
			}
			else if (prob < 0.1) {
				scene.objectCount = Math.max(scene.objectCount - 1, 0);
			}
		}

		let objectSize = scene.character.getArea();
		while (scene.objects.length < scene.objectCount) {
			let prob_size = Math.random();

			let maxSize = 10;
			let a = 1;
			let size = Math.sqrt(objectSize) + (prob_size - 1 / 2) * (a * prob_size * (prob_size - 1) + 2 * maxSize / 1);
			// let size = Math.sqrt(objectSize) - 5;

			let direction_x = Math.floor(Math.random() * 2) * 2 - 1;

			let x = (direction_x > 0) ? 0 - size : You.canvas.width;
			let y = random(0, You.canvas.height - size);

			let prob_type = Math.random() * 100;
			let type = prob_type > 5 ? 0 : prob_type > 3 ? 1 : 2;

			let obj = new Nemo.NemoObject('object');
			obj.transform.position = [x, y];
			obj.addComponent(new Nemo.Rectangle('sr', size, size,
				type == 0 ? 'rgb(255, ' + Math.floor(size / You.canvas.width * 1000) + ', 0)' :
				type == 1 ? '#55f' :
				'#5f5'
			));
			obj.addComponent(new Nemo.Moveable('m', [ direction_x, 0 ], random(20, 200)));
			obj.addComponent(new Nemo.BoxCollider('bc', size, size));
			// obj.addComponent(new Nemo.NemoObject('n'));
			obj.tags.push(type == 0 ? 'normal' : type == 1 ? 'speedUp' : 'reset');
			obj.hit = (...args) => obj.findComponent('bc')[0].hit(...args);
			// obj.growUp = () => obj.findComponent('n')[0].growUp();
			// obj.getArea = () => obj.findComponent('n')[0].getArea();
			scene.objects.push(obj);
		}
	}
}