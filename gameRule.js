var GameRule = /** @class */ (function () {
    function GameRule(ruleSet, pinValue, missLimit, elimDuration, winScore) {
        if (pinValue === void 0) { pinValue = "variable"; }
        if (missLimit === void 0) { missLimit = 3; }
        if (elimDuration === void 0) { elimDuration = Infinity; }
        if (winScore === void 0) { winScore = 50; }
        this.ruleSet = ruleSet;
        this.missLimit = missLimit;
        this.elimDuration = elimDuration;
        this.winScore = winScore;
        if (ruleSet != "fast") {
            this.pinValue = pinValue;
        }
        else {
            this.pinValue = "number";
        }
    }
    // Getters && setters
    GameRule.prototype.getRuleSet = function () {
        return this.ruleSet;
    };
    GameRule.prototype.getPinValue = function () {
        return this.pinValue;
    };
    GameRule.prototype.setPinValue = function (pinValue) {
        this.pinValue = pinValue;
        this.checkPreset();
    };
    GameRule.prototype.getMissLimit = function () {
        return this.missLimit;
    };
    GameRule.prototype.setMissLimit = function (missLimit) {
        this.missLimit = missLimit;
        this.checkPreset();
    };
    GameRule.prototype.getElimDuration = function () {
        return this.elimDuration;
    };
    GameRule.prototype.setElimDuration = function (elimDuration) {
        this.elimDuration = elimDuration;
        this.checkPreset();
    };
    GameRule.prototype.getWinScore = function () {
        return this.winScore;
    };
    GameRule.prototype.setWinScore = function (winScore) {
        this.winScore = winScore;
        this.checkPreset();
    };
    // Additional methods
    GameRule.prototype.setClassic = function () {
        this.ruleSet = "classic";
        this.pinValue = "variable";
        this.missLimit = 3;
        this.elimDuration = Infinity;
    };
    GameRule.prototype.setFast = function () {
        this.ruleSet = "classic";
        this.pinValue = "number";
        this.missLimit = 3;
        this.elimDuration = Infinity;
    };
    GameRule.prototype.setCustom = function (pinValue, missLimit, elimDuration, winScore) {
        this.ruleSet = "custom";
        this.pinValue = pinValue;
        this.missLimit = missLimit;
        this.elimDuration = elimDuration;
        this.winScore = winScore;
        this.checkPreset();
    };
    GameRule.prototype.checkPreset = function () {
        if (this.missLimit == 3 && this.elimDuration == Infinity && this.winScore == 50) {
            if (this.pinValue == "variable") {
                this.ruleSet = "classic";
            }
            else {
                this.ruleSet = "fast";
            }
        }
        else {
            this.ruleSet = "custom";
        }
    };
    GameRule.prototype.toJSON = function () {
        var json = {};
        json["ruleset"] = this.ruleSet;
        json["pinvalue"] = this.pinValue;
        json["missLimit"] = this.missLimit;
        json["elimDuration"] = this.elimDuration;
        json["winScore"] = this.winScore;
        return json;
    };
    GameRule.prototype.toString = function () {
        return JSON.stringify(this.toJSON());
    };
    return GameRule;
}());
export { GameRule };
