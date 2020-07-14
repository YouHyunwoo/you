var Editor = {

	name: "Editor",
	desc: "game editor made by You 2018-02-26",

	scene: {
		title: {
			in() {
				this.prg_logo = new Progress(0, 100, 100, null, { begin: false, end: false });

				this.logo = You.Asset.Image.load('logo.png');
			},
			out() {
				this.prg_logo = null;
			},
			update(delta) {
				this.prg_logo.update(delta);

				if (this.prg_logo.isFull) {
					this.prg_logo.speed *= -1;
				}

				if (this.prg_logo.isEmpty || You.Input.key.down('Escape')) {
					You.Scene.transit(Editor.scene.main);
				}
				else if (You.Input.key.down()) {
					this.prg_logo.speed = -Math.abs(this.prg_logo.speed);
				}
			},
			draw(context) {
				context.save();

				context.globalAlpha = this.prg_logo.rate;

				// this.logo.draw(context, You.canvas.width / 4, You.canvas.height / 4, You.canvas.width / 2, You.canvas.height / 2)

				context.restore();
			}
		},

		main: {
			in: function() {
				this.object_data = [
					`{"x":0,"y":0,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true}`,
					`{"x":0,"y":0,"width":12,"height":6,"anchor":{"x":6,"y":3},"animation":{"states":[{"name":"stone","responses":{},"frames":[{"x":0,"y":0,"width":160,"height":128,"anchor":{"x":80,"y":110},"image":{"name":"stone.png"},"scale":{"x":0.1,"y":0.1},"duration":1}],"progress":{"begin":0,"end":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":false}`
				];

				// generate map
				this.map = new GameMap(new Area(0, 0, 1000, 1000));
				// this.map = GameMap.fromJSON(`{"x":0,"y":0,"width":2000,"height":2000,"anchor":{"x":0,"y":0},"objects":[{"x":0,"y":0,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":30,"y":200,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":400,"y":50,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":500,"y":600,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":520,"y":1380,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1000,"y":200,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1800,"y":1500,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":720,"y":240,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1820,"y":320,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1510,"y":560,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":710,"y":890,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":40,"y":1040,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":260,"y":1840,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":750,"y":1840,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1070,"y":1690,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1290,"y":1310,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1810,"y":1870,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1790,"y":1100,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1660,"y":920,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1810,"y":700,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1660,"y":490,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1440,"y":530,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1630,"y":680,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1910,"y":220,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1730,"y":200,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1900,"y":380,"width":24,"height":12,"anchor":{"x":12,"y":6},"animation":{"states":[{"name":"tree","responses":{},"frames":[{"x":0,"y":0,"width":128,"height":252,"anchor":{"x":64,"y":246},"image":{"name":"tree.png"},"scale":{"x":1,"y":1},"duration":1}],"progress":{"begin":0,"end":1,"speed":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":true},{"x":1000,"y":1000,"width":12,"height":6,"anchor":{"x":6,"y":3},"animation":{"states":[{"name":"stone","responses":{},"frames":[{"x":0,"y":0,"width":160,"height":128,"anchor":{"x":80,"y":110},"image":{"name":"stone.png"},"scale":{"x":0.1,"y":0.1},"duration":1}],"progress":{"begin":0,"end":1,"current":0,"rotatable":{"begin":true,"end":true},"exceed":{"begin":false,"end":false}}}]},"blockable":false}],"background":"#4a3"}`);

				// view
				this.view = new Area(0, 0, You.canvas.width, You.canvas.height);

				// tool
				this.tool = { type: 'viewer', info: { down: null, up: null, prev: null } };

				// mouse
				this.mouse = new Point();

				return this;
			},
			out: function() {
				this.map = null;
				this.view = null;
				this.tool = null;
				this.mouse = null;
			},
			update: function(delta) {
				for (let m = You.Input.mouse; m != null; m = You.Input.mouse) {
					if (m[0] == 'down') {
						if (this.tool.type == 'viewer') {
							this.tool.info.down = new Point(m[1]);
							this.tool.info.prev = new Point(m[1]);
						}
						else if (this.tool.type == 'object') {
							let o = GameObject.fromJSON(this.tool.info.data);
							let r = You.canvas.getBoundingClientRect();
							o.x = this.mouse.x - r.left - o.anchor.x + this.view.x;
							o.y = this.mouse.y - r.top - o.anchor.y + this.view.y;
							this.map.add(o);
							this.map.update(0);
						}
					}
					else if (m[0] == 'move') {
						if (this.tool.type == 'viewer') {
							if (this.tool.info.down != null) {
								this.tool.info.prev.set(this.tool.info.down);
								this.tool.info.down.set(m[1]);
							}
						}
						this.mouse.set(m[1]);
					}
					else if (m[0] == 'up') {
						if (this.tool.type == 'viewer') {
							if (this.tool.info.down != null) {
								this.tool.info.up = new Point(m[1]);
								this.tool.info.prev.set(this.tool.info.down);
								this.tool.info.down = null;
							}
						}
					}
				}

				

				if (You.Input.key.down(Input.KEY_('O'))) {
					let data = this.object_data[0];
					this.tool = { type: 'object', info: { sample: GameObject.fromJSON(data), data: data } };
				}
				else if (You.Input.key.down(Input.KEY_('M'))) {
					this.tool = { type: 'viewer', info: { down: null, up: null, prev: null } }
				}
				else if (You.Input.key.down(Input.KEY_('S'))) {
					print(JSON.stringify(this.map));
				}
				else if (You.Input.key.down(Input.KEY_('R'))) {
					// run
				}


				if (this.tool.type == 'viewer') {
					if (this.tool.info.down != null) {
						this.view.x -= this.mouse.x - this.tool.info.prev.x;
						this.view.y -= this.mouse.y - this.tool.info.prev.y;
						this.tool.info.prev.set(this.mouse);
					}
				}
				else if (this.tool.type == 'object') {
					for (let i = 1; i <= 9; i++) {
						if (You.Input.key.down(Input.KEY_(String(i)))) {
							if (this.object_data.length >= i) {
								let data = this.object_data[i - 1];
								this.tool.info = { sample: GameObject.fromJSON(data), data: data };
							}
						}
					}
				}
				
				// this.map.update(delta);
			},
			draw: function(context) {
				context.save();

					context.rect(0, 0, You.canvas.width, You.canvas.height);
					context.clip();

					context.translate(-Math.floor(this.view.x), -Math.floor(this.view.y));

					this.map.draw(context, this.view);

				context.restore();

				context.save();

				context.font = "16px Arial";
				context.textAlign = "left";
				context.textBaseline = "top";
				context.fillStyle = "#fff";

				let r = You.canvas.getBoundingClientRect();

				context.fillText('Screen', 10, 10);
				context.fillText(`X: ${this.mouse.x - r.left}`, 10, 30);
				context.fillText(`Y: ${this.mouse.y - r.top}`, 10, 50);

				context.fillText('Map', 10, 90);
				context.fillText(`X: ${this.mouse.x - r.left + this.view.x}`, 10, 110);
				context.fillText(`Y: ${this.mouse.y - r.top + this.view.y}`, 10, 130);

				if (this.tool.type == 'object') {
					context.save();
					context.translate(this.mouse.x - r.left - this.tool.info.sample.anchor.x, this.mouse.y - r.top - this.tool.info.sample.anchor.y);
					this.tool.info.sample.draw(context);
					context.restore();
				}

				context.restore();
			}
		},
	}

};