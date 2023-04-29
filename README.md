### PlayOn
A bare-bones JavaScript multiplayer game framework that utilises Firebase Realtime Database.

#### Quick Start
Import PlayOn:
```js
import playon from "https://ninjadev64.github.io/PlayOn/playon.js";
```
Or using [vanilla JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import):
```js
import("https://ninjadev64.github.io/PlayOn/playon.js").then((playon) => {
	// use PlayOn here
});
```
If you wish to self-host or minify, simply download the library.

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
PlayOn will handle removing games that are more than a day old automatically.

Join a game:
```js
playon.joinGame(id, username, initialData).then((game) => { ... });
```
PlayOn will throw errors "GameNotFound" and "UsernameAlreadyTaken" from `joinGame` respectively. You should register existing players in your code when joining a game (see below for `game.players`).

#### Updating data
Updating global data:
```js
game.updateGlobalData({ "gameState": "waiting" });
```
Updating player-specific data:
```js
game.updatePlayerData({ x: 20, y: 40 });
```
Data will not be re-written to the database if the contents have not changed. Both methods will not delete existing data, only update the desired values.
Any Firebase limitations apply here (e.g. arrays are not supported).

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
The below properties should only be read from. Use `updateGlobalData` and `updatePlayerData` to write to these properties as described above.
```js
game.globalData; // { "gameState": "waiting" }
game.players; // { "ninjadev64": { x: 20, y: 40 } ... }
```

#### Leaving
Call `game.leave()` to deregister all internal listeners when the Game object is no longer needed.

#### Example
See the [example folder](https://github.com/ninjadev64/PlayOn/tree/master/example) for an example ([live demo](https://ninjadev64.github.io/PlayOn/example/)). The example uses [p5.js](https://p5js.org/) and [p5play](https://p5play.org/) to create a simple movement demo where the current player is highlighted in red.