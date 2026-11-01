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
    abstract setVoxel(gridPosition: Vector3, newVoxel: T|null): SetVoxelResult;    
}

export class SetChunkableVoxelResult extends SetVoxelResult{
    readonly dirtyChunks: Vector3[] = [];
    constructor(success: boolean, dirtyChunks: Vector3[]){
        super(success)
        this.dirtyChunks = dirtyChunks;        
    }
}

export abstract class ChunkableVoxelFormat<T extends Voxel> extends VoxelFormat<T>{
    abstract getChunksAmount(): Vector3;
    abstract getChunkSize(): Vector3;
    abstract setVoxel(gridPosition: Vector3, newVoxel: T|null): SetChunkableVoxelResult;  
}