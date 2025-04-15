class ExplosionAnimation {
    public singleExplosionDurationMs: number;
    public numFires: number;
    public minStartDelay: number;
    public maxStartDelay: number;

    private running: boolean;
    private animationStartTime: number;
    private animationEndTime: number;
    private frameInterval: number;
    private fireStartTime: number[];
    private fireXOffset: number[];
    private fireYOffset: number[];

    constructor(public offsetWidth: number, public offsetHeight: number, public durationMs: number, public frames: Image[]) {
        this.singleExplosionDurationMs = 400;
        this.numFires = 4;
        this.minStartDelay = 100;
        this.maxStartDelay = 500;
        this.running = false;
        this.frames = frames;
    }

    public isDone(): boolean {
        return !this.running;
    }

    public begin(): void {
        this.fireStartTime = [];
        // First fire always start immediately
        this.fireStartTime.push(0);
        // The other fires have little delays
        for (let i = 1; i < this.numFires; i++) {
            this.fireStartTime.push(randint(this.minStartDelay, this.maxStartDelay));
        }
        
        const xOffsetPlus = this.offsetWidth >> 1;
        const xOffsetMinus = -xOffsetPlus;
        const yOffsetPlus = this.offsetHeight >> 1;
        const yOffsetMinus = -yOffsetPlus;
        this.fireXOffset = [];
        this.fireYOffset = [];

        for (let i = 0; i < this.numFires; i++) {
            this.fireXOffset.push(randint(xOffsetMinus, xOffsetPlus));
            this.fireYOffset.push(randint(yOffsetMinus, yOffsetPlus));
        }

        this.frameInterval = Math.idiv(this.singleExplosionDurationMs, this.frames.length);
        this.animationStartTime = game.runtime();
        this.animationEndTime = this.animationStartTime + this.durationMs;
        this.running = true;
    }

    public draw(targetImg: Image, x: number, y: number): void {
        if (!this.running)
            return;

        const now = game.runtime();
        const deltaSinceStart = now - this.animationStartTime;

        if (now >= this.animationEndTime) {
            this.running = false;
            return;
        }

        for (let i = 0; i < this.numFires; i++) {
            const startTime = this.fireStartTime[i];
            if (deltaSinceStart >= startTime) {
                const frameIndex = Math.idiv(deltaSinceStart - startTime, this.frameInterval);
                if (frameIndex < this.frames.length) {
                    const frameImg = this.frames[frameIndex];
                    const drawX = x - (frameImg.width >> 1) + this.fireXOffset[i];
                    const drawY = y - (frameImg.height >> 1) + this.fireYOffset[i];
                    targetImg.drawTransparentImage(frameImg, drawX, drawY);
                } else {
                    const xOffsetPlus = this.offsetWidth >> 1;
                    const xOffsetMinus = -xOffsetPlus;
                    const yOffsetPlus = this.offsetHeight >> 1;
                    const yOffsetMinus = -yOffsetPlus;

                    this.fireStartTime[i] = deltaSinceStart + randint(this.minStartDelay, this.maxStartDelay);
                    this.fireXOffset[i] = randint(xOffsetMinus, xOffsetPlus);
                    this.fireYOffset[i] = randint(yOffsetMinus, yOffsetPlus);
                }
            }
        }
    }
}
