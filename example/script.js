let game;
let self;
let speed = 3;
let players = {};

function setup() {
	frameRate(60);
	new Canvas(windowWidth, windowHeight);
	self = new Sprite(200, 200, 50, 50);
	self.collider = "kinematic";
	self.color = "red";
}

function draw() {
	clear();
	noStroke();
	if (kb.pressing("left")) self.position.x -= speed;
	if (kb.pressing("right")) self.position.x += speed;
	if (kb.pressing("up")) self.position.y -= speed;
	if (kb.pressing("down")) self.position.y += speed;
}

function addPlayer(name, data) {
	let sprite = new Sprite(data.x, data.y, 50, 50);
	sprite.collider = "kinematic";
	sprite.color = "blue";
	players[name] = sprite;
}

import("../playon.js").then((playon) => {
	playon.init({
		apiKey: "AIzaSyD8yq4G37CWefCb1rHsjKiiyyyUvjYea8A",
		authDomain: "playon-example.firebaseapp.com",
		databaseURL: "https://playon-example-default-rtdb.europe-west1.firebasedatabase.app",
		projectId: "playon-example",
		storageBucket: "playon-example.appspot.com",
		messagingSenderId: "814401934285",
		appId: "1:814401934285:web:787abfe65f625065b3ea84"
	});

	document.getElementById("create-game").addEventListener("click", () => {
		playon.createGame().then((id) => {
			alert(id);
		});
	});

	document.getElementById("join-game").addEventListener("click", () => {
		let id = parseInt(prompt("ID:"));
		let username = prompt("Username:");
		playon.joinGame(id, username, {}).then((g) => {
			game = g;
			for (const [name, data] of Object.entries(game.players)) {
				if (name != username) addPlayer(name, data);
			}
			game.on("playerJoined", addPlayer);
			game.on("playerUpdated", (name, data) => {
				players[name].position.x = data.x;
				players[name].position.y = data.y;
			});
			setInterval(() => {
				game.updatePlayerData({ x: self.position.x, y: self.position.y });
			}, 10);
		});
	});
});
