import type { Vector4 } from "../../math/vector/vector4";
import { Voxel } from "./voxel";

//not currently used, probably will be with sparse list remake
export class SparseVoxel extends Voxel{    
    gridOffset: number;
    empty: boolean;

    constructor(color: Vector4, gridOffset: number, empty: boolean = false){
        super(color)
        this.gridOffset = gridOffset;
        this.empty = empty;
    }

    copy(){
        const vCopy = new SparseVoxel(this.color.copy(), this.gridOffset);
        return vCopy;
    }

    equals(v: SparseVoxel): boolean{
        return (this.color.equals(v.color), this.gridOffset === v.gridOffset);
    }

}