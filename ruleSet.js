export class RuleSet {
    constructor(ruleSet="classic", pinValue="variable", missLimit=3, 
                elimDuration=Infinity, winScore=50, resetScore=25) {
        this.ruleSet = ruleSet;
        this.pinValue = pinValue;
        this.missLimit = missLimit;
        this.elimDuration = elimDuration;
        this.winScore = winScore;
        this.resetScore = resetScore;
    }

    getPinValue() {
        return this.pinValue;
    }

    getMissLimit() {
        return this.missLimit;
    }

    getWinScore() {
        return this.winScore;
    }

    getResetScore() {
        return this.resetScore;
    }
}