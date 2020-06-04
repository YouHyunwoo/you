var GameSelector = {

	name: "GameSelector",
	desc: "by You",

	scene: {
		title: {
			in: function () {
				this.games = [ Tetris, Nemo, Game, Editor ];
				this.selected = 0;
			},
			out: function () {
				this.selected = 0;
				this.games = null;
			},
			update: function (delta) {
				if (You.input.key.down(Input.KEY_ENTER)) {
					You.scene.transit(this.games[this.selected].scene.title);
					return;
				}

				if (You.input.key.down(Input.KEY_UP)) {
					this.selected = (this.selected - 1 + this.games.length) % this.games.length;
				}
				else if (You.input.key.down(Input.KEY_DOWN)) {
					this.selected = (this.selected + 1) % this.games.length;
				}
			},
			draw: function (context) {
				context.font = "12px Arial";
				context.textAlign = "center";
				context.textBaseline = "middle";
				context.fillStyle = "#fff";
				for (let i = 0; i < this.games.length; i++) {
					if (this.selected == i) {
						context.fillStyle = "rgba(255, 255, 255, 0.5)";
						context.fillRect(0, i * You.canvas.height / this.games.length, You.canvas.width, You.canvas.height / this.games.length);
						context.fillStyle = "#fff";
					}
					context.fillText(this.games[i].name, You.canvas.width / 2, You.canvas.height / this.games.length / 2 * (2 * i + 1));
				}
			}
		}
	}

}