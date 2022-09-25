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

    getCurrentRules() {
        let rules = {};
        rules["ruleSet"] = this.ruleSet;
        rules["pinValue"] = this.pinValue;
        rules["missLimit"] = this.missLimit;
        rules["elimDuration"] = this.elimDuration;
        rules["winScore"] = this.winScore;
        rules["resetScore"] = this.resetScore;
        return rules;
    }

    setRuleSet(ruleSet, rules={}) {
        if (ruleSet == "classic") {
            
        } else if (ruleSet == "fast") {

        } else {

        }
    }
}