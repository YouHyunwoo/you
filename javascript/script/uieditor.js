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
				this.tool = {
					types: [ 'move', 'rectangle', 'text', 'button' ],
					type: null,
				};

				this.tool.types.forEach((t) => {
					document.getElementById(t).addEventListener('click', (e) => { this.tool.type = t; });
				});

				document.getElementById('move').addEventListener('click', (e) => {
					this.tool.type = 'move';
				});

				document.getElementById('rectangle').addEventListener('click', (e) => {
					this.tool.type = 'rectangle';

					document.querySelectorAll('div.tool').forEach((e) => { e.style.display = 'none'; });
					document.querySelector('div.tool.rectangle').style.display = 'block';

					let color = document.querySelector('div.tool.rectangle .color input').value || null;

					this.tool.rectangle.object = new UI.Rectangle('rect').setColor(color);
				});

				document.getElementById('text').addEventListener('click', (e) => {
					this.tool.type = 'text';

					document.querySelectorAll('div.tool').forEach((e) => { e.style.display = 'none'; });
					document.querySelector('div.tool.text').style.display = 'block';

					let text = document.querySelector('div.tool.text .text input').value;
					let align = document.querySelector('div.tool.text .align input').value || 'left';
					let valign = document.querySelector('div.tool.text .valign input').value || 'top';
					let color = document.querySelector('div.tool.text .color input').value || 'white';
					let bgcolor = document.querySelector('div.tool.text .bgcolor input').value || null;

					this.tool.text.object = new You.Text('text')
												.setText(text)
												.setAlign(align)
												.setVAlign(valign)
												.setColor(color)
												.setBackgroundColor(bgcolor);
				});

				this.tool.type = this.tool.types[0];

				this.tool.move = {
					drag: false,
					position: null,
					start: null,
					selected: null
				};

				this.tool.rectangle = {
					drag: false,
				};

				this.tool.text = {
					drag: false,
				};

				// Panel
				this.panel = new UI.Panel('panel').setSize([200, 200]);

				this.panel.clip = false;
				this.panel.position = [
					(You.canvas.width - this.panel.width) / 2,
					(You.canvas.height - this.panel.height) / 2
				];

				// Button
			},
			out() {
				this.tool = null;

				this.panel = null;
			},
			update(delta) {
				let mouse = You.Input.mouse;

				if (this.tool.type == 'move') {
					use(this.tool.move, function (scene) {
						if (mouse.down) {
							if (this.drag == false) {
								if (this.selected) {
									this.position = Array.from(this.selected.position);
									this.positionBeforeFit = Array.from(this.selected.position);
									this.start = mouse.down;
									this.selected.alpha = 0.5;

									this.drag = true;
								}
							}

							scene.panel.fitAll();
						}

						if (mouse.move) {
							if (this.drag) {
								this.selected.position = this.position.addv(mouse.move.subv(this.start));
								this.positionBeforeFit = Array.from(this.selected.position);
							}
							else {
								this.selected = null;

								for (let i = scene.panel.components.length-1; i >= 0; i--) {
									if (scene.panel.components[i].contain(scene.panel.globalToLocal(mouse.move))) {
										this.selected = scene.panel.components[i];
										break;
									}
								}
							}

							scene.panel.fitAll();
						}

						if (mouse.up) {
							if (this.drag) {
								this.selected.position = this.position.addv(mouse.up.subv(this.start));
								this.selected.alpha = 1;

								this.drag = false;
							}

							scene.panel.fitAll();
						}
					}, this);
				}
				else if (this.tool.type == 'rectangle') {
					use(this.tool.rectangle, function (scene) {
						if (mouse.down) {
							if (this.drag == false) {
								this.start = mouse.down;

								let color = document.querySelector('div.tool.rectangle .color input').value || null;

								this.object.setColor(color);

								this.drag = true;
							}
						}

						if (mouse.move) {
							if (this.drag) {
								let start = [...this.start];
								let end = mouse.move;

								if (start[0] > end[0]) {
									[start[0], end[0]] = [end[0], start[0]];
								}

								if (start[1] > end[1]) {
									[start[1], end[1]] = [end[1], start[1]];
								}

								let interval = [scene.panel.grid.columnInterval, scene.panel.grid.rowInterval];

								start = scene.panel.grid.fit(scene.panel.globalToLocal(start));
								end = scene.panel.grid.fit(scene.panel.globalToLocal(end));

								this.object.position = start;
								this.object.size = end.addv(interval).subv(start);
							}
						}

						if (mouse.up) {
							if (this.drag) {
								if (this.object) {
									scene.panel.addComponents(this.object);
								}
								
								let color = document.querySelector('div.tool.rectangle .color input').value || null;

								this.object = new UI.Rectangle('rect', [0, 0], [0, 0], color);

								this.drag = false;
							}
						}
					}, this);
				}
				else if (this.tool.type == 'text') {
					use(this.tool.text, function (scene) {
						if (mouse.down) {
							if (this.drag == false) {
								this.start = mouse.down;

								let text = document.querySelector('div.tool.text .text input').value;
								let align = document.querySelector('div.tool.text .align input').value || 'left';
								let valign = document.querySelector('div.tool.text .valign input').value || 'top';
								let color = document.querySelector('div.tool.text .color input').value || 'white';
								let bgcolor = document.querySelector('div.tool.text .bgcolor input').value || null;

								this.object.setText(text).setAlign(align).setVAlign(valign).setColor(color).setBackgroundColor(bgcolor);
								
								this.drag = true;
							}
						}

						if (mouse.move) {
							if (this.drag) {
								let start = [...this.start];
								let end = mouse.move;

								if (start[0] > end[0]) {
									[start[0], end[0]] = [end[0], start[0]];
								}

								if (start[1] > end[1]) {
									[start[1], end[1]] = [end[1], start[1]];
								}

								let interval = [scene.panel.grid.columnInterval, scene.panel.grid.rowInterval];

								start = scene.panel.grid.fit(scene.panel.globalToLocal(start));
								end = scene.panel.grid.fit(scene.panel.globalToLocal(end));

								this.object.position = start;
								this.object.size = end.addv(interval).subv(start);
							}
						}

						if (mouse.up) {
							if (this.drag) {
								let text = document.querySelector('div.tool.text .text input').value;
								let align = document.querySelector('div.tool.text .align input').value || 'left';
								let valign = document.querySelector('div.tool.text .valign input').value || 'top';
								let color = document.querySelector('div.tool.text .color input').value || 'white';
								let bgcolor = document.querySelector('div.tool.text .bgcolor input').value || null;
								
								if (this.object) {
									this.object.setText(text).setAlign(align).setVAlign(valign).setColor(color).setBackgroundColor(bgcolor);
									scene.panel.addComponents(this.object);
								}

								this.object = new You.Text('text')
												.setText(text)
												.setAlign(align).setVAlign(align)
												.setColor(color)
												.setBackgroundColor(bgcolor);

								this.drag = false;
							}
						}
					}, this);
				}
			},
			draw(context) {
				context.save();

				this.panel.draw(context);

				if (this.tool.type == 'move') {
					use(this.tool.move, function (scene) {
						if (this.drag) {
							let tempPosition = this.selected.position;

							this.selected.position = scene.panel.localToGlobal(this.positionBeforeFit);
							this.selected.alpha = 1;
							this.selected.draw(context);
							this.selected.alpha = 0.5;
							this.selected.position = tempPosition;
						}
						else {
							if (this.selected) {
								context.globalAlpha = 1;
								context.strokeStyle = 'rgba(0, 255, 0, 1)';
								context.strokeRect(...scene.panel.localToGlobal(this.selected.position), ...this.selected.size);
							}
						}
					}, this);
				}
				else if (this.tool.type == 'rectangle') {
					use(this.tool.rectangle, function (scene) {
						if (this.drag) {
							this.object.position = this.object.position.addv(scene.panel.position);
							this.object.draw(context);
							this.object.position = this.object.position.subv(scene.panel.position);
						}
					}, this);
				}
				else if (this.tool.type == 'text') {
					use(this.tool.text, function (scene) {
						if (this.drag) {
							this.object.position = this.object.position.addv(scene.panel.position);
							this.object.draw(context);
							this.object.position = this.object.position.subv(scene.panel.position);
						}
					}, this);
				}

				context.restore();
			}
		},
	}
};

var UI = {};

UI.Panel = class extends You.Area {
	constructor(name) {
		super(name);

		this.grid = new UI.Grid('grid', 20, 20);

		this.clip = true;
	}

	fitAll() {
		this.components.forEach((c) => {
			c.position = this.grid.fit(c.position);
		});
	}

	draw(context, ...args) {
		context.save();

		context.translate(...this.position);

		context.save();
		
		context.beginPath();
		context.rect(0, 0, ...this.size);
		context.clip();

		this.grid.draw(context, ...args);

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
			Math.floor((position[0]) / this.columnInterval) * this.columnInterval,
			Math.floor((position[1]) / this.rowInterval) * this.rowInterval
		];
	}
};