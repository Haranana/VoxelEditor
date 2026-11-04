import { Vector3 } from "../../math/vector/vector3";
import { Voxel } from "../voxel-types/voxel";
import { baseVoxelCodec } from "../voxel-types/voxel-codec";
import { VoxelSparseList } from "../voxel-types/voxel-sparse-list";
import { SetVoxelResult, VoxelFormat } from "./voxel-format";

export class SparseListSetVoxelResult extends SetVoxelResult{
    constructor(success: boolean){
        super(success)                
    }
}

export class VoxelSparseListFormat extends VoxelFormat<Voxel>{
    static readonly defaultGridSize: Vector3 = new Vector3(32);
    readonly gridSize: Vector3 = VoxelSparseListFormat.defaultGridSize.copy();
    readonly #voxelCodec = baseVoxelCodec;
    readonly #sparseList: VoxelSparseList<Voxel> = new VoxelSparseList();

    constructor(gridSize: Vector3){
        super();
        this.gridSize = gridSize.copy();
        this.#voxelCodec;
    }

    getVoxel(gridPosition: Vector3): Voxel | null | undefined {
        return this.#sparseList.get(gridPosition.toString());            
    }

    getAllVoxels(): Map<string, Voxel|null>{
        return this.#sparseList.getAll();
    }

    setVoxel(gridPosition: Vector3, newVoxel: Voxel|null): SparseListSetVoxelResult {
        if(gridPosition.x < this.gridSize.x && gridPosition.y < this.gridSize.y && gridPosition.z < this.gridSize.z &&
            gridPosition.x >= 0 && gridPosition.y >= 0 && gridPosition.z >= 0){
            this.#sparseList.set(gridPosition.toString(),newVoxel);
            return new SparseListSetVoxelResult(true);
        }
        return new SparseListSetVoxelResult(false);
    }

    removeVoxel(gridPosition: Vector3): boolean{
        return this.#sparseList.remove(gridPosition.toString());
    }
}