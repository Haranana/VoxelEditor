import { Vector2 } from "../../../math/vector/vector2";
import { Vector3 } from "../../../math/vector/vector3";
import type { Vector4 } from "../../../math/vector/vector4";
import { VoxelGridFormat } from "../../../voxel-engine/voxel-formats/voxel-grid-format";
import { Voxel } from "../../../voxel-engine/voxel-types/voxel";
import type { VoxelArray } from "./voxel";

// collection of functions returning VoxelGridFormat of common shapes

export function getEmptyVoxelArray(size: Vector3) : VoxelArray{
    const out = Array.from({ length: size.x }, () =>
        Array.from({ length: size.y }, () =>
            Array.from({ length: size.z }, () => null)
        )
    );
    return out;
}

export function generatePyramidVoxelArray(size: Vector3, color: Vector4): VoxelGridFormat{
    const voxelFormat = new VoxelGridFormat();
    let baseShortage = 0;
    for(let y: number = size.y-1; y>=0; y--){
        for(let x: number = baseShortage; x < size.x - baseShortage; x++){
            for(let z: number = baseShortage ; z < size.z - baseShortage; z++){
                voxelFormat.setVoxel(new Vector3(x,y,z),new Voxel(color));
            }
        }
        baseShortage++;
    }
    return voxelFormat;
}

export function generateCylinderVoxelArray(size: Vector3, color: Vector4): VoxelGridFormat{
    const voxelFormat = new VoxelGridFormat();
    const minWidth = Math.min(size.x, size.z);
    const radius = Math.ceil(minWidth/2);
    const circleMiddle = new Vector2( Math.floor(size.x/2) , Math.floor(size.z/2));
    for(let y: number = 0; y<size.y; y++){
        for(let x: number = 0; x < size.x ; x++){
            for(let z: number = 0 ; z < size.z ; z++){
                const distanceToCircleMiddle = Math.sqrt(Math.pow(x-circleMiddle.x , 2) + Math.pow(z-circleMiddle.y , 2));
                if(distanceToCircleMiddle <= radius){
                    voxelFormat.setVoxel(new Vector3(x,y,z),new Voxel(color));
                }
            }
        }
    }
    return voxelFormat;
}

export function generateSphereVoxelArray(size: Vector3, color: Vector4): VoxelGridFormat{
    const voxelFormat = new VoxelGridFormat();
    const minWidth = Math.min(size.x, size.y, size.z);
    const radius = Math.ceil(minWidth/2);
    const circleMiddle = new Vector3( Math.floor(size.x/2) , Math.floor(size.y/2), Math.floor(size.z/2));
    for(let y: number = 0; y<size.y; y++){
        for(let x: number = 0; x < size.x ; x++){
            for(let z: number = 0 ; z < size.z ; z++){
                const distanceToCircleMiddle = Math.sqrt(Math.pow(x-circleMiddle.x , 2) + Math.pow(y-circleMiddle.y , 2) + Math.pow(z-circleMiddle.z , 2));
                if(distanceToCircleMiddle <= radius){
                    voxelFormat.setVoxel(new Vector3(x,y,z),new Voxel(color));
                }
            }
        }
    }
    return voxelFormat;
}