import { Player } from "./player.js";
import { RuleSet } from "./ruleSet.js";

export class Game {
    constructor(players=[], ruleSet=new RuleSet()) {
        this.players = players;
        this.ruleSet = ruleSet; 
    }

    hasPlayer(name) {
        for (let player of this.players) {
            if (player.getName() == name) return true;
        }
        return false;
    }

    addPlayer(name) {
        for (let player of this.players) {
            if (player.getName() == name) return false;
        }
        this.players.push(new Player(name));
        return true;
    }

    removePlayer(name) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].getName() == name) {
                this.players.splice(i, 1);
                break;
            }
        }
        for (let player of this.players) {
            console.log(player.getName());
        }
    }

    renamePlayer(oldName, newName) {
        if (this.hasPlayer(oldName)) return false;
        for (let player of this.players) {
            if (player.getName() != oldName) continue;
            player.setName(newName);
        }
    }

    skipTurn() {

    }

    sitoutPlayer() {

    }
}
