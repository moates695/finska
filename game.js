import { Player } from "./player.js";
import { RuleSet } from "./ruleSet.js";

export class Game {
    constructor(players=[], ruleSet=new RuleSet()) {
        this.players = players;
        this.ruleSet = ruleSet; 
    }

    getPlayer(name) {
        for (let player of this.players) {
            if (player.getName() == name) return player;
        }
        return;
    }

    hasPlayer(name) {
        for (let player of this.players) {
            if (player.getName() == name) return true;
        }
        return false;
    }

    addPlayer(name) {
        let allBeyond = this.players.length == 0 ? false : true;
        for (let player of this.players) {
            if (player.getScore() < this.ruleSet.getResetScore()) allBeyond = false;
            if (player.getName() == name) return false;
        }
        let score = allBeyond ? this.ruleSet.getResetScore() : 0;
        this.players.push(new Player(name, score));
        return true;
    }

    removePlayer(name) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].getName() == name) {
                this.players.splice(i, 1);
                break;
            }
        }
    }

    renamePlayer(oldName, newName) {
        if (!this.hasPlayer(oldName)) return false;
        for (let player of this.players) {
            if (player.getName() != oldName) continue;
            player.setName(newName);
        }
    }

    skipTurn() {
        this.#nextPlayer();
    }

    sitoutPlayer() {
        this.player[0].setStatus("sitout");
        this.#nextPlayer();
    }

    getUpcoming() {
        let upcoming = [];
        let last = false;
        for (let player of this.players) {
            if (!player.isActive()) continue;
            upcoming.push(player.getName());
            if (last) break;
            last = true;
        }
        return upcoming;
    }

    inScoreOrder() {
        let order = [];
        for (let player of this.players) {
            let inserted = false;
            for (let i = 0; i < order.length; i++) {
                if (order[i].getScore() >= player.getScore()) continue;
                inserted = true;
                order.splice(i, 0, player);
                break;
            }
            if (!inserted) {
                order.push(player);
            }
        }
        return order;
    }

    newOrder(order) {
        let temp = [...this.players];
        this.players = [];
        for (let i = 0; i < temp.length; i++) {
            for (let key in order) {
                if (order[key] != i) continue;
                for (let player of temp) {
                    if (player.getName() != key) continue;
                    this.players.push(player);
                    break;
                }
                break;
            }
        }
    }

    #nextPlayer() {
        for (let _ of this.players) {
            this.players.push(this.players.shift());
            if (this.players[0].isActive()) return true;
        }
        return false;
    }

    addScore(score, name=null) {
        //this.players[0].setlastScore(score);
        if (score == 0) {
            this.players[0].addMiss(this.ruleSet.getMissLimit());
            if (!this.#nextPlayer()) {
                document.getElementById("gameScreen").style.display = "none";
                document.getElementById("loseScreen").style.display = "block";
                for (let player of this.players) {
                    player.resetMisses();
                    if (player.getStatus() != "sitout") {
                        player.setStatus("active");
                    }
                }
            }
            return;
        }
        this.players[0].resetMisses();
        if (this.players[0].addScore(score, this.ruleSet.getWinScore(), this.ruleSet.getResetScore())) {
            document.getElementById("gameScreen").style.display = "none";
            document.getElementById("winScreen").style.display = "block";
            let headers = document.querySelectorAll("#scoreboardTable th");
            if (headers.length < 4) {
                let header = document.createElement("th");
                header.appendChild(document.createTextNode("Wins"));
                headers[headers.length - 1].after(header);
            } 
        }
        this.#nextPlayer();
    }

    numActive() {
        let num = 0;
        for (let player of this.players) {
            if (player.isActive()) num++;
        }
        return num;
    }

    anyWins() {
        for (let player of this.players) {
            if (player.getWins() != 0) return true;
        }
        return false;
    }

    getPinValue() {
        return this.ruleSet.getPinValue();
    }

    getWinScore() {

    }

    canWin(curr) {
        let winScore = this.ruleSet.getWinScore();
        if ((this.ruleSet.getPinValue() == "variable" && winScore - curr <= 12) ||
            (this.ruleSet.getPinValue() == "pin" && winScore - curr <= 78)) {
            return winScore - curr;
        }
        return null;
    }

    changeLastThrow(names) {
        for (let player of this.players) {
            if (!Object.keys(names).includes(player.getName())) continue;
            player.changeLastThrow(names[player.getName()], this.ruleSet.getWinScore(),
                                   this.ruleSet.getResetScore(), this.ruleSet.getMissLimit());
            break;
        }

        // determine winner, or all losers
    }

}
