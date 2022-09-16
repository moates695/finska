type status = "active" | "eliminated" | "sitout";

export class Player {
    private name: string;
    private score: number;
    private misses: number;
    private status: status;
    private wins: number;

    constructor(name: string, score: number, misses: number, status: status, wins: number=0) {
        this.name = name;
        this.score = score;
        this.misses = misses;
        this.status = status;
        this.wins = wins;
    }

    // Getters && setters

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getScore(): number {
        return this.score;
    }

    public setScore(score: number): void {
        this.score = score
    }

    public getMisses(): number {
        return this.misses;
    }

    public setMisses(misses: number): void {
        this.misses = misses;
    }

    public getStatus(): status {
        return this.status;
    }

    public setStatus(status: status): void {
        this.status = status;
    }

    public getWins(): number {
        return this.wins;
    }

    public setWins(wins: number): void {
        this.wins = wins;
    }

    // Additional methods

    public addScore(score: number): void {
        this.score += score;
    }

    public resetMisses(): void {
        this.misses = 0;
    }

    public incrementMisses(): void {
        this.misses += 1;
    }

    private toJSON() {
        let json: {[key: string]: any} = {};
        json["name"] = this.name;
        json["score"] = this.score;
        json["misses"] = this.misses;
        json["status"] = this.status;
        json["wins"] = this.wins;
        return json;
    }

    public toString(): string {
        return JSON.stringify(this.toJSON());
    }
}