[ 파일 구조 ]

/index.html
/image
/script

/game/[game id]
	/asset
		/image
			/example-image-0.png
		/sprite
			/example-sprite-0.json
		/object
			/example-object-0.json

	/example-game-0
		/data.json
		/scene/[scene id]
			/example-scene-0.json
			/example-scene-1.json

	/example-game-1
		/data.json
		/scene/[scene id]
			/example-scene-0.json
			/example-scene-1.json

[ Data 표기법 ]

Data {
	id: exampleImage0
	fields...
}

[ Data 불러오는 방법 ]

	fetch를 사용:
		fetch('url')하면 불러올 수 있음
		text => '텍스트 그대로' 찾아보기
		image => 찾아보기
		sound => 찾아보기


	Resource.download, get, dispose 구현
	
	(!) upload로 서버에 저장도 가능하면 Resource.upload도 구현


[ Resource ]

	class Resource {

		download(file) {

			return data;
		}

		upload(file, data, overwrite=false) {

		}

	}


[ Scene ]

	Require(Resource, You.Asset.Image)

	class Scene {

		images
		sprites
		objects

		(* Scene File을 다운로드(fetch)해서 Scene Instance로 만드는 작업: Scene Data로 Instance를 불러올 때 사용)
		static load = async function (sceneId) {

			let data = await Resource.download(`${sceneId}.scene`); // (1) 다운로드

			if (data == null) {
				error;
			}

			let json = JSON.parse(data);

			if (!Scene.isValid(json)) { // (2) 유효성 검사
				error;
			}

			return Scene.fromJSON(json); // (3) Scene 객체로 변환

		}

		static save = function (scene) {

			let json = scene.toJSON();

			if (!Scene.isValid(json)) {
				error;
			}

			let data = JSON.stringify(json);

			let sceneId = scene.id;

			Resource.upload(`game/scene/${sceneId}.scene`, data, true);

		}

		constructor(id) {
			Object.defineProperty(this, 'id', {
				enumerable: true,
				value: id,
			});
		}

		(* Scene Instance의 내용을 전부 해제(레퍼런스 연결 끊기)하는 작업: Scene Instance를 없앨 때 사용)
		unload = function () {

		}

		(* Scene Instance을 json형태로 만드는 작업: Scene Instance를 json으로 만들 때 사용)
		toJSON() {

			return {
				'@class': this.constructor.name,
				...this
			};

		}

		static fromJSON(json) {
			let instance = new this();

			instance.images = json.images.map((e) => You.fromJSON(e));
			instance.sprites = json.sprites.map((e) => You.fromJSON(e));
			instance.objects = json.objects.map((e) => You.fromJSON(e));
			
			function rec(target, refers) {
				for (property in target) {
					target.property == link
					? rec(objects[target.property], refers)
					: new target.property
				}
			}

			return instnace;
		}

		static isValid = function (json) {
			if (json['@class'] !== 'Scene') {
				return false;
			}
			
		}

	}
