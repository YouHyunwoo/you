var Tetris = {

	name: "Tetris",
	desc: "normal tetris game made by You",
	
	PANEL: { ROW: 20, COLUMN: 12 },
	TILE_SIZE: 0,
	BLOCK:	[
		[ [1, 1, 1, 1] ],
		[ [ 1, 1 ], [ 1, 1] ],
		[ [ 0, 1, 0 ], [ 1, 1, 1 ] ],
		[ [ 1, 1, 1 ], [ 0, 0, 1 ] ],
		[ [ 1, 1, 1 ], [ 1, 0, 0 ] ],
		[ [ 1, 1, 0 ], [ 0, 1, 1 ] ],
		[ [ 0, 1, 1 ], [ 1, 1, 0 ] ],
	],

	Block: class {
		constructor(type, color, panel) {
			this.row = 0;
			this.column = Math.floor((panel.column - Tetris.BLOCK[type][0].length) / 2);
			this.tiles = Tetris.BLOCK[type];
			this.color = color;
		}

		draw(context, x, y) {
			context.save();
			context.fillStyle = this.color;
			context.strokeStyle = "#000";

			let size = Tetris.TILE_SIZE;

			if (x && y) {
				for (let r = 0; r < this.tiles.length; r++) {
					for (let c = 0; c < this.tiles[r].length; c++) {
						if (this.tiles[r][c]) {
							context.fillRect(x + c * size, y + r * size, size, size);
							context.strokeRect(x + c * size, y + r * size, size, size);
						}
					}
				}
			}
			else {
				for (let r = 0; r < this.tiles.length; r++) {
					for (let c = 0; c < this.tiles[r].length; c++) {
						if (this.tiles[r][c]) {
							context.fillRect((this.column + c) * size, (this.row + r) * size, size, size);
							context.strokeRect((this.column + c) * size, (this.row + r) * size, size, size);
						}
					}
				}
			}

			context.restore();
		}

		rotate(direction=CW) {
			if (direction != CW && direction != CCW) { return; }

			let nrow = this.tiles[0].length, ncol = this.tiles.length;

			let ntile = new Array(nrow);
			for (let r = 0; r < nrow; r++) {
				ntile[r] = new Array(ncol);
				for (let c = 0; c < ncol; c++) {
					ntile[r][c] = (direction == CW) ? this.tiles[ncol - 1 - c][r] : this.tiles[c][nrow - 1 - r];
				}
			}

			this.tiles = ntile;
		}
	},

	Panel: class {
		constructor(row, column) {
			this.row = row;
			this.column = column;

			this.tiles = new Array(row);
			for (let i = 0; i < row; i++) {
				this.tiles[i] = new Array(column);
			}

			// this.audio = new Audio("audio/Glass_and_Metal_Collision.mp3");
		}

		draw(context, x=0, y=0) {
			context.save();
			context.strokeStyle = "#333";

			let size = Tetris.TILE_SIZE;

			for (let r = 0; r < this.row; r++) {
				for (let c = 0; c < this.column; c++) {
					if (this.tiles[r][c]) {
						context.fillStyle = this.tiles[r][c];
						context.fillRect(x + c * size, y + r * size, size, size);
					}
					context.strokeRect(x + c * size, y + r * size, size, size);
				}
			}

			context.restore();
		}

		contains(block) {
			return (0 <= block.column && block.column + block.tiles[0].length <= this.column) && (block.row + block.tiles.length <= this.row);
		}

		isBlocked(block) {
			if (!this.contains(block)) { return true; }

			for (let r = 0; r < block.tiles.length; r++) {
				for (let c = 0; c < block.tiles[r].length; c++) {
					if (this.tiles[block.row + r][block.column + c] && block.tiles[r][c]) { return true; }
				}
			}

			return false;
		}

		setBlock(block) {
			for (let r = 0; r < block.tiles.length; r++) {
				for (let c = 0; c < block.tiles[r].length; c++) {
					if (block.tiles[r][c]) { this.tiles[block.row + r][block.column + c] = block.color; }
				}
			}
		}

		isFullLine(row) {
			for (let c = 0; c < this.tiles[row].length; c++) {
				if (!this.tiles[row][c]) { return false; }
			}
			return true;
		}

		clearLine() {
			let lines = [];
			this.tiles.forEach((e, i, a) => {
				if (!this.isFullLine(this.tiles.length - 1 - i)) { lines.push(i); }
			});

			if (lines.length == this.row) { return 0; }

			// this.audio.currentTime = 0;
			// this.audio.play();

			for (let i = 0; i < this.tiles.length; i++) {
				if (i < lines.length) {
					if (i < lines[i]) { this.tiles[this.tiles.length - 1 - i] = this.tiles[this.tiles.length - 1 - lines[i]]; }
				}
				else {
					this.tiles[this.tiles.length - 1 - i] = new Array(this.column);
				}
			}

			return this.row - lines.length;
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
					You.scene.transit(Tetris.scene.game);
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
				context.fillText(Tetris.name, You.canvas.width / 2, You.canvas.height / 3);

				context.globalAlpha = this.prg_cont.rate;
				context.font = "12px Arial";
				context.fillText("press Enter to continue", You.canvas.width / 2, You.canvas.height * 3 / 4);

				context.restore();
			}
			
		},

		game: {

			// bgm: new Audio("audio/Beat_Your_Competition.mp3"),
			score: 0,

			panel: null,
			blocks: null,
			
			key_interval: 0,
			key_delay: 0,
			key_pressed: 0,

			in: function() {
				Tetris.TILE_SIZE = You.canvas.width / Tetris.PANEL.ROW;

				this._resize_handler = () => Tetris.TILE_SIZE = You.canvas.width / Tetris.PANEL.ROW;
				window.addEventListener('resize', this._resize_handler);

				// this.bgm.currentTime = 0;
				// this.bgm.play();

				this.score = 0;

				this.panel = new Tetris.Panel(20, 12);
				this.blocks = [];

				this.prg_block = new Progress(0, 6, 5);
				
				while (this.blocks.length < 2) {
					this.blocks.push(new Tetris.Block(Math.floor(Math.random() * 7), randomColor(4), this.panel));
				}

				return this;
			},

			out: function() {
				// this.bgm.pause();
				// this.bgm.currentTime = 0;
				window.removeEventListener('resize', this._resize_handler);
				this.panel = null;
				this.blocks = null;
				this.score = 0;
			},

			update: function(delta) {
				if (this.pressKey(Input.KEY_LEFT, delta)) {
					this.blocks[0].column--;
					if (this.panel.isBlocked(this.blocks[0])) { this.blocks[0].column++; }
				}
				if (this.pressKey(Input.KEY_RIGHT, delta)) {
					this.blocks[0].column++;
					if (this.panel.isBlocked(this.blocks[0])) { this.blocks[0].column--; }
				}
				if (this.pressKey(Input.KEY_UP, delta)) {
					this.blocks[0].rotate();
					let c = this.blocks[0].column;
					while (!this.panel.contains(this.blocks[0])) { this.blocks[0].column--; }
					if (this.panel.isBlocked(this.blocks[0])) { this.blocks[0].rotate(CCW); this.blocks[0].column = c; }
				}
				if (this.pressKey(Input.KEY_DOWN, delta)) {
					this.blocks[0].row++;
					if (this.panel.isBlocked(this.blocks[0])) {
						this.blocks[0].row--;
						this.score += Math.floor(Math.pow(2, this.landBlock()));
					}
				}
				if (this.pressKey(Input.KEY_SPACE, delta)) {
					while (!this.panel.isBlocked(this.blocks[0])) {
						this.blocks[0].row++;
					}
					this.blocks[0].row--;
					this.score += Math.floor(Math.pow(3, this.landBlock()));
				}

				this.prg_block.update(delta);
				this.prg_block.end -= 0.01 * delta;
				if (this.prg_block.isFull) {
					this.blocks[0].row++;
					if (this.panel.isBlocked(this.blocks[0])) {
						this.blocks[0].row--;
						this.score += Math.floor(Math.pow(2, this.landBlock()));
					}
				}

				if (this.panel.isBlocked(this.blocks[0])) {
					// Game Over
					You.scene.transit(Tetris.scene.game_over, this.score);
				}
			},

			draw: function(context) {
				this.panel.draw(context);
				if (this.blocks.length > 0) { this.blocks[0].draw(context); }

				let left = this.panel.column * Tetris.TILE_SIZE, right = You.canvas.width, top = 0, bottom = You.canvas.height;

				context.font = "14px Arial";
				context.textBaseline = "top";
				context.fillStyle = "#fff";
				context.fillText("Score ", left + 10, top + 10);
				context.textAlign = "right";
				context.fillText("" + this.score, right - 10, top + 10);

				context.textBaseline = "middle";
				context.textAlign = "center";
				context.fillText("Next", (left + right) / 2, top + 50);
				context.strokeStyle = "#eee";
				context.strokeRect(left + 30, top + 70, right - left - 60, Tetris.TILE_SIZE * 2 + 20);
				if (this.blocks.length > 1) {
					this.blocks[1].draw(context,
						(right + left - this.blocks[1].tiles[0].length * Tetris.TILE_SIZE) / 2,
						top + 80 - (this.blocks[1].tiles.length - 2) * Tetris.TILE_SIZE / 2);
				}
			},

			landBlock() {
				this.panel.setBlock(this.blocks[0]);
				this.blocks.shift();
				this.blocks.push(new Tetris.Block(Math.floor(Math.random() * 7), randomColor(4), this.panel));
				return this.panel.clearLine();
			},

			pressKey: function(key, delta) {
				if (You.input.key.down(key)) {
					this.key_delay = 0;
					this.key_interval = 0;
					this.key_pressed = key;
					return true;
				}
				else if (You.input.key.press(key) && this.key_pressed == key) {
					if (this.key_delay > 1) {
						this.key_interval += 20 * delta;
						if (this.key_interval > 1) { this.key_interval -= 1; return true; }
					}
					else { this.key_delay += 4 * delta; }
				}
				return false;
			}

		},

		game_over: {

			// bgm: new Audio("audio/Dana.mp3"),
			score: 0,
			color: null,

			in: function(score) {
				// this.bgm.currentTime = 0;
				// this.bgm.play();
				this.score = score;
				this.prg_title = new Progress(0, 1, 5, null, { begin: false, end: false });
				this.prg_cont = new Progress(2, 8, 10, 2, { begin: false, end: false });

				this.color = randomColor(10);

				return this;
			},

			out: function() {
				// this.bgm.pause();
				// this.bgm.currentTime = 0;
				this.score = 0;
				this.prg_title = null;
				this.prg_cont = null;
				this.color = null;
			},

			update: function(delta) {
				this.prg_title.update(delta);
				this.prg_cont.update(delta);

				if (this.prg_cont.isEmpty || this.prg_cont.isFull) { this.prg_cont.speed *= -1; }

				if (You.input.key.down(Input.KEY_ENTER)) {
					if (this.prg_title.isFull) {
						You.scene.pop();
						return;
					}
				}
			},

			draw: function(context) {
				context.globalAlpha = this.prg_title.rate;
				context.font = "24px Arial";
				context.fillStyle = this.color;
				context.textAlign = "center";
            	context.textBaseline = "middle";
				context.fillText("Game Over", You.canvas.width / 2, You.canvas.height / 3);

				if (this.prg_title.isFull) {
					context.globalAlpha = this.prg_cont.rate;
					context.font = "12px Arial";
					context.fillStyle = "#fff";
					context.fillText("press Enter to continue", You.canvas.width / 2, You.canvas.height * 3 / 4);
				}

				context.globalAlpha = 1;
				context.font = "14px Arial";
				context.textBaseline = "top";
				context.fillStyle = "#fff";
				context.fillText("Score ", You.canvas.width / 2, You.canvas.height / 2);
				context.fillText("" + this.score, You.canvas.width / 2, You.canvas.height / 2 + 20);
			},

		}
	}

};