var Player = /** @class */ (function () {
    function Player(name, score, misses, status, wins) {
        if (wins === void 0) { wins = 0; }
        this.name = name;
        this.score = score;
        this.misses = misses;
        this.status = status;
        this.wins = wins;
    }
    // Getters && setters
    Player.prototype.getName = function () {
        return this.name;
    };
    Player.prototype.setName = function (name) {
        this.name = name;
    };
    Player.prototype.getScore = function () {
        return this.score;
    };
    Player.prototype.setScore = function (score) {
        this.score = score;
    };
    Player.prototype.getMisses = function () {
        return this.misses;
    };
    Player.prototype.setMisses = function (misses) {
        this.misses = misses;
    };
    Player.prototype.getStatus = function () {
        return this.status;
    };
    Player.prototype.setStatus = function (status) {
        this.status = status;
    };
    Player.prototype.getWins = function () {
        return this.wins;
    };
    Player.prototype.setWins = function (wins) {
        this.wins = wins;
    };
    // Additional methods
    Player.prototype.addScore = function (score) {
        this.score += score;
    };
    Player.prototype.resetMisses = function () {
        this.misses = 0;
    };
    Player.prototype.incrementMisses = function () {
        this.misses += 1;
    };
    Player.prototype.toJSON = function () {
        var json = {};
        json["name"] = this.name;
        json["score"] = this.score;
        json["misses"] = this.misses;
        json["status"] = this.status;
        json["wins"] = this.wins;
        return json;
    };
    Player.prototype.toString = function () {
        return JSON.stringify(this.toJSON());
    };
    return Player;
}());
export { Player };
