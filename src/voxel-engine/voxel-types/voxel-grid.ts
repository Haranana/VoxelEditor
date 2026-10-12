import { Vector3 } from "../../math/vector/vector3";
import { Voxel } from "./voxel";
import { brickOccupancies, VoxelBrick, type VoxelBrickInitValues } from "./voxel-brick";
import type { VoxelCodec } from "./voxel-codec";

type BrickID = number;
type BrickHash = bigint;
type GridPosition = string;

export class VoxelBrickGrid<T extends Voxel>{
   
    #bricks: Map<BrickID, VoxelBrick>;
    #brickIdFromPosition: Map<GridPosition, BrickID>;
    #brickIdsFromHash: Map<BrickHash, BrickID[]>;

    readonly brickSize: Vector3;
    readonly gridSize: Vector3;
    readonly bricksAmount: Vector3;
    readonly voxelByteStride: number;
    readonly voxelCodec: VoxelCodec<T>
    
    //todo: should probably at some point change it to better id distribution system
    //good enough for now tho
    #nextBrickId = 0;

    /*
        Initialize parameter decides whether grid should automatically create empty voxels and add them to bricks
        should be false if wanting to avoid unnecessary for example in coping object
    */
    constructor(gridSize: Vector3, brickSize: Vector3, voxelCodec: VoxelCodec<T>, initialize: boolean = true){
        this.gridSize = gridSize;
        this.voxelCodec = voxelCodec;
        this.voxelByteStride = voxelCodec.byteStride;
        this.brickSize = brickSize;
        this.bricksAmount = new Vector3(
            Math.ceil(gridSize.x/brickSize.x),
            Math.ceil(gridSize.y/brickSize.y),
            Math.ceil(gridSize.z/brickSize.z), 
        );

        this.#bricks = new Map();
        this.#brickIdFromPosition = new Map();
        this.#brickIdsFromHash = new Map();

        if(initialize)this.#initBrickMap();
    }


    #initBrickMap(){
        for(let brickX=0; brickX<this.bricksAmount.x; brickX++){
            for(let brickY=0; brickY<this.bricksAmount.y; brickY++){
                for(let brickZ=0; brickZ<this.bricksAmount.z; brickZ++){                    
                    
                    const brickInitValues: VoxelBrickInitValues = [];
                    for(let voxelX=0; voxelX<this.brickSize.x; voxelX++){
                        for(let voxelY=0; voxelY<this.brickSize.y; voxelY++){
                            for(let voxelZ=0; voxelZ<this.brickSize.z; voxelZ++){  
                                const voxelGridPosition = new Vector3(brickX*this.brickSize.x+voxelX,
                                    brickY*this.brickSize.y+voxelY,
                                    brickZ*this.brickSize.z+voxelZ);
                                if(!this.inRange(voxelGridPosition)){
                                    brickInitValues.push(undefined);
                                }else{
                                    brickInitValues.push(null);
                                }
                            }
                        }
                    }

                    const brick = new VoxelBrick(this.brickSize, this.voxelByteStride, brickInitValues);                
                    const brickHash = brick.hash();
                    const brickGridPosition = new Vector3(brickX,brickY,brickZ).toString();
                    
                    const idsOfcurrentHash: BrickID[]|undefined = this.#brickIdsFromHash.get(brickHash);
                    if(idsOfcurrentHash){
                        let isCurrentBrickAlreadySaved = false;
                        let currentBrickId: BrickID|undefined = undefined
                        idsOfcurrentHash.forEach((id: BrickID)=>{
                            const brickOfThisId: VoxelBrick|undefined = this.#bricks.get(id);
                            if(!brickOfThisId) return;
                            if(brickOfThisId.equals(brick)){
                                isCurrentBrickAlreadySaved = true;
                                currentBrickId = id;
                            }
                        });
                        if(isCurrentBrickAlreadySaved){
                            this.#brickIdFromPosition.set(brickGridPosition , currentBrickId!);
                        }else{
                            const brickId = this.#nextBrickId++;
                            this.#bricks.set(brickId, brick);
                            idsOfcurrentHash.push(brickId);
                            this.#brickIdFromPosition.set(brickGridPosition, brickId);
                        }
                    }else{
                        const brickId = this.#nextBrickId++;
                        this.#bricks.set(brickId, brick);
                        this.#brickIdsFromHash.set(brickHash , [brickId]);
                        this.#brickIdFromPosition.set(brickGridPosition, brickId);
                    }
                }
            }            
        }
    }

    get(voxelGridPosition: Vector3): (T|null)|undefined {
        const brickGridPosition: Vector3 | undefined = this.#getBrickGridPosition(voxelGridPosition);
        if(!brickGridPosition){
            return undefined;
        }
        
        const brickId: BrickID | undefined = this.#brickIdFromPosition.get(brickGridPosition.toString());
        if(brickId===undefined){
            throw new Error(`brick ID for grid position: ${brickGridPosition} not defined`);        
        }
        const brick: VoxelBrick | undefined = this.#bricks.get(brickId);
        if(!brick){
            throw new Error(`brick for ID: ${brickId} not defined`);
        }
        const voxelInBrickPosition = this.#getVoxelInBrickPosition(voxelGridPosition);
        const voxelOffset = brick.getVoxelOffset(voxelInBrickPosition);
        if(voxelOffset===undefined){
            throw new Error(`voxel of position: ${voxelInBrickPosition.toString()} is out of brick scope`);
        }
        
        const occupancy = brick.getOccupancy(voxelOffset);
        if(occupancy === undefined || brickOccupancies.notInRange === occupancy){
            return undefined;
        }else if(brickOccupancies.empty===occupancy){
            return null;
        }
        const out = this.voxelCodec.decode(brick.data, voxelOffset);
        return out;    
    }

    /*
        returns true if set operation was succesfull, false otherwise
    */
    set(voxelGridPosition: Vector3, voxel: T|null): boolean{
        const brickGridPosition: Vector3 | undefined = this.#getBrickGridPosition(voxelGridPosition);
        if(!brickGridPosition){
            return false;
        }
        
        const brickId: BrickID | undefined = this.#brickIdFromPosition.get(brickGridPosition.toString());
        if(brickId===undefined){
            throw new Error(`brick ID for grid position: ${brickGridPosition} not defined`);        
        }
        const brick: VoxelBrick | undefined = this.#bricks.get(brickId);
        if(!brick){
            throw new Error(`brick for ID: ${brickId} not defined`);
        }
        const voxelInBrickPosition = this.#getVoxelInBrickPosition(voxelGridPosition);
        const voxelOffset = brick.getVoxelOffset(voxelInBrickPosition);
        if(voxelOffset===undefined){
            throw new Error(`voxel of position: ${voxelInBrickPosition.toString()} is out of brick scope`);
        }

        const newBrick = brick.copy();
        if(voxel===null){
            newBrick.setOccupancy(0, voxelOffset);
            this.voxelCodec.encodeEmpty(newBrick.data, voxelOffset);
        }else{
            newBrick.setOccupancy(1, voxelOffset);
            this.voxelCodec.encode(voxel, newBrick.data, voxelOffset);
        }
        this.#updateOnBrickChange(brickGridPosition, newBrick);
        return true;
    }

    /*
        Currently the function doesn't delete unused bricks from the brickMap, or BrickIdFromHash.
        If in future memory of grid starts to be a issue might want to change this function to do so.
    */
    #updateOnBrickChange(brickGridPosition: Vector3, brick: VoxelBrick){
        
        const brickGridPositionString = brickGridPosition.toString();
        const brickHash = brick.hash();
        const idsOfcurrentHash: BrickID[]|undefined = this.#brickIdsFromHash.get(brickHash);
        
        if(idsOfcurrentHash){
            let isCurrentBrickAlreadySaved = false;
            let currentBrickId: BrickID|undefined = undefined
            idsOfcurrentHash.forEach((id: BrickID)=>{
                const brickOfThisId: VoxelBrick|undefined = this.#bricks.get(id);
                if(!brickOfThisId) return;
                if(brickOfThisId.equals(brick)){
                    isCurrentBrickAlreadySaved = true;
                    currentBrickId = id;
                }
            });
            if(isCurrentBrickAlreadySaved){
                this.#brickIdFromPosition.set(brickGridPositionString , currentBrickId!);
            }else{
                const brickId = this.#nextBrickId++;
                this.#bricks.set(brickId, brick);
                idsOfcurrentHash.push(brickId);
                this.#brickIdFromPosition.set(brickGridPositionString, brickId);
            }
        }else{
            const brickId = this.#nextBrickId++;
            this.#bricks.set(brickId, brick);
            this.#brickIdsFromHash.set(brickHash , [brickId]);
            this.#brickIdFromPosition.set(brickGridPositionString, brickId);
        }



    }

    #getBrickGridPosition(voxelGridPosition: Vector3): Vector3|undefined{        
        const position = new Vector3(
            Math.floor(voxelGridPosition.x/this.brickSize.x),
            Math.floor(voxelGridPosition.y/this.brickSize.y),
            Math.floor(voxelGridPosition.z/this.brickSize.z)
        ) 
        return this.inRange(position)? position : undefined;
    }

    #getVoxelInBrickPosition(voxelGridPosition: Vector3): Vector3{
        return new Vector3(voxelGridPosition.x % this.brickSize.x,
            voxelGridPosition.y % this.brickSize.y,
            voxelGridPosition.z % this.brickSize.z,
        );         
    }

    inRange(brickGridPosition: Vector3): boolean{
        return (
            brickGridPosition.x >= 0 && brickGridPosition.x < this.bricksAmount.x &&
            brickGridPosition.y >= 0 && brickGridPosition.y < this.bricksAmount.y &&
            brickGridPosition.z >= 0 && brickGridPosition.z < this.bricksAmount.z
        )
    }

    clear(){
        this.#bricks = new Map();
        this.#brickIdFromPosition = new Map();
        this.#brickIdsFromHash = new Map();

        this.#initBrickMap();
    }

    copy(): VoxelBrickGrid<T> {
        const copy = new VoxelBrickGrid<T>(
            this.gridSize.copy(),
            this.brickSize.copy(),
            this.voxelCodec,
            false
        );

        for (const [brickId, brick] of this.#bricks) {
            copy.#bricks.set(brickId, brick.copy());
        }

        for (const [gridPosition, brickId] of this.#brickIdFromPosition) {
            copy.#brickIdFromPosition.set(gridPosition, brickId);
        }

        for (const [brickHash, brickIds] of this.#brickIdsFromHash) {
            copy.#brickIdsFromHash.set(brickHash, [...brickIds]);
        }

        copy.#nextBrickId = this.#nextBrickId;

        return copy;
    }   
}