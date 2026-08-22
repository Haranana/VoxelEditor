import type { Vector3 } from "../../../math/vector3.type";
import type { Vector4 } from "../../../math/vector4.type";

// basic voxel type
// todo possibly convert to class?

export type VoxelArray = (Voxel | null)[][][];

export function getEmptyVoxelArray(size: Vector3){
    Array.from({ length: size.x }, () =>
            Array.from({ length: size.y }, () =>
                Array.from({ length: size.z }, () => null)
            )
        );
}

export function copyVoxelArray(voxelArray: VoxelArray){
    return Array.from({ length: voxelArray.length }, () =>
            Array.from({ length: voxelArray[0].length }, () =>
                Array.from({ length: voxelArray[0][0].length }, (v: Voxel | null) => v? copyVoxel(v) : null)
            )
        );
}

export type Voxel = {
    color: Vector4;
}

export function copyVoxel(v: Voxel): Voxel{
    return {
        color: v.color.copy(),
    };
}