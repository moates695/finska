var Game = /** @class */ (function () {
    // duration ??
    function Game(players, gameRule) {
        this.players = players;
        this.gameRule = gameRule;
    }
    // Getters && setters
    Game.prototype.getPlayers = function () {
        return this.players;
    };
    Game.prototype.setPlayers = function (players) {
        this.players = players;
    };
    Game.prototype.getGameRule = function () {
        return this.gameRule;
    };
    Game.prototype.setGameRule = function (gameRule) {
        this.gameRule = gameRule;
    };
    // Additional methods
    Game.prototype.addPlayer = function (player) {
        this.players.push(player);
    };
    Game.prototype.removePlayer = function (player) {
    };
    return Game;
}());
export { Game };
