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
				document.getElementById('move').addEventListener('click', (e) => {
					this.tool.type = 'move';
				});

				document.getElementById('rect').addEventListener('click', (e) => {
					this.tool.type = 'rect';
				});

				document.getElementById('text').addEventListener('click', (e) => {
					this.tool.type = 'text';
				});

				document.getElementById('button').addEventListener('click', (e) => {
					this.tool.type = 'button';
				});

				// this.drag = null;
				// this.ip = null;
				// this.drag_rect = null;
				// this.selected = null;

				this.tool = {
					type: 'move',
					move: {
						drag: false,
						mousePosition: null,
						objectPosition: null,
						object: null,
						selected: null
					},
					rect: {
						object: null,
					}
				}

				// panel
				this.panel = null;

				this.grid = new UI.Grid('grid', 20, 20);
				
				this.ui = [];

				// Rectangle
				this.rect = new UI.Rectangle('r1', [20, 20], [40, 40], 'red');
				// this.ui.push(this.rect);
				
				// Text
				// Button
				// Grid
			},
			out() {
				
			},
			update(delta) {
				let mouse = You.Input.mouse;
				if (this.tool.type == 'move') {
					if (mouse.down) {
						if (this.tool.move.selected) {
							this.tool.move.objectPosition = Array.from(this.rect.transform.position);
							this.tool.move.mousePosition = mouse.down;
							this.tool.move.drag = true;
						}
					}
					if (mouse.move) {
						this.tool.move.selected = null;
						for (let o of this.ui) {
							if (o.contain(mouse.move)) {
								this.tool.move.selected = o;
								break;
							}
						}

						if (this.tool.move.drag) {
							let [startX, startY] = this.tool.move.mousePosition;
							let [mouseX, mouseY] = mouse.move;
							let [objectX, objectY] = this.tool.move.objectPosition;

							this.rect.transform.position = [objectX+mouseX-startX, objectY+mouseY-startY];
						}
					}
					if (mouse.up) {
						if (this.tool.move.drag) {
							let [startX, startY] = this.tool.move.mousePosition;
							let [mouseX, mouseY] = mouse.up;
							let [objectX, objecyY] = this.tool.move.objectPosition;

							this.rect.transform.position = [objectX+mouseX-startX, objecyY+mouseY-startY];

							this.ip = null;

							this.tool.move.drag = false;
						}
					}
				}
				else if (this.tool.type == 'rect') {

				}
			},
			draw(context) {
				context.save();

				this.grid.draw(context);

				if (this.tool.type == 'move') {
					let old = this.rect.transform.position;

					if (this.tool.move.drag) {
						this.rect.draw(context);
						context.globalAlpha = 0.5;
					}

					this.rect.transform.position = this.grid.fit(this.rect);
					this.rect.draw(context);

					if (this.tool.move.drag) {
						this.rect.transform.position = old;
					}

					if (this.selected) {
						context.globalAlpha = 1;
						context.strokeStyle = 'rgba(0, 255, 0, 1)';
						context.strokeRect(...this.selected.transform.position, ...this.selected.transform.size);
					}
				}
				else if (this.tool.type == 'rect') {

				}

				context.restore();
			}
		},
	}
};

var UI = {};

UI.Area = class extends You.Object {
	constructor(name) {
		super(name);

		this.transform = transform;
	}

	draw(context, ...args) {
		context.save();

		context.translate(...this.transform.position);
		context.scale(...this.transform.scale);
		context.rotate(...this.transform.rotate);

		this.onDraw(context, ...args);
		this.components.forEach((c) => c.draw(context, ...args));

		context.restore();
	}

	intersect(other) {
		if (other instanceof UI.Area) {
			return 
		}

		return null;
	}

	contain(point) {
		return this.transform.position[0] < point[0] && point[0] < this.transform.position[0] + this.transform.size[0] &&
			this.transform.position[1] < point[1] && point[1] < this.transform.position[1] + this.transform.size[1];
	}
}

UI.Panel = class extends UI.Area {

}

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

		context.fillRect(...this.transform.position, ...this.transform.size);
	}

	contain(point) {
		return this.transform.position[0] < point[0] && point[0] < this.transform.position[0] + this.transform.size[0] &&
			this.transform.position[1] < point[1] && point[1] < this.transform.position[1] + this.transform.size[1];
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