import { Vector3 } from "../../math/vector3.type";
import { Vector4 } from "../../math/vector4.type";

//in lambert direction refers to direction of light source from the scene in [-1,1]
// eg. (1,0,1) -> +X, 0Y, +Z, so the light comes from front right corner
export class DistantLight{
    
    direction: Vector3;
    color: Vector3 = new Vector3(1,1,1);

    constructor(direction: Vector3){
        this.direction = direction.normalize();
    }

    toObj(){
        return {
            color: [this.color.x, this.color.y, this.color.z],
            direction: [this.direction.x, this.direction.y, this.direction.z],
        }
    }
}