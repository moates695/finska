import { Player } from "./player.js";
import { RuleSet } from "./ruleSet.js";

export class Game {
    constructor(players={}/* active=[], elim=[], sitout=[] */, ruleSet=new RuleSet()) {
        /* this.active = active;
        this.elim = elim;
        this.sitout = sitout; */
        this.players = players;
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
        for (let array in this.players) {
            for (let i = 0; i < array.length; i++) {
                if (array[i].name === name) {
                    array.splice(i, 1);
                    return true;
                }
            } 
        }
        return false;
    }
}
