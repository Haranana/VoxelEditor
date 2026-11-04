import { clamp, gridOffsetToPos } from "../../../math/utils";
import { Vector3 } from "../../../math/vector/vector3";
import { Vector4 } from "../../../math/vector/vector4";
import { BitSet } from "../../classes/Bitset";
import { UInt32List } from "../../classes/UInt32List";

// resize not supported for now;
//possibly could just use a occupancy 1-bit mask?
export class VoxelObjectSelectedArea{

    static readonly #defaultColor: Vector4 = new Vector4(255,255,255,192); 
    
    //Uint32 should be enough for grid of size about 1600^3, for anything more
    //this will have to be changed (maybe for bigint array?)
    #selectedVoxelsOffsets: UInt32List = new UInt32List();
    #selectedVoxelsBitset: BitSet;
    #gridSize: Vector3;
    color: Vector4 = VoxelObjectSelectedArea.#defaultColor;

    constructor(gridSize: Vector3){
        this.#selectedVoxelsBitset = new BitSet(gridSize.x * gridSize.y * gridSize.z);
        this.#gridSize = gridSize.copy();
    }

    //returns false if voxel of this position is already in selected area
    //true otherwise
    //does not check whether given position fits inside the grid
    addGridPosition(v: Vector3): boolean{        
        if(this.hasGridPosition(v)){
            return false;
        }
        const offset = v.x * this.#gridSize.y * this.#gridSize.z + v.y * this.#gridSize.z + v.z;
        this.#selectedVoxelsOffsets.add(offset);
        this.#selectedVoxelsBitset.add(offset);
        return true;
    }

    //doesn't check if offset already exists in the list
    addGridPositionUnsafe(v: Vector3): void {
        const offset = v.x * this.#gridSize.y * this.#gridSize.z
            + v.y * this.#gridSize.z
            + v.z;

        this.#selectedVoxelsOffsets.add(offset);
        this.#selectedVoxelsBitset.add(offset);
    }
    addOffset(offset: number): boolean{        
        if(this.hasOffset(offset)){
            return false;
        }
        this.#selectedVoxelsOffsets.add(offset);
        this.#selectedVoxelsBitset.add(offset);
        return true;
    }    

    //returns true if voxel position was found and removed
    //false if voxel position couldn't be found 
    removeGridPosition(v: Vector3): boolean{
        const offset = v.x * this.#gridSize.y * this.#gridSize.z + v.y * this.#gridSize.z + v.z;
        const removed = this.#selectedVoxelsBitset.delete(offset); 
        if(removed){
            this.#selectedVoxelsOffsets.remove(offset);
        }
        return removed;
    }

    removeOffset(offset: number): boolean{
        const removed = this.#selectedVoxelsBitset.delete(offset);
        if(removed){ 
            this.#selectedVoxelsOffsets.remove(offset);
        }
        return removed;
    }

    hasGridPosition(v: Vector3): boolean {
        if (
            v.x < 0 || v.x >= this.#gridSize.x ||
            v.y < 0 || v.y >= this.#gridSize.y ||
            v.z < 0 || v.z >= this.#gridSize.z
        ) {
            return false;
        }

        const offset = v.x * this.#gridSize.y * this.#gridSize.z
            + v.y * this.#gridSize.z + v.z;

        return this.#selectedVoxelsBitset.has(offset);
    }

    hasOffset(offset: number): boolean{
        return this.#selectedVoxelsBitset.has(offset);
        //const out = this.#selectedVoxelsOffsets.array().find((curOffset)=>curOffset===offset)!==undefined;
        //return out;
    }

    
    //  returns list id of given voxel position (either by its gridPosition or gridOffset)
    //  or undefined if none is found
    /*
    findGridPosition(v: Vector3): number|undefined{
        const offset = v.x * this.#gridSize.y * this.#gridSize.z + v.y * this.#gridSize.z + v.z;
        
        //const out = this.#selectedVoxelsOffsets.array().find((curOffset)=>curOffset===offset)
        //return out;
    }

    findOffset(offset: number): number|undefined{
        const out = this.#selectedVoxelsOffsets.array().find((curOffset)=>curOffset===offset)
        return out;
    }



    getGridPositionStrings(): string[]{
        const out: string[] = []; 
        this.#selectedVoxelsOffsets.array().forEach((vOffset)=>{
            out.push(this.#GridOffsetToGridPosition(vOffset).toString());
        })
        return out;
    }*/

    getBoundingBoxCenter(): Vector3 | null {
        if (this.#selectedVoxelsOffsets.size === 0) return null;

        const min = this.#gridSize.copy();
        const max = new Vector3(0, 0, 0);

        this.#selectedVoxelsOffsets.array().forEach((gridOffset) => {
            const gridPos = gridOffsetToPos(gridOffset, this.#gridSize);

            if (gridPos.x < min.x) min.x = gridPos.x;
            if (gridPos.y < min.y) min.y = gridPos.y;
            if (gridPos.z < min.z) min.z = gridPos.z;

            if (gridPos.x > max.x) max.x = gridPos.x;
            if (gridPos.y > max.y) max.y = gridPos.y;
            if (gridPos.z > max.z) max.z = gridPos.z;
        });

        return new Vector3(
            Math.floor((min.x + max.x) / 2),
            Math.floor((min.y + max.y) / 2),
            Math.floor((min.z + max.z) / 2)
        );
    }

    getGridPositions(): Vector3[]{
        const out:Vector3[] = [];
        this.#selectedVoxelsOffsets.array().forEach((vOffset)=>{
            out.push(this.#GridOffsetToGridPosition(vOffset));
        });
        return out;
    }

    getVoxelsCount(): number{
        return this.#selectedVoxelsOffsets.size;
    }

    #GridOffsetToGridPosition(offset: number){        
        let tempOffset = offset;
        const x = Math.floor(tempOffset/ (this.#gridSize.y * this.#gridSize.z));
        tempOffset = tempOffset % (this.#gridSize.y * this.#gridSize.z);
        const y = Math.floor(tempOffset/this.#gridSize.z );  
        tempOffset = tempOffset%this.#gridSize.z;
        const z = tempOffset;  
        return new Vector3(x,y,z);
    }

    equals(area: VoxelObjectSelectedArea): boolean{
        if(this.#selectedVoxelsOffsets.size !== area.#selectedVoxelsOffsets.size) return false;
        for(let i=0; i<this.#selectedVoxelsOffsets.size; i++){
            if(this.#selectedVoxelsOffsets.get(i)!==area.#selectedVoxelsOffsets.get(i)) return false;
        }
        const maxOffset = this.#gridSize.x * this.#gridSize.y * this.#gridSize.z -1;
        for(let i=0; i<=maxOffset;i++){
            if(this.hasOffset(i)!==area.hasOffset(i)) return false;
        }
        return true
    }

    copy(){
        const out = new VoxelObjectSelectedArea(this.#gridSize)
        out.#selectedVoxelsOffsets = this.#selectedVoxelsOffsets.copy();
        out.#selectedVoxelsBitset = this.#selectedVoxelsBitset.copy()
        out.color = this.color.copy();
        return out;
    }

    clear(): number{
        const out = this.#selectedVoxelsOffsets.size;
        this.#selectedVoxelsOffsets.clear();
        this.#selectedVoxelsBitset.clear();
        return out;
    }
}

/*
export class VoxelObjectSelectedArea{
    voxels: Set<string> = new Set();
    color: Vector4 = new Vector4(255,255,255,128);

    
    //What to do if selected voxel is not empty
    //ignore - selected area in this voxel is rendered alongside the voxel   
    //hide - selected area in this voxel is not rendered
    //replace - selected area is rendererd and the voxel is not
    voxelCollisionBehavior: "ignore" | "hide" | "replace" = "ignore";


    hasVoxel(v: Vector3): boolean{
        return this.voxels.has(v.toString());
    }

    //returns size of voxels set before clear operation
    clearVoxelsSet(): number{
        const out = this.voxels.size;
        this.voxels.clear();
        return out;
    }

    //returns true if voxel didn't exist in set, false otherwise
    addVoxel(voxel: Vector3){
        const vStr = voxel.toString();
        const out = !this.voxels.has(vStr); 
        if(out){
            this.voxels.add(vStr);
        }
        return out;
    }

    //return number of added new voxels 
    addVoxels(newVoxels: Vector3[]): number{
        let out = 0;
        newVoxels.forEach((v)=>{
            out+=this.addVoxel(v)? 1 : 0;
        });
        return out;
    }
}*/