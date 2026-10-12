import { Vector3 } from "../../../math/vector/vector3";
import { Vector4 } from "../../../math/vector/vector4";
import { UInt32List } from "../../classes/UInt32List";

// resize not supported for now;
export class VoxelObjectSelectedArea{

    static readonly #defaultColor: Vector4 = new Vector4(255,255,255,192); 
    
    //Uint32 should be enough for grid of size about 1600^3, for anything more
    //this will have to be changed (maybe for bigint array?)
    #selectedVoxelsOffsets: UInt32List = new UInt32List();
    #gridSize: Vector3;
    color: Vector4 = VoxelObjectSelectedArea.#defaultColor;

    //returns false if voxel of this position is already in selected area
    //true otherwise
    //does not check whether given position fits inside the grid
    addGridPosition(v: Vector3): boolean{        
        if(this.hasGridPosition(v)){
            return false;
        }
        const offset = v.x * this.#gridSize.y * this.#gridSize.z + v.y * this.#gridSize.z + v.z;
        this.#selectedVoxelsOffsets.add(offset);
        return true;
    }
    addOffset(offset: number): boolean{        
        if(this.hasOffset(offset)){
            return false;
        }
        this.#selectedVoxelsOffsets.add(offset);
        return true;
    }    

    //returns true if voxel position was found and removed
    //false if voxel position couldn't be found 
    removeGridPosition(v: Vector3): boolean{
        const offset = v.x * this.#gridSize.y * this.#gridSize.z + v.y * this.#gridSize.z + v.z;
        const removed = this.#selectedVoxelsOffsets.remove(offset);
        return removed;
    }
    removeOffset(offset: number): boolean{
        const removed = this.#selectedVoxelsOffsets.remove(offset);
        return removed;
    }

    hasGridPosition(v: Vector3): boolean{
        const offset = v.x * this.#gridSize.y * this.#gridSize.z + v.y * this.#gridSize.z + v.z;
        const out = this.#selectedVoxelsOffsets.array().find((curOffset)=>curOffset===offset)!==undefined;
        return out;
    }

    hasOffset(offset: number): boolean{
        const out = this.#selectedVoxelsOffsets.array().find((curOffset)=>curOffset===offset)!==undefined;
        return out;
    }

    //  returns list id of given voxel position (either by its gridPosition or gridOffset)
    //  or undefined if none is found
    findGridPosition(v: Vector3): number|undefined{
        const offset = v.x * this.#gridSize.y * this.#gridSize.z + v.y * this.#gridSize.z + v.z;
        const out = this.#selectedVoxelsOffsets.array().find((curOffset)=>curOffset===offset)
        return out;
    }

    findOffset(offset: number): number|undefined{
        const out = this.#selectedVoxelsOffsets.array().find((curOffset)=>curOffset===offset)
        return out;
    }

    constructor(gridSize: Vector3){
        this.#gridSize = gridSize.copy();
    }

    getGridPositionStrings(): string[]{
        const out: string[] = []; 
        this.#selectedVoxelsOffsets.array().forEach((vOffset)=>{
            out.push(this.#GridOffsetToGridPosition(vOffset).toString());
        })
        return out;
    }

    getGridPositions(): Vector3[]{
        const out:Vector3[] = [];
        this.#selectedVoxelsOffsets.array().forEach((vOffset)=>{
            out.push(this.#GridOffsetToGridPosition(vOffset));
        });
        return out;
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
        return true
    }

    copy(){
        const out = new VoxelObjectSelectedArea(this.#gridSize)
        out.#selectedVoxelsOffsets = this.#selectedVoxelsOffsets.copy();
        out.color = this.color.copy();
        return out;
    }

    clear(){
        this.#selectedVoxelsOffsets.clear();
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