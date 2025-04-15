const CAR_MAX_SPEED = 293 * POS_FIXED_MATH_ONE;
const CAR_SPEED_TRAVEL_FACTOR = 2000;
const CAR_TURN_WEIGHT = 80 * POS_FIXED_MATH_ONE;
const CAR_CURVE_WEIGHT = 8;

const CAR_X_MOVE_RANGE = Math.round(STRIPE_WIDTH * 1.4) * POS_FIXED_MATH_ONE;
const CAR_X_MOVE_RANGE_P = Math.idiv(CAR_X_MOVE_RANGE, 2);
const CAR_X_MOVE_RANGE_M = -CAR_X_MOVE_RANGE_P;

const CAR_MAX_OFFROAD_SPEED = 80 * POS_FIXED_MATH_ONE;

class CarAccelerationPoint {
    constructor(public speed: number, public acceleration: number) {        
    }
}

const CAR_ACCELERATION_CURVE: CarAccelerationPoint[] = [
    new CarAccelerationPoint(0 * POS_FIXED_MATH_ONE, 35 * POS_FIXED_MATH_ONE),
    new CarAccelerationPoint(50 * POS_FIXED_MATH_ONE, 32 * POS_FIXED_MATH_ONE),
    new CarAccelerationPoint(100 * POS_FIXED_MATH_ONE, 27 * POS_FIXED_MATH_ONE),
    new CarAccelerationPoint(150 * POS_FIXED_MATH_ONE, 22 * POS_FIXED_MATH_ONE),
    new CarAccelerationPoint(200 * POS_FIXED_MATH_ONE, 15 * POS_FIXED_MATH_ONE),
    new CarAccelerationPoint(250 * POS_FIXED_MATH_ONE, 10 * POS_FIXED_MATH_ONE),
    new CarAccelerationPoint(270 * POS_FIXED_MATH_ONE, 5 * POS_FIXED_MATH_ONE),
    new CarAccelerationPoint(280 * POS_FIXED_MATH_ONE, Math.round(3.5 * POS_FIXED_MATH_ONE)),
    new CarAccelerationPoint(285 * POS_FIXED_MATH_ONE, Math.round(2.8 * POS_FIXED_MATH_ONE)),
    new CarAccelerationPoint(290 * POS_FIXED_MATH_ONE, Math.round(1 * POS_FIXED_MATH_ONE)),
];

const CAR_BRAKING_CURVE: CarAccelerationPoint[] = [
    new CarAccelerationPoint(0 * POS_FIXED_MATH_ONE, -70 * POS_FIXED_MATH_ONE),
    new CarAccelerationPoint(50 * POS_FIXED_MATH_ONE, -60 * POS_FIXED_MATH_ONE),
    new CarAccelerationPoint(100 * POS_FIXED_MATH_ONE, -50 * POS_FIXED_MATH_ONE),
    new CarAccelerationPoint(150 * POS_FIXED_MATH_ONE, -45 * POS_FIXED_MATH_ONE),
    new CarAccelerationPoint(200 * POS_FIXED_MATH_ONE, -38 * POS_FIXED_MATH_ONE),
    new CarAccelerationPoint(250 * POS_FIXED_MATH_ONE, -30 * POS_FIXED_MATH_ONE),
    new CarAccelerationPoint(CAR_MAX_SPEED, -25 * POS_FIXED_MATH_ONE),
];

const CAR_COASTING_ACCELERATION = -12 * POS_FIXED_MATH_ONE;
const CAR_HARD_STOP_ACCELERATION = -CAR_MAX_SPEED * 2 * POS_FIXED_MATH_ONE;

class CarPhysics {
    private _speedFP: number;
    private _traveledDistanceFP: number;
    private _deltaTraveledDistanceFP: number;
    private _lastRun: number;
    private _carXPosFP: number;

    constructor() {
        this.clear();
    }

    public setSpeed(value: number) {
        this._speedFP = Math.imul(value, POS_FIXED_MATH_ONE);
    }

    public speed(): number {
        return Math.idiv(this._speedFP, POS_FIXED_MATH_ONE);
    }

    public traveledDistance(): number {
        return Math.idiv(this._traveledDistanceFP, POS_FIXED_MATH_ONE)
    }

    public deltaTraveledDistance(): number {
        return Math.idiv(this._deltaTraveledDistanceFP, POS_FIXED_MATH_ONE)
    }

    public setCarXPos(value: number): void {
        this._carXPosFP = Math.imul(value, POS_FIXED_MATH_ONE);
    }

    public carXPos(): number {
        return Math.idiv(this._carXPosFP, POS_FIXED_MATH_ONE);
    }

    public updateSpeed(accelerate: boolean, brake: boolean, turnLeft: boolean, turnRight: boolean, offRoad: boolean): void {
        const now = game.runtime();
        const deltaT = now - this._lastRun;
        this._lastRun = now;

        if (offRoad && accelerate) {
            if (this._speedFP > CAR_MAX_OFFROAD_SPEED) {
                accelerate = false;
                brake = true;
            }
        }

        // Update the speed
        if (brake) {
            for (let i = CAR_BRAKING_CURVE.length - 1; i >= 0; i--) {
                const point = CAR_BRAKING_CURVE[i];
                if (this._speedFP >= point.speed) {
                    this._speedFP += Math.idiv(Math.imul(point.acceleration, deltaT), 1000);
                    break;
                }
            }        
        } else if (accelerate) {
            for (let i = CAR_ACCELERATION_CURVE.length - 1; i >= 0; i--) {
                const point = CAR_ACCELERATION_CURVE[i];
                if (this._speedFP >= point.speed) {
                    this._speedFP += Math.idiv(Math.imul(point.acceleration, deltaT), 1000);
                    break;
                }
            }        
        } else {
            this._speedFP += Math.idiv(Math.imul(CAR_COASTING_ACCELERATION, deltaT), 1000);
        }

        if (this._speedFP > CAR_MAX_SPEED) {
            this._speedFP = CAR_MAX_SPEED;
        } else if (this._speedFP < 0) {
            this._speedFP = 0;
        }

        this.updateTravelDistance(deltaT);

        // Update car X position when the car is running
        let deltaX = 0;
        if (this._speedFP > POS_FIXED_MATH_ONE) {
            if (turnLeft && !turnRight)
                deltaX = -CAR_TURN_WEIGHT;
            else if (!turnLeft && turnRight)
                deltaX = CAR_TURN_WEIGHT;
        }

        deltaX = Math.idiv(Math.imul(deltaX, deltaT), 1000);
        this._carXPosFP = Math.constrain(this._carXPosFP + deltaX, CAR_X_MOVE_RANGE_M, CAR_X_MOVE_RANGE_P);
    }

    public applyRoadDeltaCurve(roadCurveDelta: number): void {
        const curveDisplacement = Math.imul(roadCurveDelta, CAR_CURVE_WEIGHT);
        this._carXPosFP = Math.constrain(this._carXPosFP - curveDisplacement, CAR_X_MOVE_RANGE_M, CAR_X_MOVE_RANGE_P);
    }
    
    public hardStop(): void {
        const now = game.runtime();
        const deltaT = now - this._lastRun;
        this._lastRun = now;

        this._speedFP += Math.idiv(Math.imul(CAR_HARD_STOP_ACCELERATION, deltaT), 1000);        
        if (this._speedFP < 0)
                this._speedFP = 0;

        this.updateTravelDistance(deltaT);
    }

    public moveToXPos(xPos: number, speed: number) {
        const now = game.runtime();
        const deltaT = now - this._lastRun;
        this._lastRun = now;

        const xPosFP = Math.imul(xPos, POS_FIXED_MATH_ONE);
        const distanceToXPos = xPosFP - this._carXPosFP;

        let deltaXFP = Math.idiv(Math.imul(Math.imul(speed, POS_FIXED_MATH_ONE), deltaT), 1000);
        if (deltaXFP > Math.abs(distanceToXPos))
            deltaXFP = distanceToXPos;
        else if (distanceToXPos < 0)
            deltaXFP = -deltaXFP;

        let pippo = this._carXPosFP;
        this._carXPosFP += deltaXFP;
    }

    public clear(): void {
        this._lastRun = game.runtime();
        this._speedFP = 0;
        this._traveledDistanceFP = 0;
        this._deltaTraveledDistanceFP = 0;
        this._carXPosFP = 0;
    }

    private updateTravelDistance(deltaTime: number): void {
        // Update traveled distance and delta traveled distance
        const oldTraveledDistanceFP = this._traveledDistanceFP;
        this._traveledDistanceFP += Math.idiv(Math.imul(this._speedFP, deltaTime), CAR_SPEED_TRAVEL_FACTOR);
        this._deltaTraveledDistanceFP = this._traveledDistanceFP - oldTraveledDistanceFP;
    }
}