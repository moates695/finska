export class Player {
    #name;
    #score;
    #misses;
    #wins;
    #status;

    constructor(name, score=0, misses=0, wins=0, status="active") {
        this.#name = name;
        this.#score = score;
        this.#misses = misses;
        this.#wins = wins;
        this.#status = status;
    }

    // Getters and setters

    getName() {
        return this.#name;
    }

    setName(name) {
        this.#name = name;
    }

    getScore() {
        return this.#score;
    }

    setScore(score) {
        this.#score = score;
    }

    getMisses() {
        return this.#misses;
    }

    setMisses(misses) {
        this.#misses = misses
    }

    getWins() {
        return this.#wins;
    }

    setWins(wins) {
        this.#wins = wins;
    }

    getStatus() {
        return this.#status;
    }

    setStatus(status) {
        if (!["active", "elim", "sitout"].includes(status)) {
            console.log(`"${status}" not valid status`);
            return false;
        }
        this.#status = status;
        return false;
    }

    // Additional methods

    addScore(score) {
        this.#score += score;
        return this.#score;
    }

    resetScore(ruleSet) {
        this.#score = ruleSet.resetScore;
    }

    addMiss() {
        this.#misses += 1;
        return this.#misses;
    }

    resetMisses() {
        this.#misses = 0;
    }

    addWin() {
        this.#wins += 1;
        return this.#wins;
    }

}