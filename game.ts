import {Player} from "./player.js";
import { GameRule } from "./gameRule.js";

export class Game {
    private players: Array<Player>;
    private gameRule: GameRule;
    // duration ??

    constructor(players: Array<Player>, gameRule: GameRule) {
        this.players = players;
        this.gameRule = gameRule;
    }

    // Getters && setters

    public getPlayers(): Array<Player> {
        return this.players;
    }

    public setPlayers(players: Array<Player>): void {
        this.players = players;
    }

    public getGameRule(): GameRule {
        return this.gameRule;
    } 

    public setGameRule(gameRule: GameRule): void {
        this.gameRule = gameRule;
    }

    // Additional methods

    public addPlayer(player: Player): void {
        this.players.push(player);
    }

    public removePlayer(player: Player): void {
        
    }

}