import { Vector4 } from "../../math/vector/vector4";
import { SparseVoxel } from "./sparse-voxel";
import { Voxel } from "./voxel";

export interface VoxelCodec<T extends Voxel>{
    byteStride: number; //number of bytes per single voxel

    encode(voxel: T, array: Float32Array, voxelOffset: number): void;
    encodeEmpty(array: Float32Array, voxelOffset: number): void;
    decode(array: Float32Array, voxelOffset: number): T|undefined;
}

// Voxels are encoded as simple array of Colors
// eg. {v0.R,v0.G,v0.B,v0.A},{v1.R...
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

// Voxels are encoded as pair of <Id in array, color>
// Id is saved as 32 bit uInt number
// eg. {v0.id},{v0.R,v0.G,v0.B,v0.A},{v1.id}...
export const sparseVoxelCodec: VoxelCodec<SparseVoxel> = {
    byteStride: 8,
    
    encode(voxel: Voxel, array: Float32Array, voxelOffset: number){
        const colorArray = new Uint8Array(
            array.buffer,
            array.byteOffset,
            array.byteLength
        );
        const idArray = new Uint32Array(
            array.buffer,
            array.byteOffset,
            array.byteLength
        );
        const idArrayStride = this.byteStride/4
        idArray.set([voxelOffset], voxelOffset*idArrayStride)
        colorArray.set([voxel.color.x, voxel.color.y, voxel.color.z, voxel.color.w], voxelOffset*this.byteStride+4);
    },

    encodeEmpty(array: Float32Array, voxelOffset: number){
        const colorArray = new Uint8Array(
            array.buffer,
            array.byteOffset,
            array.byteLength
        );
        const idArray = new Uint32Array(
            array.buffer,
            array.byteOffset,
            array.byteLength
        );
        const idArrayStride = this.byteStride/4
        idArray.set([voxelOffset], voxelOffset*idArrayStride)
        colorArray.set([0,0,0,0], voxelOffset*this.byteStride+4);
    },

    decode(array: Float32Array, offset: number): SparseVoxel|undefined{
        const colorArray = new Uint8Array(
            array.buffer,
            array.byteOffset,
            array.byteLength
        );
        const idArray = new Uint32Array(
            array.buffer,
            array.byteOffset,
            array.byteLength
        );
        const idArrayStride = this.byteStride/4
        const x = colorArray[offset*this.byteStride];
        const y = colorArray[offset*this.byteStride+1];
        const z = colorArray[offset*this.byteStride+2];
        const a = colorArray[offset*this.byteStride+3];
        const voxelOffset = idArray[offset*idArrayStride] 
        const color = new Vector4(x,y,z,a);

        const out = new SparseVoxel(color, voxelOffset);
        return out;
    },
} as const;