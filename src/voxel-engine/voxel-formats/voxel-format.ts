import type { Vector2 } from "../../math/vector/vector2";
import type { Vector3 } from "../../math/vector/vector3";
import type { Voxel } from "../voxel-types/voxel";

export class SetVoxelResult{
    readonly success: boolean;
    constructor(success: boolean){
        this.success = success;
    }
}

export abstract class VoxelFormat<T extends Voxel> {
    abstract getVoxel(gridPosition: Vector3): ((T|null)|undefined);
    abstract setVoxel(gridPosition: Vector3, newVoxel: T): SetVoxelResult;    
    abstract getChunksAmount(): Vector3;
    abstract getChunkSize(): Vector3;
}