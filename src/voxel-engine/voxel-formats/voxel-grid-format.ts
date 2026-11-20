import { Vector3 } from "../../math/vector/vector3";
import { VoxelEngineConfig } from "../engine-config/voxel-engine-config";
import { Voxel } from "../voxel-types/voxel";
import { baseVoxelCodec } from "../voxel-types/voxel-codec";
import { VoxelBrickGrid } from "../voxel-types/voxel-grid";
import { ChunkableVoxelFormat, SetChunkableVoxelResult, SetVoxelResult } from "./voxel-format";

export class VoxelGridFormat extends ChunkableVoxelFormat<Voxel>{
    static readonly defaultGridSize: Vector3 = new Vector3(32,32,32);
    static readonly defaultChunkSize: Vector3 = new Vector3(16,16,16);
    static readonly defaultBrickSize: Vector3 = new Vector3(4,4,4);
    
    #grid: VoxelBrickGrid<Voxel>;
    
    #chunkSize: Vector3;
    #brickSize: Vector3;
    #voxelCodec = baseVoxelCodec;

    constructor(){
        super();
        this.#chunkSize = VoxelGridFormat.defaultChunkSize.copy();
        this.#brickSize = VoxelGridFormat.defaultBrickSize.copy();
        this.#grid = new VoxelBrickGrid(VoxelGridFormat.defaultGridSize, this.#brickSize, this.#voxelCodec);
    }

    getVoxel(gridPosition: Vector3): (Voxel|null)|undefined{
        const out = this.#grid.get(gridPosition);
        return out;    
    }

    setVoxel(gridPosition: Vector3, newVoxel: Voxel|null): SetChunkableVoxelResult{
        const setVoxelSuccess = this.#grid.set(gridPosition, newVoxel);
        const dirtyChunks: Vector3[] = this.#getChunksAffectedByVoxel(gridPosition);
        const out = new SetChunkableVoxelResult(setVoxelSuccess, dirtyChunks);
        return out;
    }

    getChunksAmount(): Vector3{
        const gridSize = this.getGridSize();
        return new Vector3(Math.ceil(gridSize.x/this.#chunkSize.x),
        Math.ceil(gridSize.y/this.#chunkSize.y),
        Math.ceil(gridSize.z/this.#chunkSize.z));
    }

    getChunkSize(): Vector3 {
        return this.#chunkSize.copy();
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

    getGridSize(): Vector3 {
        return this.#grid.getGridSize();
    }

    resize(newSize: Vector3): SetChunkableVoxelResult {
        const minSize = VoxelEngineConfig.minObjectGridSize;
        const maxSize = VoxelEngineConfig.maxObjectGridSize;

        const isValidSize = (
            Number.isInteger(newSize.x) &&
            Number.isInteger(newSize.y) &&
            Number.isInteger(newSize.z) &&
            newSize.x >= minSize && newSize.x <= maxSize &&
            newSize.y >= minSize && newSize.y <= maxSize &&
            newSize.z >= minSize && newSize.z <= maxSize
        );

        if (!isValidSize) {
            return new SetChunkableVoxelResult(false, []);
        }

        if (this.#grid.getGridSize().equals(newSize)) {
            return new SetChunkableVoxelResult(true, []);
        }

        const resizeSuccess = this.#grid.resize(newSize);

        if (!resizeSuccess) {
            return new SetChunkableVoxelResult(false, []);
        }

        const chunksAmount = this.getChunksAmount();
        const dirtyChunks: Vector3[] = [];

        for (let x = 0; x < chunksAmount.x; x++) {
            for (let y = 0; y < chunksAmount.y; y++) {
                for (let z = 0; z < chunksAmount.z; z++) {
                    dirtyChunks.push(new Vector3(x, y, z));
                }
            }
        }

        return new SetChunkableVoxelResult(true, dirtyChunks);
    }    

    #getChunkForVoxel(gridPosition: Vector3): Vector3 | undefined{
        if(!this.#grid.voxelInRange(gridPosition)){
            return undefined;
        }
        const chunkId = new Vector3(Math.floor(gridPosition.x / this.#chunkSize.x),
            Math.floor(gridPosition.y / this.#chunkSize.y),
            Math.floor(gridPosition.z / this.#chunkSize.z));
        
        return chunkId;
    }
}