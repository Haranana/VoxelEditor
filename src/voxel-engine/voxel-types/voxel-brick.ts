import type { Vector3 } from "../../math/vector/vector3";

/*
    Initial values of empty VoxelBrick, null if each voxel is in grid and empty
    array of null or undefined if some voxels are beyond the range of the grid
    in that case null means empty voxel and undefined voxel beyond the range of the grid
*/
export type VoxelBrickInitValues = ((null|undefined)[])|null;
export type BrickOccupancyId = 0 | 1 | 2; //0 for empty voxel, 1 for filled, 2 for beyond the range of brick
export type BrickOccupancyDescription = 'empty' | 'filled' | 'notInRange'
export const brickOccupancies = {
    empty: 0,
    filled: 1,
    notInRange: 2,
} as const;
export class VoxelBrick{
    /*
    0 - voxel empty
    1 - voxel non-empty
    2 - voxel beyond grid range
    */
    #occupancyData: Uint8Array;
    data: Float32Array;
    readonly size: Vector3; //for now size is immutable (also 4x4x4 by default!)
    readonly voxelByteStride: number; //refers to stride (in bytes) of a single voxel inside the brick
    readonly stored32Floats: number;
    constructor(size: Vector3, voxelByteStride: number, initData: VoxelBrickInitValues = null, initialize: boolean = true){
        this.size = size;
        this.voxelByteStride = voxelByteStride

        const voxelsAmount = this.#getVoxelsAmount();
        const float32PerVoxel = Math.ceil(this.voxelByteStride/4); 
        this.stored32Floats = float32PerVoxel*voxelsAmount;
        this.#occupancyData = new Uint8Array(voxelsAmount);
        this.data = new Float32Array(float32PerVoxel*voxelsAmount);        
        if(initialize) this.#initializeDataBuffers(initData);
    }

    #initializeDataBuffers(initData: VoxelBrickInitValues){
        const float32PerVoxel = Math.ceil(this.voxelByteStride/4); 
        if(!initData){
            for(let i = 0; i<this.#getVoxelsAmount(); i++){
                this.#occupancyData[i] = 0;
                for(let j=0; j<float32PerVoxel; j++){
                    this.data[i*float32PerVoxel+j] = 0.0;
                }
            }
        }else{
            for(let i = 0; i<initData.length; i++){
                this.#occupancyData[i] = initData[i] === null? 0 : 2;
                for(let j=0; j<float32PerVoxel; j++){
                    this.data[i*float32PerVoxel+j] = 0.0;
                }
            }
        }   
    }

    #getVoxelsAmount(){
        return this.size.x * this.size.y * this.size.z;
    }

    // returns offset voxel of given position in brick grid
    // or undefined if offset is beyond grid scope 
    getVoxelOffset(brickPosition: Vector3): number | undefined{
        if(!this.inRange(brickPosition)) return undefined;
    
        const voxelOffset = brickPosition.x * this.size.y * this.size.z + brickPosition.y * this.size.z + brickPosition.z;
        return voxelOffset; 
    }

    inRange(position: Vector3): boolean{
        return (
            position.x >= 0 && position.x < this.size.x &&
            position.y >= 0 && position.y < this.size.y &&
            position.z >= 0 && position.z < this.size.z
        )
    }

    setOccupancy(occupancy: BrickOccupancyId, offset: number): boolean{
        if(offset<0 || offset >= this.#occupancyData.length) return false;
        this.#occupancyData[offset] = occupancy;
        return true;
    }

    getOccupancy(offset: number): BrickOccupancyId|undefined{
        if(offset<0 || offset >= this.#occupancyData.length) return undefined;
        return this.#occupancyData[offset] as BrickOccupancyId;
    }

    // Sets each voxel as empty voxel (null), 
    // except for voxels which are beyond grid range, those are not changed
    clear(){
        const voxelsAmount = this.size.x * this.size.y * this.size.z;
        const float32PerVoxel = Math.ceil(this.voxelByteStride/4); 
        const newOccupancyData = new Uint8Array(voxelsAmount);
        for(let i = 0; i < voxelsAmount; i++){
            const oldVal = this.#occupancyData[i];
            newOccupancyData[i] = oldVal === 2? oldVal : 0;
        }
        this.#occupancyData = newOccupancyData;
        this.data = new Float32Array(float32PerVoxel*voxelsAmount);
    }

    copy(): VoxelBrick {
        const copy = new VoxelBrick(
            this.size.copy(),
            this.voxelByteStride,
            null,
            false
        );

        copy.#occupancyData = new Uint8Array(this.#occupancyData);
        copy.data = new Float32Array(this.data);

        return copy;
    }

    //uses 64-bit FNV-1a
    hash(): bigint{
        const FNV64_OFFSET_BASIS = 14695981039346656037n;
        const FNV64_PRIME = 1099511628211n;
        const MASK_64 = 0xffffffffffffffffn;
        let hash = FNV64_OFFSET_BASIS;
        const dataBytes = new Uint8Array(
            this.data.buffer,
            this.data.byteOffset,
            this.data.byteLength
        );
        const occupancyDataBytes = new Uint8Array(
            this.#occupancyData.buffer,
            this.#occupancyData.byteOffset,
            this.#occupancyData.byteLength
        );

        for (let i = 0; i < dataBytes.length; i++) {
            hash ^= BigInt(dataBytes[i]);
            hash = (hash * FNV64_PRIME) & MASK_64;
        }
        for (let i = 0; i < occupancyDataBytes.length; i++) {
            hash ^= BigInt(occupancyDataBytes[i]);
            hash = (hash * FNV64_PRIME) & MASK_64;
        }
        return hash;
    }

    equals(voxelBrick: VoxelBrick): boolean{
        if( !this.size.equals(voxelBrick.size) || this.voxelByteStride!=voxelBrick.voxelByteStride){
            return false;
        }
        for (let i = 0; i < this.#occupancyData.length; i++) {
            if(this.#occupancyData[i]!==voxelBrick.#occupancyData[i]) return false;            
        }        
        for (let i = 0; i < this.data.length; i++) {
            if(this.data[i]!==voxelBrick.data[i]) return false; 
        }
        return true;
    }
}