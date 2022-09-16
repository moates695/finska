import { Player } from "./player.js";
import { RuleSet } from "./ruleSet.js";

export class Game {
    constructor(players={}, ruleSet=new RuleSet()) {
        this.players = players;
        if (players === {}) {
            this.players["active"] = [];
            this.players["elim"] = [];
            this.players["sitout"] = [];
        }
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
}
