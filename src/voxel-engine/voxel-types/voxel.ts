import { Vector4 } from "../../math/vector/vector4";

/*
    Assumes that each attribtute of Vector4 color is 8 bit uint and not normalized float
    Float32Array is used here as more universal data storage instead of Uint8Array or similiar
*/
export class Voxel{
    color: Vector4;

    constructor(color: Vector4){
        this.color = color;
    }

    copy(){
        const vCopy = new Voxel(this.color.copy());
        return vCopy;
    }

    equals(v: Voxel): boolean{
        return (this.color.equals(v.color));
    }

}