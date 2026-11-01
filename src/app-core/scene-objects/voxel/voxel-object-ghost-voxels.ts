import { Vector3 } from "../../../math/vector/vector3";
import { VoxelSparseListFormat, type SparseListSetVoxelResult } from "../../../voxel-engine/voxel-formats/voxel-sparse-list-format";
import type { Voxel } from "../../../voxel-engine/voxel-types/voxel";

export class VoxelObjectGhostVoxels{    
    #voxelList: VoxelSparseListFormat; 
    #gridSize: Vector3;

    constructor(gridSize: Vector3){
        this.#gridSize = gridSize.copy();
        this.#voxelList = new VoxelSparseListFormat(this.#gridSize);
    }

    set(gridPos: Vector3, v: Voxel|null): SparseListSetVoxelResult{
        return this.#voxelList.setVoxel(gridPos, v);
    }

    get(gridPos: Vector3): Voxel|null|undefined{
        return this.#voxelList.getVoxel(gridPos);
    }

    getAll(){
        return this.#voxelList.getAllVoxels();
    }

    remove(gridPos: Vector3): boolean{
        return this.#voxelList.removeVoxel(gridPos);
    }

    clear(){
        const voxelSparseList = this.#voxelList.getAllVoxels();
        voxelSparseList.forEach((_,k)=>{
            this.#voxelList.removeVoxel(Vector3.fromString(k));
        });
    }

}