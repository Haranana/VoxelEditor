import type { Vector3 } from "../vector/vector3";

export class Plane{
    #normal: Vector3; 
    #point: Vector3;

    constructor(normal: Vector3, point: Vector3){
        this.#normal = normal.normalize();
        this.#point = point;
    }

    inverseNormal(){
        this.#normal = this.#normal.multByScalar(-1);
    }

    distanceTo(p: Vector3): number{
        return this.#normal.dotProduct(p.subVector(this.#point));
    }

    //returns copy
    getNormal(): Vector3{
        return this.#normal.copy();        
    }

    //returns copy
    getPoint(): Vector3{
        return this.#point.copy();
    }
}