var Nemo = {

	name: "Nemo",
	desc: "rectangle grow up game made by You",

	Rect2: class {
		constructor(x, y, width, height, color, direction, speed, type) {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
			this.color = color;
			this.direction = direction;
			this.speed = speed;
			this.type = type;

			if (this.type == 1) {
				this.color = "#5555ff";
			}
			else if (this.type == 2) {
				this.color = "#55ff55";
			}
		}

		update(delta) {

		}

		draw(context) {

		}

		hit(rect) {

		}

	},

	Rect: function(x, y, width, height, color, direction, speed, type) {

		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
		this.direction = direction;
		this.speed = speed;
		this.type = type;

		if (this.type == 1) {
			this.color = "#5555ff";
		}
		else if (this.type == 2) {
			this.color = "#55ff55";
		}

		this.update = function(delta) {
			this.x += (this.direction ? this.speed : -this.speed) * delta;
		};

		this.draw = function(context) {
			context.fillStyle = this.color;
			context.fillRect(this.x, this.y, this.width, this.height);
		};

		this.hit = function(rect) {
			return (this.x < rect.x + rect.width && rect.x < this.x + this.width) && (this.y < rect.y + rect.height && rect.y < this.y + this.height);
		}

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

			objects: null,
			object_count: 0,
			object_timer: null,

			character: null,

			// state: 0,

			in: function() {
				this.score = 0;

				this.character = new Nemo.Rect((You.canvas.width - 10) / 2, (You.canvas.height - 10) / 2, 10, 10, "rgb(255, 255, 255)", null, 100, 0);

				this.objects = [];
				this.object_count = 10;
				this.object_timer = new Progress(0, 1, 2, 0);
				this.object_timer.onfull = (who, delta) => {
					prob = Math.random() * 100;
					if (prob > 80) { this.object_count += 1; }
					else if (prob < 10) { this.object_count = Math.max(this.object_count - 1, 0); }
					who.current += who.speed * delta - who.end + who.begin;
					return false;
				};

				this.generateObject(this.objects, this.object_count, this.character);

				return this;
			},

			out: function() {
				this.score = 0;

				this.objects = null;
				this.object_count = 0;
				this.object_timer = null;

				this.character = null;
			},

			update: function(delta) {
				if (You.input.key.press(Input.KEY_LEFT)) {
					this.character.x -= this.character.speed * delta;
				}
				else if (You.input.key.press(Input.KEY_RIGHT)) {
					this.character.x += this.character.speed * delta;
				}
				if (You.input.key.press(Input.KEY_UP)) {
					this.character.y -= this.character.speed * delta;
				}
				else if (You.input.key.press(Input.KEY_DOWN)) {
					this.character.y += this.character.speed * delta;
				}

				this.object_timer.update(delta);

				this.objects.forEach((o) => o.update(delta));
				let reset = false;
				for (let o of this.objects) {
					if (this.character.hit(o)) {
						if (this.character.width * this.character.height > o.width * o.height) {
							if (o.type == 0) {
								this.character.width = this.character.height = Math.sqrt(this.character.width * this.character.height + Math.sqrt(o.width * o.height));
							}
							else if (o.type == 1) {
								this.character.speed *= 1.5;
							}
							else if (o.type == 2) {
								reset = true;
							}
							this.score += Math.sqrt(o.width * o.height);
							if (You.canvas.width < this.character.width) {
								// Game Clear
								You.scene.transit(Nemo.scene.game_over, this.score, "Game Clear");
								return;
							}
						}
						else {
							// Game over
							You.scene.transit(Nemo.scene.game_over, this.score, "Game Over");
							return;
						}
					}
				}
				if (reset) {
					this.objects = [];
					this.object_count = 1;
				}

				this.objects = this.objects.filter((o) => !(o.x + o.width < 0 || You.canvas.width < o.x || o.hit(this.character)));

				this.generateObject(this.objects, this.object_count, this.character);
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
			},

			generateObject: function(objects, max_count, character) {
				while (objects.length < max_count) {
					let p_size = random(0, 100);
					let size = 0;
					if (p_size < 10) {
						size = (3 * p_size + 20) * character.width / 100;
					}
					else if (p_size < 90) {
						size = ((p_size - 90) * 3 / 160 + 2) * character.width;
					}
					else {
						size = ((p_size - 100) * 3 / 10 + 5) * character.width;
					}
					// let size = (p_size * (p_size * (p_size - 150) + 14250) / 200000 + 0.2) * character.width;
					let direction = Math.floor(Math.random() * 2);
					let x = (direction) ? 0 - size : You.canvas.width;
					let y = random(0, You.canvas.height - size);
					let prob = Math.random() * 100;
					let type = prob > 5 ? 0 : prob > 3 ? 1 : 2;
					objects.push(new Nemo.Rect(x, y, size, size, "rgb(255, " + Math.floor(size / You.canvas.width * 1000) + ", 0)", direction, random(20, 200), type));
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