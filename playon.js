import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getDatabase, ref, get, set, update, onValue, off } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";

import lodash from 'https://cdn.jsdelivr.net/npm/lodash@4.17/+esm';

let firebase;
let database;

export function init(params) {
	firebase = initializeApp(params);
	database = getDatabase(firebase);
}

export async function createGame() {
	const id = await generateGameId();
	const data = {
		meta: {
			timestamp: parseInt(Date.now() / 1000)
		},
		globalData: {},
		players: {}
	}
	set(ref(database, id.toString()), data);
	return id;
}

export async function joinGame(id, username, playerData) {
	if (playerData == undefined || Object.keys(playerData).length == 0) {
		playerData = { "_": "_" };
	}
	let data = (await get(ref(database, id.toString()))).val();
	if (data == undefined) throw new Error("GameNotFound");
	if (data.players == undefined) data.players = {};
	if (Object.hasOwn(data.players, username)) {
		throw new Error("UsernameAlreadyTaken");
	}
	update(ref(database, id.toString() + "/players"), {
		[username]: playerData
	});
	data.players[username] = playerData;
	return new Game(id, data, username);
}

async function generateGameId() {
	while (true) {
		let id = parseInt(Math.random() * (9999 - 1000) + 1000);
		let snapshot = await get(ref(database, id.toString()));
		if (snapshot.exists()) {
			if (parseInt(Date.now() / 1000) - snapshot.val().meta.timestamp < 86400) {
				continue;
			}
		}
		return id;
	}
}

class Game {
	constructor(id, { meta, globalData, players }, localPlayerName) {
		this.id = id;
		this.meta = meta;
		this.globalData = globalData;
		this.players = players;

		this.localPlayerName = localPlayerName;
		this.localPlayerDataCache = players[this.localPlayerName];
		delete this.localPlayerDataCache._;

		this.handlers = {
			"playerJoined": [],
			"playerUpdated": [],
			"globalDataUpdated": [],
			"connectionChange": []
		}
		this.listeners = [];

		this.listeners.push(onValue(ref(database, id.toString() + "/globalData"), (snapshot) => {
			this.globalData = snapshot.val() || {};
			this.handlers["globalDataUpdated"].forEach((func) => { func(this.globalData); });
		}));

		this.listeners.push(onValue(ref(database, id.toString() + "/players"), (snapshot) => {
			for (const [k, v] of Object.entries(snapshot.val())) {
				if (k == this.localPlayerName) continue;
				let p = this.players[k];
				if (p == undefined) {
					this.handlers["playerJoined"].forEach((func) => { func(k, v); });
				} else if (!lodash.isEqual(p, v)) {
					this.handlers["playerUpdated"].forEach((func) => { func(k, v); });
				}
			}
			this.players = snapshot.val() || {};
		}));

		this.listeners.push(onValue(ref(database, ".info/connected"), (snap) => {
			this.handlers["connectionChange"].forEach((func) => { func(snap.val()); });
		}));
	}

	on(event, func) {
		this.handlers[event].push(func);
	}

	leave() {
		this.listeners.forEach((listener) => { off(listener); });
	}

	setGlobalData(data) {
		update(ref(database, this.id.toString()), {
			globalData: data
		});
	}

	setPlayerData(data) {
		if (lodash.isEqual(data, this.localPlayerDataCache)) return false;
		update(ref(database, this.id.toString() + "/players"), { [this.localPlayerName]: data });
		this.localPlayerDataCache = data;
		return true;
	}
}