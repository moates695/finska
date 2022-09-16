type ruleSet = "classic" | "fast" | "custom";
type pinValue = "variable" | "number";

export class GameRule {
    private ruleSet: ruleSet;
    private pinValue: pinValue;
    private missLimit: number;
    private elimDuration: number;
    private winScore: number;

    constructor(ruleSet: ruleSet, pinValue: pinValue="variable", missLimit: number=3,
                elimDuration: number=Infinity, winScore: number=50) {
        this.ruleSet = ruleSet;
        this.missLimit = missLimit;
        this.elimDuration = elimDuration;
        this.winScore = winScore;
        if (ruleSet != "fast") {
            this.pinValue = pinValue;
        } else {
            this.pinValue = "number";
        }
    }

    // Getters && setters

    public getRuleSet(): ruleSet {
        return this.ruleSet;
    }

    public getPinValue(): pinValue {
        return this.pinValue;
    }

    public setPinValue(pinValue: pinValue): void {
        this.pinValue = pinValue;
        this.checkPreset();
    }

    public getMissLimit(): number {
        return this.missLimit;
    }

    public setMissLimit(missLimit: number): void {
        this.missLimit = missLimit;
        this.checkPreset();
    }

    public getElimDuration(): number {
        return this.elimDuration;
    }

    public setElimDuration(elimDuration: number): void {
        this.elimDuration = elimDuration;
        this.checkPreset();
    }

    public getWinScore(): number {
        return this.winScore;
    }

    public setWinScore(winScore: number): void {
        this.winScore = winScore;
        this.checkPreset();
    }

    // Additional methods

    public setClassic(): void {
        this.ruleSet = "classic";
        this.pinValue = "variable";
        this.missLimit = 3;
        this.elimDuration = Infinity;
    }

    public setFast(): void {
        this.ruleSet = "classic";
        this.pinValue = "number";
        this.missLimit = 3;
        this.elimDuration = Infinity;
    }

    public setCustom(pinValue: pinValue, missLimit: number, elimDuration: number, 
                     winScore: number): void {
        this.ruleSet = "custom";
        this.pinValue = pinValue;
        this.missLimit = missLimit;
        this.elimDuration = elimDuration;
        this.winScore = winScore;
        this.checkPreset();
    }

    private checkPreset(): void {
        if (this.missLimit == 3 && this.elimDuration == Infinity && this.winScore == 50) {
            if (this.pinValue == "variable") {
                this.ruleSet = "classic";
            } else {
                this.ruleSet = "fast";
            }
        } else {
            this.ruleSet = "custom";
        }
    }

    public toJSON() {
        let json: {[key: string]: any} = {};
        json["ruleset"] = this.ruleSet;
        json["pinvalue"] = this.pinValue;
        json["missLimit"] = this.missLimit;
        json["elimDuration"] = this.elimDuration;
        json["winScore"] = this.winScore;
        return json; 
    }

    public toString(): string {
        return JSON.stringify(this.toJSON());
    }
}