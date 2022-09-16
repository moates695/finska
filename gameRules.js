var GameRules = /** @class */ (function () {
    function GameRules(ruleSet, pinValue, missLimit, elimDuration, winScore) {
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
    GameRules.prototype.getRuleSet = function () {
        return this.ruleSet;
    };
    GameRules.prototype.getPinValue = function () {
        return this.pinValue;
    };
    GameRules.prototype.setPinValue = function (pinValue) {
        this.pinValue = pinValue;
        this.checkPreset();
    };
    GameRules.prototype.getMissLimit = function () {
        return this.missLimit;
    };
    GameRules.prototype.setMissLimit = function (missLimit) {
        this.missLimit = missLimit;
        this.checkPreset();
    };
    GameRules.prototype.getElimDuration = function () {
        return this.elimDuration;
    };
    GameRules.prototype.setElimDuration = function (elimDuration) {
        this.elimDuration = elimDuration;
        this.checkPreset();
    };
    GameRules.prototype.getWinScore = function () {
        return this.winScore;
    };
    GameRules.prototype.setWinScore = function (winScore) {
        this.winScore = winScore;
        this.checkPreset();
    };
    // Additional methods
    GameRules.prototype.setClassic = function () {
        this.ruleSet = "classic";
        this.pinValue = "variable";
        this.missLimit = 3;
        this.elimDuration = Infinity;
    };
    GameRules.prototype.setFast = function () {
        this.ruleSet = "classic";
        this.pinValue = "number";
        this.missLimit = 3;
        this.elimDuration = Infinity;
    };
    GameRules.prototype.setCustom = function (pinValue, missLimit, elimDuration, winScore) {
        this.ruleSet = "custom";
        this.pinValue = pinValue;
        this.missLimit = missLimit;
        this.elimDuration = elimDuration;
        this.winScore = winScore;
        this.checkPreset();
    };
    GameRules.prototype.checkPreset = function () {
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
    return GameRules;
}());
export { GameRules };
