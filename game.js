import { Player } from "./player.js";
import { RuleSet } from "./ruleSet.js";

export class Game {
    constructor(players={}, ruleSet=new RuleSet()) {
        this.players = players;
        // change back to 3 seperate lists, and then a list of lists?
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

    removePlayer(name) {
        for (let array in players) {
            for (let i = 0; i < array.length(); i++) {
                if (array[i].name === name) {
                    array.splice(i, 1);
                }
            }
        }
    }
}
