### PlayOn
A bare-bones JavaScript multiplayer game framework that utilises Firebase Realtime Database.

#### Quick Start
Import PlayOn:
```js
import playon from "https://ninjadev64.github.io/PlayOn/playon.js";
```
Or using vanilla JavaScript:
```js
import("https://ninjadev64.github.io/PlayOn/playon.js").then((playon) => {
	// use PlayOn here
});
```

Initialise PlayOn:
```js
playon.init(firebaseConfig);
```
where `firebaseConfig` is a Firebase configuration object for a project that has the Realtime Database enabled. For more information see [here](https://firebase.google.com/docs/database/web/start?hl=en&authuser=0#add_the_js_sdk_and_initialize).

#### Creating and joining games
Create a game:
```js
playon.createGame().then((id) => { ... });
```
Join a game:
```js
playon.joinGame(id, username, initialData).then((game) => { ... });
```
PlayOn will throw errors "GameNotFound" and "UsernameAlreadyTaken" from `joinGame` respectively.

#### Setting data
Setting global data:
```js
game.setGlobalData({ "gameState": "waiting" });
```
Setting player-specific data:
```js
game.setPlayerData({ x: 20, y: 40 });
```
Player data will not be re-written to the database if the contents have not changed. Both methods will not delete existing data, only update the desired values.

#### Listening for events
```js
function playerJoined(name, initialData) { ... };
function playerUpdated(name, data) { ... };
function globalDataUpdated(data) { ... };
function connectionChange(connected) { ... };

// game.on(event, function);
game.on("playerJoined", playerJoined);
```

#### Accessing data
The below properties should only be read from. Use `setGlobalData` and `setPlayerData` to write to these properties as described above.
```js
game.globalData; // { "gameState": "waiting" }
game.players; // { "ninjadev64": { x: 20, y: 40 } ... }
```

#### Example
See the `examples` folder for an example.