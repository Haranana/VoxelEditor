import { VoxelObject, type VoxelArray } from "./classes/sceneObjects/voxelObject";
import { Vector2 } from "./math/vector2.type";
import { Vector3 } from "./math/vector3.type";
import type { Vector4 } from "./math/vector4.type";

export function generateVoxelArrayPyramid(size: Vector3, color: Vector4): VoxelArray{
    const outVoxels = VoxelObject.getFreshVoxelArray(size);
    let baseShortage = 0;
    for(let y: number = size.y-1; y>=0; y--){
        for(let x: number = baseShortage; x < size.x - baseShortage; x++){
            for(let z: number = baseShortage ; z < size.z - baseShortage; z++){
                outVoxels[x][y][z] = {color};
            }
        }
        baseShortage++;
    }
    return outVoxels;
}

export function generateVoxelArrayCylinder(size: Vector3, color: Vector4): VoxelArray{
    const outVoxels = VoxelObject.getFreshVoxelArray(size);
    const minWidth = Math.min(size.x, size.z);
    const radius = Math.ceil(minWidth/2);
    const circleMiddle = new Vector2( Math.floor(size.x/2) , Math.floor(size.z/2));
    for(let y: number = 0; y<size.y; y++){
        for(let x: number = 0; x < size.x ; x++){
            for(let z: number = 0 ; z < size.z ; z++){
                const distanceToCircleMiddle = Math.sqrt(Math.pow(x-circleMiddle.x , 2) + Math.pow(z-circleMiddle.y , 2));
                if(distanceToCircleMiddle <= radius){
                    outVoxels[x][y][z] = {color}
                }
            }
        }
    }
    return outVoxels;
}

export function generateVoxelArraySphere(size: Vector3, color: Vector4): VoxelArray{
    const outVoxels = VoxelObject.getFreshVoxelArray(size);    
    const minWidth = Math.min(size.x, size.y, size.z);
    const radius = Math.ceil(minWidth/2);
    const circleMiddle = new Vector3( Math.floor(size.x/2) , Math.floor(size.y/2), Math.floor(size.z/2));
    for(let y: number = 0; y<size.y; y++){
        for(let x: number = 0; x < size.x ; x++){
            for(let z: number = 0 ; z < size.z ; z++){
                const distanceToCircleMiddle = Math.sqrt(Math.pow(x-circleMiddle.x , 2) + Math.pow(y-circleMiddle.y , 2) + Math.pow(z-circleMiddle.z , 2));
                if(distanceToCircleMiddle <= radius){
                    outVoxels[x][y][z] = {color}
                }
            }
        }
    }
    return outVoxels;
}