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
			},
			{
				size: [1, 10, 1, 100], // level, current, next, price
				speed: [1, 100, 0.5, 100],
				color: 'white',
				money: 10000,
			},
			{
				size: [1, 10, 1, 100], // level, current, next, price
				speed: [1, 100, 0.5, 100],
				color: 'white',
				money: 10000,
			},
			{
				size: [1, 10, 1, 100], // level, current, next, price
				speed: [1, 100, 0.5, 100],
				color: 'white',
				money: 10000,
			},
			{
				size: [1, 10, 1, 100], // level, current, next, price
				speed: [1, 100, 0.5, 100],
				color: 'white',
				money: 10000,
			},
			{
				size: [1, 10, 1, 100], // level, current, next, price
				speed: [1, 100, 0.5, 100],
				color: 'white',
				money: 10000,
			},

		],
		character: null,
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
				this.prgMessage = new Progress(2, 8, 10, 2, { begin: false, end: false });

				this.logo = You.Asset.Image.load('logo.png');
			},

			out() {
				this.prgMessage = null;
			},

			update(delta) {
				this.prgMessage.update(delta);

				if (this.prgMessage.isEmpty || this.prgMessage.isFull) { this.prgMessage.speed *= -1; }

				if (You.Input.key.down('Enter')) {
					You.Scene.transit(Nemo.scene.character);
				}
			},

			draw(context) {
				context.save();

				this.logo.draw(context, 10, 10, You.canvas.width / 30, You.canvas.height / 30);

				context.globalAlpha = 1;
				context.fillStyle = "#fff";
				context.font = "24px Arial";
				context.textAlign = "center";
            	context.textBaseline = "middle";
				context.fillText("Nemo", You.canvas.width / 2, You.canvas.height / 3);

				context.globalAlpha = this.prgMessage.rate;
				context.font = "12px Arial";
				context.fillText("press Enter key to continue", You.canvas.width / 2, You.canvas.height * 3 / 4);

				context.restore();
			},
		},

		character: {
			in() {
				let [sw, sh] = [You.canvas.width, You.canvas.height];

				this.panel = new You.ScrollPanel('panel')
								.setPosition([sw * 2 / 20, sh * 2 / 20])
								.setSize([sw * 16 / 20, sh * 16 / 20])
								.setPanelSize([sw * 16 / 20, sh * (3 * Nemo.asset.characters.length - 1) / 20])
								.setColor('rgba(255, 0, 0, 0.1)')
								.setClip(true);

				for (let i = 0; i < Nemo.asset.characters.length; i++) {
					let button = new You.Button('button' + i)
								.setPosition([0, sh * 3 * i / 20 ])
								.setSize([sw * 16 / 20, sh * 2 / 20])
								.setPadding([10, 10])
								.setText(`소지금 ${Nemo.asset.characters[i].money}
										크기 ${Nemo.asset.characters[i].size[1]}
										이동속도 ${Nemo.asset.characters[i].speed[1]}`)
								.setAlign('left')
								.setVAlign('top')
								.setBackgroundColor('rgba(255, 255, 255, 0.1)');

					button.addHandler(() => {
						You.Scene.transit(Nemo.scene.main, i);
					});

					this.panel.addComponents(button);
				}

				this.title = new You.Text('title')
								.setPosition([0, 0])
								.setSize([sw, sh / 10])
								.setFont('24px Arial')
								.setText('Character')
								.setAlign('center')
								.setVAlign('middle');
			},

			out() {
				this.panel = null;
			},

			update(delta) {
				this.panel.update(delta);
			},

			draw(context) {
				this.title.draw(context);

				this.panel.draw(context);
			},
		},

		main: {
			in(characterIndex) {
				if (characterIndex != undefined) {
					Nemo.asset.character = Nemo.asset.characters[characterIndex];
				}

				let [sw, sh] = [You.canvas.width, You.canvas.height];
				
				this.states = new You.State.Context('state context')
									.addComponents(
										new Nemo.StatsState('stats state', this),
										new Nemo.UpgradeState('upgrade state', this)
									);

				this.states.transit('stats state');

				this.buttons = {
					menu: {
						stats: new You.Button('stats button')
								.setPosition([10, 10])
								.setSize([60, 50])
								.setText('상태')
								.setAlign('center')
								.setVAlign('middle')
								.setBackgroundColor('rgba(255, 0, 0, 0.5)'),
						upgrade: new You.Button('upgrade button')
								.setPosition([80, 10])
								.setSize([100, 50])
								.setText('업그레이드')
								.setAlign('center')
								.setVAlign('middle')
								.setBackgroundColor('rgba(255, 0, 0, 0.5)'),
						game: new You.Button('game button')
								.setPosition([190, 10])
								.setSize([80, 50])
								.setText('게임 시작')
								.setAlign('center')
								.setVAlign('middle')
								.setBackgroundColor('rgba(255, 0, 0, 0.5)'),
						exit: new You.Button('exit button')
								.setPosition([280, 10])
								.setSize([80, 50])
								.setText('게임 종료')
								.setAlign('center')
								.setVAlign('middle')
								.setBackgroundColor('rgba(255, 0, 0, 0.5)'),
					},
					upgrade: {
						size: new You.Button('upgrade button')
								.setPosition([160, 80])
								.setSize([100, 30])
								.setText(`$${Nemo.asset.character.size[3]}`)
								.setAlign('center')
								.setVAlign('middle')
								.setBackgroundColor('rgba(255, 0, 0, 0.5)'),
						speed: new You.Button('upgrade button')
								.setPosition([160, 120])
								.setSize([100, 30])
								.setText(`$${Nemo.asset.character.speed[3]}`)
								.setAlign('center')
								.setVAlign('middle')
								.setBackgroundColor('rgba(255, 0, 0, 0.5)'),
					},
				};

				this.buttons.menu.stats.addHandler(() => {
					if (this.states.state.name != 'stats state') {
						this.states.transit('stats state');
					}
				});

				this.buttons.menu.upgrade.addHandler(() => {
					if (this.states.state.name != 'upgrade state') {
						this.states.transit('upgrade state');
					}
				});

				this.buttons.menu.game.addHandler(() => {
					You.Scene.transit(Nemo.scene.game);
				});

				this.buttons.menu.exit.addHandler(() => {
					You.Scene.transit(Nemo.scene.title);
				});

				this.buttons.upgrade.size.addHandler(() => {
					let stats = Nemo.asset.character;
					if (stats.size[0] < 10 && stats.money >= stats.size[3]) {
						stats.size[0]++;
						stats.size[1] += stats.size[2];
						stats.size[2] = stats.size[2] * (stats.size[0] + 1);
						stats.money -= stats.size[3];
						stats.size[3] = stats.size[3] * (stats.size[0] + 3);
						this.buttons.upgrade.size.setText('$' + stats.size[3]);
					}
				});

				this.buttons.upgrade.speed.addHandler(() => {
					let stats = Nemo.asset.character;
					if (stats.speed[0] < 10 && stats.money >= stats.speed[3]) {
						stats.speed[0]++;
						stats.speed[1] += stats.speed[2];
						stats.speed[2] = stats.speed[2] * (stats.speed[0] + 1);
						stats.money -= stats.speed[3];
						stats.speed[3] = stats.speed[3] * (stats.speed[0] + 3);
						this.buttons.upgrade.speed.setText('$' + stats.speed[3]);
					}
				});
			},

			out() {
				this.states = null;
			},

			update(delta) {
				this.states.update(delta);

				for (let k in this.buttons) {
					for (let l in this.buttons[k]) {
						this.buttons[k][l].update(delta)
					}
				}
			},

			draw(context) {
				this.states.draw(context);
			},
		},

		game: {
			in: function() {
				this.score = 0;

				let size = Nemo.asset.character.size[1];
				let color = Nemo.asset.character.color;

				this.character = new Nemo.NemoObject('player');
				this.character.transform.position = [ (You.canvas.width - 10) / 2, (You.canvas.height - 10) / 2 ];
				this.character.addComponents(
					new Nemo.Rectangle('sr', size, size, color),
					new Nemo.BoxCollider('bc', size, size)
				);
				this.character.tags = ['player'];
				this.character.speed = 100;
				this.character.hit = (...args) => this.character.findComponent('bc').hit(...args);

				this.objects = [];
				this.objectCount = 10;

				this.objectGenerator = new Nemo.ObjectGenerator('object generator', this);

				this.controller = new Nemo.GameController('controller', this);
			},

			out: function() {
				Nemo.asset.character.money += parseInt(this.score / 10);
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
			in(score, result) {
				// this.bgm.currentTime = 0;
				// this.bgm.play();
				this.score = score;
				this.result = result;

				this.prgTitle = new Progress(0, 1, 5, null, { begin: false, end: false });
				this.prgMessage = new Progress(2, 8, 10, 2, { begin: false, end: false });
			},

			out() {
				// this.bgm.pause();
				// this.bgm.currentTime = 0;
				this.score = 0;
				this.result = null;
				this.prgTitle = null;
				this.prgMessage = null;
			},

			update(delta) {
				this.prgTitle.update(delta);
				this.prgMessage.update(delta);

				if (this.prgMessage.isEmpty || this.prgMessage.isFull) { this.prgMessage.speed *= -1; }

				if (You.Input.key.down('Enter')) {
					if (this.prgTitle.isFull) {
						You.Scene.transit(Nemo.scene.main);
						return;
					}
				}
			},

			draw(context) {
				context.globalAlpha = this.prgTitle.rate;
				context.font = "24px Arial";
				context.fillStyle = "#fff";
				context.textAlign = "center";
            	context.textBaseline = "middle";
				context.fillText(this.result, You.canvas.width / 2, You.canvas.height / 3);

				if (this.prgTitle.isFull) {
					context.globalAlpha = this.prgMessage.rate;
					context.font = "12px Arial";
					context.fillText("press Enter key to continue", You.canvas.width / 2, You.canvas.height * 3 / 4);
				}

				context.globalAlpha = 1;
				context.font = "14px Arial";
				context.fillText("Score ", You.canvas.width / 2, You.canvas.height / 2);
				context.fillText(`${Math.floor(this.score)}`, You.canvas.width / 2, You.canvas.height / 2 + 20);
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
};

Nemo.GameObject = class extends You.Object {
	constructor(name) {
		super(name);

		this.transform = {
			position: [ 0, 0 ],
			scale: [ 1, 1 ],
			rotate: [ 0, 0 ],
		};
	}

	// draw(context, ...args) {
	// 	context.save();

	// 	context.translate(...this.transform.position);
	// 	context.scale(...this.transform.scale);
	// 	context.rotate(...this.transform.rotate);

	// 	this.onDraw(context, ...args);
	// 	this.components.forEach((c) => c.draw(context, ...args));

	// 	context.restore();
	// }
};

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
};

Nemo.Collider = class extends You.Object {
	hit(collider) {}
};

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
			return this.hit(collider.findComponent('bc'));
		}
	}
};

Nemo.NemoObject = class extends Nemo.GameObject {
	// constructor(name) {
	// 	super(name);
	// }

	growUp(amount) {
		let sr = this.sr;
		let bc = this.findComponent('bc');
		let size = Math.sqrt(sr.width ** 2 + amount);
		sr.width = sr.height = size;
		bc.width = bc.height = size;
		console.dir(sr.width);
	}

	getArea() {
		let sr = this.findComponent('sr');
		return sr.width * sr.height;
	}
};

// Main Scene
Nemo.StatsState = class extends You.State {
	constructor(name, scene) {
		super(name);

		this.scene = scene;

		let size = Nemo.asset.character.size[1];
		let color = Nemo.asset.character.color;

		this.model = new Nemo.GameObject('player');
		this.model.transform.position = [ -size / 2, -size / 2 ];
		this.model.addComponents(new Nemo.Rectangle('sr', 10, 10, color));
		this.model.tags = ['model'];
		this.model.speed = 100;
	}

	onUpdate(delta) {
		let scene = this.scene;

		let mouse_event = You.Input.mouse;
		if (mouse_event) {
			if (mouse_event[0] == 'up') {
				let rect = You.canvas.getBoundingClientRect();

				let rx = mouse_event[1].clientX - rect.left;
				let ry = mouse_event[1].clientY - rect.top;

				Object.values(scene.buttons.menu).forEach((button) => button.handle([rx, ry]));
			}
		}
	}

	onDraw(context) {
		Object.values(this.scene.buttons.menu).forEach((button) => button.draw(context));

		context.font = '15px Arial';
		context.fillStyle = '#fff';
		context.textAlign = 'left';
		context.textBaseline = 'middle';

		context.fillText(`소지금: ${Nemo.asset.character.money}`, You.canvas.width - 100, 30);

		context.save();

		context.translate(You.canvas.width / 4, You.canvas.height / 2);

		if (this.model) {
			this.model.draw(context);
		}

		context.restore();

		context.translate(You.canvas.width / 2, 70);

		context.textBaseline = 'top';

		context.fillText(`크기: ${Nemo.asset.character.size[1]}`, 10, 10);
		context.fillText(`이동속도: ${Nemo.asset.character.speed[1]}`, 10, 30);
	}
};

Nemo.UpgradeState = class extends You.State {
	constructor(name, scene) {
		super(name);

		this.scene = scene;
	}

	onUpdate(delta) {
		let scene = this.scene;

		let mouse_event = You.Input.mouse;
		if (mouse_event) {
			if (mouse_event[0] == 'up') {
				let rect = You.canvas.getBoundingClientRect();

				let rx = mouse_event[1].clientX - rect.left;
				let ry = mouse_event[1].clientY - rect.top;

				Object.values(scene.buttons.menu).forEach((button) => button.handle([rx, ry]));

				Object.values(scene.buttons.upgrade).forEach((button) => button.handle([rx, ry]));
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

		context.fillText(`소지금: ${Nemo.asset.character.money}`, You.canvas.width - 100, 30);
		
		context.fillText('크기 업그레이드', 10, 80 + 15);
		context.fillText('이동속도 업그레이드', 10, 120 + 15);

		Object.values(scene.buttons.upgrade).forEach((button) => button.draw(context));
	}
};

// Game Scene
Nemo.GameState = class extends You.State {
	constructor(name, scene) {
		super(name);

		this.scene = scene;
	}

	onUpdate(delta) {
		let scene = this.scene

		if (You.Input.key.down('Escape')) {
			this.transit('menu state');
		}

		if (You.Input.key.press('ArrowLeft')) {
			scene.character.transform.position[0] -= scene.character.speed * delta;
		}
		else if (You.Input.key.press('ArrowRight')) {
			scene.character.transform.position[0] += scene.character.speed * delta;
		}
		if (You.Input.key.press('ArrowUp')) {
			scene.character.transform.position[1] -= scene.character.speed * delta;
		}
		else if (You.Input.key.press('ArrowDown')) {
			scene.character.transform.position[1] += scene.character.speed * delta;
		}

		scene.objects.forEach((o) => o.update(delta));

		let reset = false;

		for (let o of scene.objects) {
			if (scene.character.findComponent('bc').hit(o)) {
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
						You.Scene.transit(Nemo.scene.game_over, scene.score, "Game Clear");
						return;
					}
				}
				else {
					// Game Over
					You.Scene.transit(Nemo.scene.game_over, scene.score, "Game Over");
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
};

Nemo.MenuState = class extends You.State {
	constructor(name, scene) {
		super(name);

		this.scene = scene;
	}

	onUpdate(delta) {
		if (You.Input.key.down('Escape')) {
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
};

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
			obj.addComponents(new Nemo.Rectangle('sr', size, size,
				type == 0 ? 'rgb(255, ' + Math.floor(size / You.canvas.width * 1000) + ', 0)' :
				type == 1 ? '#55f' :
				'#5f5'
			));
			obj.addComponents(
				new Nemo.Moveable('m', [ direction_x, 0 ], random(20, 200)),
				new Nemo.BoxCollider('bc', size, size)
			);
			// obj.addComponents(new Nemo.NemoObject('n'));
			obj.tags.push(type == 0 ? 'normal' : type == 1 ? 'speedUp' : 'reset');
			obj.hit = (...args) => obj.findComponent('bc').hit(...args);
			// obj.growUp = () => obj.findComponent('n').growUp();
			// obj.getArea = () => obj.findComponent('n').getArea();
			scene.objects.push(obj);
		}
	}
};

Nemo.GameController = class extends You.Object {
	constructor(name, scene) {
		super(name);

		this.scene = scene;

		this.states = new You.State.Context('state context');

		this.gameState = new Nemo.GameState('game state', scene);
		this.menuState = new Nemo.MenuState('menu state', scene);

		this.states.addComponents(
			this.gameState,
			this.menuState
		);

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
};