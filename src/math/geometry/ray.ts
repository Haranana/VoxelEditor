import type { Vector3 } from "../vector3.type";

export class Ray{
    direction: Vector3;
    origin: Vector3;
    constructor(origin: Vector3, direction: Vector3){
        this.origin = origin;
        this.direction = direction;
    }

    get(t: number) : Vector3{
        return this.origin.addVector(this.direction.multByScalar(t));
    }
}