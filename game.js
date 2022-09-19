import { Player } from "./player.js";
import { RuleSet } from "./ruleSet.js";

export class Game {
    constructor(players=[], ruleSet=new RuleSet()) {
        this.players = players;
        this.ruleSet = ruleSet; 
    }

    addPlayer(name) {
        for (let player of this.players) {
            if (!(player instanceof Player)) continue;
            if (player.getName() == name) return false;
        }
        this.players.push(new Player(name));
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

    skipTurn() {

    }

    sitoutPlayer() {
    }
}
