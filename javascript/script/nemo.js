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

		game: {

			score: 0,

			character: null,

			objects: null,
			object_count: 0,
			object_timer: null,

			states: {
				game: function () {
					if (You.input.key.down(Input.KEY_ESCAPE)) {
						this.state = 'menu';
					}

					if (You.input.key.press(Input.KEY_LEFT)) {
						this.character.position[0] -= this.character.speed * delta;
					}
					else if (You.input.key.press(Input.KEY_RIGHT)) {
						this.character.position[0] += this.character.speed * delta;
					}
					if (You.input.key.press(Input.KEY_UP)) {
						this.character.position[1] -= this.character.speed * delta;
					}
					else if (You.input.key.press(Input.KEY_DOWN)) {
						this.character.position[1] += this.character.speed * delta;
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
						if (this.character.hit(o)) {
							if (this.character.getArea() > o.getArea()) {
								if (o.type == 0) {
									this.character.growUp(Math.sqrt(o.getArea()));
								}
								else if (o.type == 1) {
									this.character.speed *= 1.5;
								}
								else if (o.type == 2) {
									reset = true;
								}
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

					this.objects = this.objects.filter((o) => !(!o.hit([0, 0, You.canvas.width, You.canvas.height]) || o.hit(this.character)));

					this.generateObject(this.objects, this.object_count, this.character.getArea());
				},
				menu: function () {

				}
			},
			state: null,

			in: function() {
				this.score = 0;

				this.character = new Nemo.Moveable(
					[ (You.canvas.width - 10) / 2, (You.canvas.height - 10) / 2 ],
					new Nemo.Rectangle([0, 0], 10, 10),
					"rgb(255, 255, 255)",
					null,
					null,
					100
				)

				this.objects = [];
				this.object_count = 10;
				this.object_timer = new Progress(0, 1, 2, 0);

				this.state = 'game';
			},

			out: function() {
				this.score = 0;

				this.objects = null;
				this.object_count = 0;
				this.object_timer = null;

				this.character = null;
			},

			update: function(delta) {
				this.states[this.state].call(this);
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

				if (state == 'menu') {

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

					objects.push(new Nemo.Moveable(
						[x, y],
						new Nemo.Rectangle([0, 0], size, size),
						'rgb(255, ' + Math.floor(size / You.canvas.width * 1000) + ', 0)',
						type,
						[ direction_x, 0 ],
						random(20, 200)
					));
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

	getBoundingBox() {
		let bb = this.shape.getBoundingBox();
		return [this.position[0]+bb[0], this.position[1]+bb[1], bb[2], bb[3]];
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
		this.move(delta);
	}
}
