var Korea = {

	name: "Korea",
	desc: "made by You",

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
		title: {
			in() {
				// login
				// 
				// 1. 타이틀 표시
				// 2. 'press enter to continue' 표시
				// 3. 텍스트 입력 상자 생성: id, pw
				// 4. 버튼 표시: login
				// 5. 로그인 검사
				// 6. character 장면 생성해서 계정 index를 보내주기
			},

			out() {

			},

			update(delta) {

			},

			draw(context) {

			},
		},
		character: {
			in() {
				// select character
			},

			out() {

			},

			update(delta) {

			},

			draw(context) {

			},
		},
		game: {
			in() {
				// play selected character
				// 1. 테스트 맵 생성
				// 2. 테스트 캐릭터 생성
				// 3. 캐릭터 움직임
				// 4. 캐릭터 애니메이션
				// 5. 테스트 몬스터 생성
				// 6. 캐릭터 근접 공격, 주문
				// 7. 몬스터 AI
				// 8. 맵 저장
				// 9. 캐릭터 저장
				// 10. 오브젝트 저장
				// (에디터 만들기: 맵, 오브젝트, )
				// 11. 실제 맵 기획, 생성
				// 12. 실제 캐릭터 기획, 생성
				// 13. 실제 몬스터 기획, 생성
			},

			out() {

			},

			update(delta) {

			},

			draw(context) {

			},
		},
	},
};


Korea.Map = class extends You.Object {
	constructor(name) {
		super(name);

		this.size = [0, 0];
	}

	get width() {
		return this.size[0];
	}

	get height() {
		return this.size[1];
	}
};

Korea.GameObject = class extends You.Object {

};