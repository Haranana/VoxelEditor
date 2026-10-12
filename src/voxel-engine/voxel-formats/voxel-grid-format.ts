import { Vector3 } from "../../math/vector/vector3";
import { Voxel } from "../voxel-types/voxel";
import { baseVoxelCodec } from "../voxel-types/voxel-codec";
import { VoxelBrickGrid } from "../voxel-types/voxel-grid";
import { SetVoxelResult, VoxelFormat } from "./voxel-format";

export class GridSetVoxelResult extends SetVoxelResult{
    readonly dirtyChunks: Vector3[] = [];
    constructor(success: boolean, dirtyChunks: Vector3[]){
        super(success)
        this.dirtyChunks = dirtyChunks;        
    }
}

export class VoxelGridFormat extends VoxelFormat<Voxel>{
    static readonly defaultGridSize: Vector3 = new Vector3(64,64,64);
    static readonly defaultChunkSize: Vector3 = new Vector3(32,32,32);
    static readonly defaultBrickSize: Vector3 = new Vector3(4,4,4);
    
    #grid: VoxelBrickGrid<Voxel>;
    
    //for now sizes are immutable on any level of hierarchy
    readonly gridSize: Vector3 = VoxelGridFormat.defaultGridSize.copy();
    readonly chunkSize: Vector3 = VoxelGridFormat.defaultChunkSize.copy();
    readonly brickSize: Vector3 = VoxelGridFormat.defaultBrickSize.copy();
    readonly #voxelCodec = baseVoxelCodec;

    constructor(){
        super();
        this.#grid = new VoxelBrickGrid(this.gridSize, this.brickSize, this.#voxelCodec);
    }

    getVoxel(gridPosition: Vector3): (Voxel|null)|undefined{
        const out = this.#grid.get(gridPosition);
        return out;    
    }

    setVoxel(gridPosition: Vector3, newVoxel: Voxel): GridSetVoxelResult{
        const setVoxelSuccess = this.#grid.set(gridPosition, newVoxel);
        const dirtyChunks: Vector3[] = this.#getChunksAffectedByVoxel(gridPosition);
        const out = new GridSetVoxelResult(setVoxelSuccess, dirtyChunks);
        return out;
    }

    getChunksAmount(): Vector3{
        return new Vector3(Math.ceil(this.gridSize.x/this.chunkSize.x),
        Math.ceil(this.gridSize.y/this.chunkSize.y),
        Math.ceil(this.gridSize.z/this.chunkSize.z));
    }

    getChunkSize(): Vector3 {
        return this.chunkSize;
    }

    #getChunksAffectedByVoxel(gridPosition: Vector3): Vector3[]{
        const chunks: Vector3[] = [];
        const thisVoxelChunk = this.#getChunkForVoxel(gridPosition);
        if(!thisVoxelChunk) return chunks;
        chunks.push(thisVoxelChunk);

        //checking if this voxel is neighbouring with any other chunk, if yes then adding them to the output
        const leftVoxelChunk = this.#getChunkForVoxel(gridPosition.addVector(new Vector3(-1,0,0)));
        const rightVoxelChunk = this.#getChunkForVoxel(gridPosition.addVector(new Vector3(1,0,0)));
        const upVoxelChunk = this.#getChunkForVoxel(gridPosition.addVector(new Vector3(0,1,0)));
        const downVoxelChunk = this.#getChunkForVoxel(gridPosition.addVector(new Vector3(0,-1,0)));
        const frontVoxelChunk = this.#getChunkForVoxel(gridPosition.addVector(new Vector3(0,0,1)));
        const backVoxelChunk = this.#getChunkForVoxel(gridPosition.addVector(new Vector3(0,0,-1)));

        if(leftVoxelChunk && (!thisVoxelChunk.equals(leftVoxelChunk))){
            chunks.push(leftVoxelChunk);
        }
        if(rightVoxelChunk && (!thisVoxelChunk.equals(rightVoxelChunk))){
            chunks.push(rightVoxelChunk);
        }
        if(upVoxelChunk && (!thisVoxelChunk.equals(upVoxelChunk))){
            chunks.push(upVoxelChunk);
        }
        if(downVoxelChunk && (!thisVoxelChunk.equals(downVoxelChunk))){
            chunks.push(downVoxelChunk);
        }
        if(frontVoxelChunk && (!thisVoxelChunk.equals(frontVoxelChunk))){
            chunks.push(frontVoxelChunk);
        }
        if(backVoxelChunk && (!thisVoxelChunk.equals(backVoxelChunk))){
            chunks.push(backVoxelChunk);
        }                                        

        return chunks;

    }

    #getChunkForVoxel(gridPosition: Vector3): Vector3 | undefined{
        if(!this.#grid.inRange(gridPosition)){
            return undefined;
        }
        const chunkId = new Vector3(Math.floor(gridPosition.x / this.chunkSize.x),
            Math.floor(gridPosition.y / this.chunkSize.y),
            Math.floor(gridPosition.z / this.chunkSize.z));
        
        return chunkId;
    }
}