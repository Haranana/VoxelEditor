import { Vector4 } from "../../math/vector/vector4";
import { Voxel } from "./voxel";

export interface VoxelCodec<T extends Voxel>{
    byteStride: number; //number of bytes per single voxel

    encode(voxel: T, array: Float32Array, voxelOffset: number): void;
    encodeEmpty(array: Float32Array, voxelOffset: number): void;
    decode(array: Float32Array, voxelOffset: number): T|undefined;
}

export const baseVoxelCodec: VoxelCodec<Voxel> = {
    byteStride: 4,
    
    encode(voxel: Voxel, array: Float32Array, voxelOffset: number){
        const colorArray = new Uint8Array(
            array.buffer,
            array.byteOffset,
            array.byteLength
        );
        colorArray.set([voxel.color.x, voxel.color.y, voxel.color.z, voxel.color.w], voxelOffset*this.byteStride);
    },

    encodeEmpty(array: Float32Array, voxelOffset: number){
        const colorArray = new Uint8Array(
            array.buffer,
            array.byteOffset,
            array.byteLength
        );
        colorArray.set([0,0,0,0], voxelOffset*this.byteStride);
    },

    decode(array: Float32Array, offset: number): Voxel|undefined{
        const colorArray = new Uint8Array(
            array.buffer,
            array.byteOffset,
            array.byteLength
        );
        const x = colorArray[offset*this.byteStride];
        const y = colorArray[offset*this.byteStride+1];
        const z = colorArray[offset*this.byteStride+2];
        const a = colorArray[offset*this.byteStride+3];
        const color = new Vector4(x,y,z,a);

        const out = new Voxel(color);
        return out;
    },
} as const;