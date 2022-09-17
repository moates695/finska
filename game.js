import { Player } from "./player.js";
import { RuleSet } from "./ruleSet.js";

export class Game {
    constructor(active=[], elim=[], sitout=[], ruleSet=new RuleSet()) {
        this.active = active;
        this.elim = elim;
        this.sitout = sitout;
        this.ruleSet = ruleSet; 
    }

    addPlayer(name) {
        for (let array in players) {
            for (let player in array) {
                if (player.name === name) return false;
            }
        }
        this.players["active"].push(new Player(name));
        return true;
    }

    removePlayer(name) {
        for (let array in [this.active, this.elim, this.sitout]) {
            let found = false;
            for (let i = 0; i < array.length; i++) {
                if (array[i].name === name) {
                    array.splice(i, 1);
                    found = true;
                    break;
                }
            }
            if (found) break; 
        }
        /* for (let i = 0; i < this.active.length; i++) {
            if (this.active[i].name === name) {
                array.splice(i, 1);
                break;
            }
        } */
    }
}
