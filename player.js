export class Player {
    #name;
    #score;
    #misses;
    #wins;
    #status;
    #lastScore;
    #lastThrow;
    #lastMisses;

    constructor(name, score=0, misses=0, wins=0, status="active", lastScore=null, lastThrow=null, lastMisses=null) {
        this.#name = name;
        this.#score = score;
        this.#misses = misses;
        this.#wins = wins;
        this.#status = status;
        this.#lastScore = lastScore;
        this.#lastThrow = lastThrow;
        this.#lastMisses = lastMisses;
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

    getLastScore() {
        return this.#lastScore;
    }

    setLastScore(lastScore) {
        this.#lastScore = lastScore;
    }

    getLastThrow() {
        return this.#lastThrow;
    }

    setLastThrow(lastThrow) {
        this.#lastThrow = lastThrow;
    }

    getLastMisse() {
        return this.#lastMisses;
    }

    setLastMisses(lastMisses) {
        this.#lastMisses = lastMisses;
    }

    // Additional methods

    addScore(score, winScore, resetScore) {
        this.#lastScore = this.#score;
        this.#lastThrow = score;
        this.#lastMisses = this.#misses;

        this.#score += score;
        if (this.#score == winScore) {
            this.#score = resetScore;
            this.#wins += 1;
            return true;
        } else if (this.#score > winScore) {
            this.#score = resetScore; 
        }
        return false;
    }

    resetScore(ruleSet) {
        this.#score = ruleSet.resetScore;
    }

    addMiss(missLimit) {
        this.#misses += 1;
        if (this.#misses >= missLimit) {
            this.#status = "elim";
        }
        return this.#misses;
    }

    resetMisses() {
        this.#misses = 0;
    }

    addWin() {
        this.#wins += 1;
        return this.#wins;
    }

    isActive() {
        if (this.#status == "active") {
            return true;
        } 
        return false;
    }

    changeLastThrow(score, winScore, resetScore, missLimit) {
        if (this.#score == resetScore && this.#lastScore == resetScore && this.#lastThrow > 0) {
            this.#wins -= 1;
        }
        
        if (score == 0) {
            this.#misses = this.#lastMisses + 1;
            if (this.#misses == missLimit) {
                this.#status = "elim";
            }
            return;
        }
        if (this.#status != "sitout") {
            this.#status = "active";
        }

        this.#score = this.#lastScore + score;
        if (this.#score == winScore) {

        } else if (this.#score) {

        }

    }

}