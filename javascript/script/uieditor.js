var UIEditor = {

	name: "UI Editor",
	desc: "UI Editor",

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
		main: {
			in() {
				this.drag = null;
				this.ip = null;
				this.drag_rect = null;

				this.grid = new UI.Grid('grid', 20, 20);
				
				// Rectangle
				this.rect = new UI.Rectangle('r1', [20, 20], [40, 40], 'red');
				
				// Text
				// Button
				// Grid
			},
			out() {
				
			},
			update(delta) {
				let mouse = You.input.mouse;
				if (mouse) {
					if (mouse[0] == 'down') {
						this.ip = Array.from(this.rect.transform.position);
						this.drag = [mouse[1].offsetX, mouse[1].offsetY];
					}
					else if (mouse[0] == 'move') {
						if (this.drag) {
							let [x, y] = [mouse[1].offsetX, mouse[1].offsetY];
							let [ox, oy] = this.ip;

							this.rect.transform.position = [ox+x-this.drag[0], oy+y-this.drag[1]];
						}
					}
					else if (mouse[0] == 'up') {
						if (this.drag) {
							let [x, y] = [mouse[1].offsetX, mouse[1].offsetY];
							let [ox, oy] = this.ip;

							this.rect.transform.position = [ox+x-this.drag[0], oy+y-this.drag[1]];

							this.ip = null;
							this.drag = null;
						}
					}
				}
			},
			draw(context) {
				context.save();

				this.grid.draw(context);

				let old = this.rect.transform.position;

				if (this.drag) {
					this.rect.draw(context);
					context.globalAlpha = 0.5;
				}

				let fit = this.grid.fit(this.rect);
				this.rect.transform.position = fit;
				this.rect.draw(context);

				if (this.drag) {
					this.rect.transform.position = old;
				}

				context.restore();
			}
		},
	}
};

var UI = {};

UI.Rectangle = class extends You.Object {
	constructor(name, position, size, color) {
		super(name);

		this.transform = {
			position: position,
			size: size
		};

		this.color = color;
	}

	onDraw(context) {
		context.fillStyle = this.color;

		// console.log(this.transform.position)
		context.fillRect(...this.transform.position, ...this.transform.size);
	}
};

UI.Grid = class extends You.Object {
	constructor(name, rowInterval, columnInterval) {
		super(name);

		this.rowInterval = rowInterval;
		this.columnInterval = columnInterval;
	}

	onDraw(context) {
		context.save();

		context.globalAlpha = 1;
		context.strokeStyle = 'white';

		context.beginPath();

		for (let r = 0; r < You.canvas.height; r += this.rowInterval) {
			context.moveTo(0, r);
			context.lineTo(You.canvas.width, r);
		}

		for (let c = 0; c < You.canvas.height; c += this.columnInterval) {
			context.moveTo(c, 0);
			context.lineTo(c, You.canvas.width);
		}

		context.stroke();

		context.restore();
	}

	fit(object) {
		return [
			parseInt((object.transform.position[0] + this.columnInterval / 2) / this.columnInterval) * this.columnInterval,
			parseInt((object.transform.position[1] + this.rowInterval / 2) / this.rowInterval) * this.rowInterval
		];
	}
};