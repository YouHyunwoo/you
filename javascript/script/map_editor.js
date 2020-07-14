var MapEditor = {

	name: "Map Editor",
	desc: "made by You",

	asset: {
	},

	scene: {
		main: {
			in() {
				let sprites = {
					tree: new Korea.Graphics.Sprite()
							.setSheet(You.Asset.Image.load('tree.png'))
							.setAnchor([0.5, 0.95])
							.setScale([0.5, 0.5]),
					logo: new Korea.Graphics.Sprite()
							.setSheet(You.Asset.Image.load('logo.png'))
							.setAnchor([0.5, 0.5])
							.setScale([0.15, 0.25]),
					stone: new Korea.Graphics.Sprite()
							.setSheet(You.Asset.Image.load('stone.png'))
							.setAnchor([0.5, 0.5])
							.setScale([0.3, 0.3]),
				};

				this.map = new Korea.Map('map')
							.setPosition([50, 50])
							.setSize([600, 600])
							.setColor('rgba(255, 255, 255, 0.2)')
							.addComponents(
								new Korea.ObjectArrangement('object arrangement')
							);


				// this.panel = new UI.Panel('panel').setSize([200, 200]);

				// this.panel.clip = false;
				// this.panel.position = [
				// 	(You.canvas.width - this.panel.width) / 2,
				// 	(You.canvas.height - this.panel.height) / 2
				// ];

				this.states = new You.State.Context('state context')
								.addComponents(
									new Editor.Map.MoveState('move', this)
									// new UI.Main.MoveState('move', this),
									// new UI.Main.RectangleState('rectangle', this),
									// new UI.Main.TextState('text', this),
									// new UI.Main.ButtonState('button', this),
								);

				// [ 'move', 'rectangle', 'text', 'button' ].forEach((t) => {
				// 	document.getElementById(t).addEventListener('click', (e) => {
				// 		this.states.transit(`${t}`);
				// 	});
				// });
			},

			out() {
				this.states = null;

				// this.panel = null;
			},

			update(delta) {
				this.states.update(delta);
			},
			
			draw(context) {
				this.map.draw(context);
				// this.panel.draw(context);

				this.states.draw(context);
			},
		},
	},
};

Editor = {};
Editor.Map = {};
Editor.Map.MoveState = class extends You.State {
	constructor(name, scene) {
		super(name);

		this.scene = scene;
	}
};

var UI = {};

UI.Panel = class extends You.Area {
	constructor(name) {
		super(name);

		// this.grid = new UI.Grid('grid', 20, 20);

		this.clip = true;
	}

	// fitAll() {
	// 	this.components.forEach((c) => {
	// 		c.position = this.grid.fit(c.position);
	// 	});
	// }

	draw(context, ...args) {
		context.save();

		context.translate(...this.position);

		context.save();
		
		context.beginPath();
		context.rect(0, 0, ...this.size);
		context.clip();

		// this.grid.draw(context, ...args);

		if (this.clip == false) {
			context.restore();
		}

		this.onDraw(context, ...args);
		this.components.forEach((c) => c.draw(context, ...args));

		context.restore();
	}

	setClip(clip) {
		this.clip = clip || true;

		return this;
	}
};

UI.Rectangle = class extends You.Area {
	constructor(name) {
		super(name);

		this.color = null;
		this.alpha = 1;
	}

	onDraw(context) {
		if (this.color && this.alpha > 0) {
			context.save();

			context.globalAlpha = this.alpha;
			context.fillStyle = this.color;

			context.fillRect(...this.position, ...this.size);

			context.restore();
		}
	}

	setColor(color) {
		this.color = color || null;

		return this;
	}

	setAlpha(alpha) {
		this.alpha = alpha == 0 ? 0 : alpha || 1;

		return this;
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

	fit(position) {
		return [
			Math.floor((position[0] + this.columnInterval / 2) / this.columnInterval) * this.columnInterval,
			Math.floor((position[1] + this.rowInterval / 2) / this.rowInterval) * this.rowInterval
		];
	}
};


UI.Main = {};
UI.Main.MoveState = class extends You.State {
	constructor(name, scene) {
		super(name);

		this.scene = scene;

		this.drag = false;

		this.selectedObject = null;
	}

	onEnter() {
		this.drag = false;

		this.selectedObject = null;
	}

	onExit() {}

	onUpdate(delta) {
		let scene = this.scene;

		let mouse = You.Input.mouse;

		if (mouse.down) {
			if (!this.drag) {
				this.deltaPosition = [0, 0];
				this.anchorPosition = mouse.down;

				if (this.selectedObject) {
					this.objectPosition = [...this.selectedObject.position];
					this.globalObjectPosition = scene.panel.localToGlobal(this.selectedObject.position);
					
					this.selectedObject.alpha = 0.5;
				}
				else {
					this.objectPosition = [...scene.panel.position];
				}

				this.drag = true;
			}
		}

		if (mouse.move) {
			if (this.drag) {
				this.deltaPosition = mouse.move.subv(this.anchorPosition);

				if (this.selectedObject) {
					this.selectedObject.position = scene.panel.grid.fit(this.objectPosition.addv(this.deltaPosition));
				}
				else {
					scene.panel.position = this.objectPosition.addv(this.deltaPosition);
				}
			}
			else {
				this.selectedObject = null;

				for (let comps = scene.panel.components, i = comps.length - 1; i >= 0; i--) {
					if (comps[i].contain(scene.panel.globalToLocal(mouse.move))) {
						this.selectedObject = comps[i];
						break;
					}
				}
			}
		}

		if (mouse.up) {
			if (this.drag) {
				if (this.selectedObject) {
					this.selectedObject.alpha = 1;
				}

				this.drag = false;
			}
		}
	}

	onDraw(context) {
		let scene = this.scene;

		if (this.drag) {
			if (this.selectedObject) {
				let tempPosition = this.selectedObject.position;

				this.selectedObject.position = this.globalObjectPosition.addv(this.deltaPosition);
				this.selectedObject.alpha = 1;
				this.selectedObject.draw(context);

				this.selectedObject.alpha = 0.5;
				this.selectedObject.position = tempPosition;
			}
		}
		else {
			if (this.selectedObject) {
				context.save();

				context.globalAlpha = 1;
				context.strokeStyle = 'green';
				context.strokeRect(...scene.panel.localToGlobal(this.selectedObject.position), ...this.selectedObject.size);

				context.restore();
			}
		}
	}
};

UI.Main.RectangleState = class extends You.State {
	constructor(name, scene) {
		super(name);

		this.scene = scene;

		this.drag = false;

		this.object = null;
	}

	createObject() {
		let color = document.querySelector('div.tool.rectangle .color input').value || 'white';

		this.object = new UI.Rectangle('rectangle')
						.setColor(color);

		this.scene.panel.addComponents(this.object);
	}

	onEnter() {
		this.drag = false;

		document.querySelector('div.tool.' + this.name).style.display = 'block';
	}

	onExit() {
		document.querySelector('div.tool.' + this.name).style.display = 'none';
	}

	onUpdate(delta) {
		let scene = this.scene;

		let mouse = You.Input.mouse;

		if (mouse.down) {
			if (!this.drag) {
				this.anchorPosition = mouse.down;

				this.createObject();

				this.drag = true;
			}
		}

		if (mouse.move) {
			if (this.drag) {
				let start = [...this.anchorPosition];
				let end = mouse.move;

				if (start[0] > end[0]) {
					[start[0], end[0]] = [end[0], start[0]];
				}

				if (start[1] > end[1]) {
					[start[1], end[1]] = [end[1], start[1]];
				}

				start = scene.panel.grid.fit(scene.panel.globalToLocal(start));
				end = scene.panel.grid.fit(scene.panel.globalToLocal(end));

				let interval = [scene.panel.grid.columnInterval, scene.panel.grid.rowInterval];

				this.object.position = start;
				this.object.size = end.addv(interval).subv(start);
			}
		}

		if (mouse.up) {
			this.drag = false;
		}
	}
};

UI.Main.TextState = class extends You.State {
	constructor(name, scene) {
		super(name);

		this.scene = scene;

		this.drag = false;

		this.object = null;
	}

	onEnter() {
		this.drag = false;

		this.object = null;

		document.querySelector('div.tool.' + this.name).style.display = 'block';
	}

	onExit() {
		document.querySelector('div.tool.' + this.name).style.display = 'none';
	}

	createObject() {
		let text = document.querySelector('div.tool.text .text input').value;
		let align = document.querySelector('div.tool.text .align input').value || 'left';
		let valign = document.querySelector('div.tool.text .valign input').value || 'top';
		let color = document.querySelector('div.tool.text .color input').value || 'white';
		let bgcolor = document.querySelector('div.tool.text .bgcolor input').value || 'black';

		this.object = new You.Text('text')
						.setText(text)
						.setAlign(align)
						.setVAlign(valign)
						.setColor(color)
						.setBackgroundColor(bgcolor);

		this.scene.panel.addComponents(this.object);
	}

	onUpdate(delta) {
		let scene = this.scene;

		let mouse = You.Input.mouse;

		if (mouse.down) {
			if (!this.drag) {
				this.anchorPosition = mouse.down;

				this.createObject();

				this.drag = true;
			}
		}

		if (mouse.move) {
			if (this.drag) {
				let start = [...this.anchorPosition];
				let end = mouse.move;

				if (start[0] > end[0]) {
					[start[0], end[0]] = [end[0], start[0]];
				}

				if (start[1] > end[1]) {
					[start[1], end[1]] = [end[1], start[1]];
				}

				start = scene.panel.grid.fit(scene.panel.globalToLocal(start));
				end = scene.panel.grid.fit(scene.panel.globalToLocal(end));

				let interval = [scene.panel.grid.columnInterval, scene.panel.grid.rowInterval];

				this.object.position = start;
				this.object.size = end.addv(interval).subv(start);
			}
		}

		if (mouse.up) {
			this.drag = false;
		}
	}
};

UI.Main.ButtonState = class extends You.State {
	constructor(name, scene) {
		super(name);

		this.scene = scene;

		this.drag = false;

		this.object = null;
	}

	onEnter() {
		this.drag = false;

		this.object = null;

		document.querySelector('div.tool.' + this.name).style.display = 'block';
	}

	createObject() {
		let text = document.querySelector('div.tool.button .text input').value;
		let align = document.querySelector('div.tool.button .align input').value || 'center';
		let valign = document.querySelector('div.tool.button .valign input').value || 'middle';
		let color = document.querySelector('div.tool.button .color input').value || 'black';
		let bgcolor = document.querySelector('div.tool.button .bgcolor input').value || 'white';

		this.object = new You.Button('button')
						.setText(text)
						.setAlign(align)
						.setVAlign(valign)
						.setColor(color)
						.setBackgroundColor(bgcolor);

		this.scene.panel.addComponents(this.object);
	}

	onExit() {
		document.querySelector('div.tool.' + this.name).style.display = 'none';
	}

	onUpdate(delta) {
		let scene = this.scene;

		let mouse = You.Input.mouse;

		if (mouse.down) {
			if (!this.drag) {
				this.anchorPosition = mouse.down;

				this.createObject();

				this.drag = true;
			}
		}

		if (mouse.move) {
			if (this.drag) {
				let start = [...this.anchorPosition];
				let end = mouse.move;

				if (start[0] > end[0]) {
					[start[0], end[0]] = [end[0], start[0]];
				}

				if (start[1] > end[1]) {
					[start[1], end[1]] = [end[1], start[1]];
				}

				start = scene.panel.grid.fit(scene.panel.globalToLocal(start));
				end = scene.panel.grid.fit(scene.panel.globalToLocal(end));

				let interval = [scene.panel.grid.columnInterval, scene.panel.grid.rowInterval];

				this.object.position = start;
				this.object.size = end.addv(interval).subv(start);
			}
		}

		if (mouse.up) {
			this.drag = false;
		}
	}
};