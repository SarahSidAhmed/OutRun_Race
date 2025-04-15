class Countdown {
    private running: boolean;
    private loadTime: number;
    private endTime: number;

    constructor() {
        this.running = false;        
    }

    public load(seconds: number): void {
        const wasRunning = this.running;
        if (wasRunning)
            this.stop();

        this.loadTime = Math.round(seconds * 1000);

        if (wasRunning)
            this.start();
    }

    public add(seconds: number): void {
        const wasRunning = this.running;
        if (wasRunning)
            this.stop();

        this.loadTime += Math.round(seconds * 1000);

        if (wasRunning)
            this.start();
    }

    public isExpired(): boolean {
        if (this.running)
            return this.endTime < game.runtime();
        else
            return this.loadTime < 0;
    }

    public start(): void {
        if (!this.running) {
            this.endTime = game.runtime() + this.loadTime;
            this.running = true;
        }
    }

    public stop(): void {
        if (this.running) {
            this.loadTime = this.loadTime - game.runtime();
            this.running = false;
        }
    }

    public remainingTimeMs(): number {
        let result: number;
        if (this.running)
            result = this.endTime - game.runtime();
        else
            result = this.loadTime;

        return result < 0 ? 0 : result;
    }

    public remainingTime(): number {
        return Math.idiv(this.remainingTimeMs(), 1000);
    }
}