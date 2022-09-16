export class Player {
    constructor(name, score=0, misses=0, wins=0) {
        this.name = name;
        this.score = score;
        this.misses = misses;
        this.wins = wins;
    }

    resetScore(resetScore) {
        this.score = resetScore;
    }

    addMiss() {
        this.misses += 1;
    }

    resetMisses() {
        this.misses = 0;
    }

    addWin() {
        this.wins += 1;
    }

}