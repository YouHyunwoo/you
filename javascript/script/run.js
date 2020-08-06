import * as U from './uengine.js';
// import App from './game-example.js';
// import App from './game-rpg.js';

U.Engine.init();

// game-rpg

// // create engines
// const engine = new U.Engine('canvas-0');

// // run apps
// (async () => {
// 	const app = await U.Application.load(App);

// 	console.log(app);
// 	engine.run(app);
// })();



// vor
const engine = new U.Engine('canvas');

(async () => {
	const app = await U.Application.load('vor');

	engine.run(app);
})();




// run two or more games
// const engines = [
// 	new U.Engine('canvas-0'),
// 	new U.Engine('canvas-1')
// ];
// const games = U.Games.map(async gameId => 
// 	U.Game.load(gameId)
// );

// for (let i = 0; i < games.length; i++) {
// 	games[i].then(g => {
// 		engines[i].run(g);
// 	})
// };