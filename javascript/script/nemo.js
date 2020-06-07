var Nemo = {

	name: "Nemo",
	desc: "rectangle grow up game made by You",

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
					You.scene.transit(Nemo.scene.game);
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

		},

		main: {
			theme: {
				red: {
					button: {
						backgroundColor: 'rgba(255, 0, 0, 0.5)',
						textColor: '#fff',
					}
				}
			},

			menu: {
				stats: [10, 10, 60, 50, '상태', 'rgba(255, 0, 0, 0.5)'],
				upgrade: [80, 10, 100, 50, '업그레이드', 'rgba(255, 0, 0, 0.5)'],
				game: [190, 10, 80, 50, '게임 시작', 'rgba(255, 0, 0, 0.5)'],
			},
			upgradeButtons: {
				size: [150, 10, 100, 30, '$100', 'rgba(255, 0, 0, 0.5)'],
				speed: [150, 50, 100, 30, '$100', 'rgba(255, 0, 0, 0.5)'],
			},

			states: {
				stats: {
					in: function () {
						let size = this.characterStats.size;
						let color = this.characterStats.color;
						this.characterModel = new Nemo.GameObject(
							[-size/2, -size/2], new Nemo.Rectangle([0, 0], size, size), color, null
						);
					},
					update: function (delta) {
						let mouse_event = You.input.mouse;
						if (mouse_event) {
							if (mouse_event[0] == 'up') {
								let rect = You.canvas.getBoundingClientRect();
								let rx = mouse_event[1].clientX - rect.left;
								let ry = mouse_event[1].clientY - rect.top;
								this.hitButton(this.menu, [rx, ry], {
									stats: function () {
										// console.log('상태');
									},
									upgrade: function () {
										console.log('업그레이드');
										this.state = 'upgrade';
									},
									game: function () {
										console.log('게임 시작');
									}
								});
							}
						}
					},
					draw: function (context) {
						if (this.viewport(
							context,
							0, 70, You.canvas.width / 2, You.canvas.height - 70,
							() => {
								context.translate(You.canvas.width / 4, You.canvas.height / 2);
								if (this.characterModel)
									this.characterModel.draw(context);
							}
						) == false) {
							return;
						}

						if (this.viewport(
							context,
							You.canvas.width / 2, 70, You.canvas.width / 2, You.canvas.height - 70,
							() => {
								context.font = '15px Arial';
								context.fillStyle = '#fff';
								context.textAlign = 'left';
								context.textBaseline = 'top';
								context.fillText(`크기: ${this.characterStats.size}`, 10, 10);
								context.fillText(`이동속도: ${this.characterStats.speed}`, 10, 30);
							}
						) == false) {
							return;
						}
					}
				},
				upgrade: {
					in: function () {

					},
					update: function (delta) {
						let mouse_event = You.input.mouse;
						if (mouse_event) {
							if (mouse_event[0] == 'up') {
								let rect = You.canvas.getBoundingClientRect();
								let rx = mouse_event[1].clientX - rect.left;
								let ry = mouse_event[1].clientY - rect.top;
								this.hitButton(this.menu, [rx, ry], {
									stats: function () {
										console.log('상태');
										this.state = 'stats';
									},
									upgrade: function () {
										// console.log('업그레이드');
									},
									game: function () {
										console.log('게임 시작')
									}
								});
							}
						}
					},
					draw: function (context) {
						if (this.viewport(
							context,
							0, 70, You.canvas.width, You.canvas.height - 70,
							() => {
								context.font = '15px Arial';
								context.fillStyle = '#fff';
								context.textAlign = 'left';
								context.textBaseline = 'middle';
								context.fillText('크기 업그레이드', 10, 10 + 15);
								context.fillText('이동속도 업그레이드', 10, 50 + 15);

								for (let button in this.upgradeButtons) {
									this.drawButton(this.upgradeButtons[button], context);
								}
							}
						) == false) {
							return;
						}
					}
				}
			},

			characterStats: {
				size: 10,
				speed: 10,
				color: '#fff',
			},

			in: function () {
				this.state = 'stats';
				this.states[this.state].in.call(this);
			},
			out: function () {
				this.state = null;
			},
			update: function (delta) {
				this.states[this.state].update.call(this, delta);
			},
			draw: function (context) {
				for (let item in this.menu) {
					this.drawButton(this.menu[item], context);
				}

				this.states[this.state].draw.call(this, context);
			},
			viewport: function (context, x, y, width, height, func) {
				context.save();
				context.translate(x, y);
				context.beginPath();
				context.rect(0, 0, width, height);
				context.clip();
				let result = func.call(this);
				context.restore();

				return result;
			},
			hitButton: function (buttons, mouse, actions) {
				let [mx, my] = mouse;
				for (let button in buttons) {
					let [bx, by, bw, bh, ..._] = buttons[button];
					if (bx <= mx && mx < bx+bw && by <= my && my < by+bh) {
						actions[button].call(this);
						break;
					}
				}
			},
			drawButton: function (button, context, theme=null) {
				let [bx, by, bw, bh, text, color] = button;
				context.save();
				context.fillStyle = theme ? theme.button.backgroundColor : color;
				context.fillRect(bx, by, bw, bh);
				context.font = "15px Arial";
				context.textBaseline = 'middle';
				context.textAlign = 'center';
				context.fillStyle = theme ? theme.button.textColor : '#fff';
				context.fillText(text, bx + bw/2, by + bh/2);
				context.restore();
			}
		},

		game: {

			score: 0,

			character: null,

			objects: null,
			object_count: 0,
			object_timer: null,

			states: {
				game: function (delta) {
					if (You.input.key.down(Input.KEY_ESCAPE)) {
						this.state = 'menu';
					}

					if (You.input.key.press(Input.KEY_LEFT)) {
						this.character.transform.position[0] -= this.character.speed * delta;
					}
					else if (You.input.key.press(Input.KEY_RIGHT)) {
						this.character.transform.position[0] += this.character.speed * delta;
					}
					if (You.input.key.press(Input.KEY_UP)) {
						this.character.transform.position[1] -= this.character.speed * delta;
					}
					else if (You.input.key.press(Input.KEY_DOWN)) {
						this.character.transform.position[1] += this.character.speed * delta;
					}

					this.object_timer.update(delta);
					if (this.object_timer.isFull) {
						prob = Math.random();
						if (prob > 0.8) {
							this.object_count += 1;
						}
						else if (prob < 0.1) {
							this.object_count = Math.max(this.object_count - 1, 0);
						}
					}

					this.objects.forEach((o) => o.update(delta));
					let reset = false;
					for (let o of this.objects) {
						if (this.character.findComponent('bc')[0].hit(o)) {
							if (this.character.getArea() > o.getArea()) {
								// if (o.tags.includes('normal')) {
								// 	// this.character.growUp(Math.sqrt(o.getArea()));
								// }
								// else if (o.tags.includes('speedUp')) {
								// 	this.character.findComponent('m')[0].speed *= 1.5;
								// }
								// else if (o.tags.includes('reset')) {
								// 	reset = true;
								// }
								this.character.growUp(Math.sqrt(o.getArea()));
								this.score += Math.sqrt(o.getArea());
								if (You.canvas.width * You.canvas.height < this.character.getArea()) {
									// Game Clear
									You.scene.transit(Nemo.scene.game_over, this.score, "Game Clear");
									return;
								}
							}
							else {
								// Game Over
								You.scene.transit(Nemo.scene.game_over, this.score, "Game Over");
								return;
							}
						}
					}
					if (reset) {
						this.objects = [];
						this.object_count = 10;
					}

					// console.log('---')
					// console.log(this.objects.length)
					this.objects = this.objects.filter((o) => o.hit([0, 0, You.canvas.width, You.canvas.height]));
					// console.log(this.objects.length)
					this.objects = this.objects.filter((o) => !o.hit(this.character));
					// console.log(this.objects.length)

					this.generateObject(this.objects, this.object_count, this.character.getArea());
				},
				menu: function (delta) {
					if (You.input.key.down(Input.KEY_ESCAPE)) {
						this.state = 'game';
					}


				}
			},
			state: null,

			in: function() {
				this.score = 0;

				this.character = new Nemo.GO('player');
				this.character.transform.position = [ (You.canvas.width - 10) / 2, (You.canvas.height - 10) / 2 ];
				this.character.addComponent(new Nemo.SR('sr', 10, 10, '#fff'));
				this.character.addComponent(new Nemo.NemoObject('n'));
				this.character.addComponent(new Nemo.BoxCollider('bc', 10, 10));
				this.character.tags = ['player'];
				this.character.speed = 100;
				this.character.hit = (...args) => this.character.findComponent('bc')[0].hit(...args);
				this.character.growUp = () => this.character.findComponent('n')[0].growUp();
				this.character.getArea = () => this.character.findComponent('n')[0].getArea();

				this.objects = [];
				this.object_count = 10;
				this.object_timer = new Progress(0, 1, 2, 0);

				this.state = 'game';

				// Menu
			},

			out: function() {
				this.score = 0;

				this.objects = null;
				this.object_count = 0;
				this.object_timer = null;

				this.character = null;
			},

			update: function(delta) {
				this.states[this.state].call(this, delta);
			},

			draw: function(context) {
				this.character.draw(context);

				this.objects.forEach((o) => o.draw(context));

				context.globalAlpha = 1;
				context.font = "12px Arial";
				context.textBaseline = "top";
				context.fillStyle = "#fff";
				context.textAlign = "left";
				context.fillText("Score ", 10, 10);
				context.textAlign = "right";
				context.fillText("" + Math.floor(this.score), 100, 10);

				context.textAlign = "left";
				context.fillText("Object ", 10, 30);
				context.textAlign = "right";
				context.fillText("" + Math.floor(this.objects.length), 100, 30);

				if (this.state == 'menu') {
					context.globalAlpha = 0.5;
					context.fillStyle = '#000';
					context.fillRect(0, 0, You.canvas.width, You.canvas.height);

					// Menu Box
					context.globalAlpha = 1;
					context.fillStyle = '#555';
					context.fillRect((You.canvas.width - 200) / 2, 100, 200, 300);
				}
			},

			generateObject: function(objects, maxCount, objectSize) {
				while (objects.length < maxCount) {
					let prob_size = Math.random();

					let maxSize = 10;
					let a = 1;
					let size = Math.sqrt(objectSize) + (prob_size - 1 / 2) * (a * prob_size * (prob_size - 1) + 2 * maxSize / 1);

					let direction_x = Math.floor(Math.random() * 2) * 2 - 1;

					let x = (direction_x > 0) ? 0 - size : You.canvas.width;
					let y = random(0, You.canvas.height - size);

					let prob_type = Math.random() * 100;
					let type = prob_type > 5 ? 0 : prob_type > 3 ? 1 : 2;

					let obj = new Nemo.GO('object');
					obj.transform.position = [x, y];
					obj.addComponent(new Nemo.SR('sr', size, size,
						type == 0 ? 'rgb(255, ' + Math.floor(size / You.canvas.width * 1000) + ', 0)' :
						type == 1 ? '#55f' :
						'#5f5'));
					obj.addComponent(new Nemo.M('m', [ direction_x, 0 ], random(20, 200)));
					obj.addComponent(new Nemo.BoxCollider('bc', size, size));
					obj.addComponent(new Nemo.NemoObject('n'));
					obj.tags.push(type == 0 ? 'normal' : type == 1 ? 'speedUp' : 'reset');
					obj.hit = (...args) => obj.findComponent('bc')[0].hit(...args);
					obj.growUp = () => obj.findComponent('n')[0].growUp();
					obj.getArea = () => obj.findComponent('n')[0].getArea();
					objects.push(obj);

					// objects.push(new Nemo.Moveable(
					// 	[x, y],
					// 	new Nemo.Rectangle([0, 0], size, size),
					// 	'rgb(255, ' + Math.floor(size / You.canvas.width * 1000) + ', 0)',
					// 	type,
					// 	[ direction_x, 0 ],
					// 	random(20, 200)
					// ));
				}
			}

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
						// You.scene.transit(Nemo.scene.title);
						You.scene.pop();
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

}

Nemo.Rectangle = class {
	constructor(anchor, width, height) {
		this.anchor = anchor;
		this.width = width;
		this.height = height;
	}

	hit(position, shape, sposition) {
		if (shape instanceof Nemo.Rectangle) {
			let [x, y] = [ position[0] + this.anchor[0], position[1] + this.anchor[1] ];
			let [sx, sy] = [ sposition[0] + shape.anchor[0], sposition[1] + shape.anchor[1] ];
			return sx < x + this.width && x < sx + shape.width && sy < y + this.height && y < sy + shape.height;
		}
	}

	getArea() {
		return this.width * this.height;
	}

	enlarge(amount) {
		let oldSize = Math.sqrt(this.width * this.height);
		let newSize = Math.sqrt(amount + this.width * this.height);
		this.width = this.height = newSize;
		this.anchor.map((e) => e * newSize / oldSize);
	}

	draw(context, position, color) {
		context.fillStyle = color;
		context.fillRect(position[0] + this.anchor[0], position[1] + this.anchor[1], this.width, this.height);
	}
}

Nemo.Object = class {
	constructor(name) {
		this.parent = null;

		this.name = name;
		this.enable = true;
		this.components = [];
		this.tags = [];
	}

	addComponent(component) {
		if (!component) {
			throw 'argumentError';
		}

		component.parent = this;
		this.components.push(component);

		return this;
	}

	removeComponent(component) {
		if (!component) {
			throw 'argumentError';
		}

		let idx = this.components.indexOf(component);
		if (idx > -1) {
			this.components.splice(idx, 1).parent = null;
		}

		return this;
	}

	findComponent(expression) {
		let [name, ...tags] = expression.split('#');
		let found = [];

		loopComponent:
		for (let c of this.components) {
			if (!(name && c.name == name)) {
				continue;
			}

			for (let tag of tags) {
				if (!c.tags.includes(tag)) {
					continue loopComponent;
				}
			}

			found.push(c);
		}

		return found;
	}

	// tag

	update(delta) {
		this.onUpdate(delta);
		this.components.forEach((c) => c.update(delta));
	}
	onUpdate(delta) {}

	draw(context) {
		this.onDraw(context);
		this.components.forEach((c) => c.draw(context));
	}
	onDraw(context) {}
}

Nemo.SR = class extends Nemo.Object {
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
Nemo.GO = class extends Nemo.Object {
	constructor(name) {
		super(name);

		this.transform = {
			position: [ 0, 0 ],
			scale: [ 1, 1 ],
			rotate: [ 0, 0 ],
		};
	}
}

Nemo.M = class extends Nemo.Object {
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


Nemo.Collider = class extends Nemo.Object {
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
		else if (collider instanceof Nemo.Object) {
			// console.log(collider)
			// console.trace();
			// console.dir(this.hit(collider.findComponent('bc')[0]))
			return this.hit(collider.findComponent('bc')[0]);
		}
	}
}

Nemo.NemoObject = class extends Nemo.Object {
	constructor(name) {
		super(name);
	}

	growUp(amount) {
		console.log(amount);
		debugger;
		console.log(this.parent.findComponent('sr')[0]);
		let sr = this.parent.findComponent('sr')[0];
		let size = Math.sqrt(this.width ** 2 + amount);
		sr.width = sr.height = size;
	}

	getArea() {
		let sr = this.parent.findComponent('sr')[0];
		return sr.width * sr.height;
	}
}


Nemo.GameObject = class {
	constructor(position, shape, color, type) {
		this.position = position;
		this.shape = shape;
		this.color = color;
		this.type = type;

		if (type == 1) {
			this.color = "#5555ff";
		}
		else if (type == 2) {
			this.color = "#55ff55";
		}
	}

	hit(object) {
		if (object instanceof Array) {
			return this.shape.hit(this.position, new Nemo.Rectangle([0, 0], object[2], object[3]), [object[0], object[1]]);
		}
		return this.shape.hit(this.position, object.shape, object.position);
	}

	getArea() {
		return this.shape.getArea();
	}

	growUp(amount) {
		this.shape.enlarge(amount);
	}

	update(delta) {

	}

	draw(context) {
		this.shape.draw(context, this.position, this.color);
	}
}

Nemo.Moveable = class extends Nemo.GameObject {
	constructor(position, shape, color, type, direction, speed) {
		super(position, shape, color, type);
		this.direction = direction;
		this.speed = speed;
	}

	move(delta) {
		this.position[0] += this.direction[0] * this.speed * delta;
		this.position[1] += this.direction[1] * this.speed * delta;
	}

	update(delta) {
	}
}
