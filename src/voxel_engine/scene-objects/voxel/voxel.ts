import type { Vector4 } from "../../../math/vector4.type";

// basic voxel type
// todo possibly convert to class?

export type VoxelArray = (Voxel | null)[][][];

export type Voxel = {
    color: Vector4;
}

export function copyVoxel(v: Voxel): Voxel{
    return {
        color: v.color.copy(),
    };
}