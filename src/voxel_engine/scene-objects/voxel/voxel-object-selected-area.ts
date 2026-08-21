import type { Vector3 } from "../../../math/vector3.type";
import { Vector4 } from "../../../math/vector4.type";

export class VoxelObjectSelectedArea{
    voxels: Set<string> = new Set();
    color: Vector4 = new Vector4(255,255,255,128);

    /*
        What to do if selected voxel is not empty
        ignore - selected area in this voxel is rendered alongside the voxel   
        hide - selected area in this voxel is not rendered
        replace - selected area is rendererd and the voxel is not

    */
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
}