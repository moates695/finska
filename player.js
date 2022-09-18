export class Player {
    constructor(name, score=0, misses=0, wins=0) {
        this.name = name;
        this.score = score;
        this.misses = misses;
        this.wins = wins;
    }

    resetScore(ruleSet) {
        this.score = ruleSet.resetScore;
    }

    addScore(score) {
        this.score += score;
        return this.score;
    }

    addMiss() {
        this.misses += 1;
        return this.misses;
    }

    resetMisses() {
        this.misses = 0;
    }

    addWin() {
        this.wins += 1;
    }

}