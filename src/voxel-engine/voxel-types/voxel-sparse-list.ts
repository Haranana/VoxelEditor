import type { Voxel } from "./voxel";

//todo: rework later
export class VoxelSparseList<T extends Voxel>{
    #map: Map<string, T|null> = new Map<string, T|null >;

    set(gridPos: string, v: T|null){
        this.#map.set(gridPos, v);
    }

    remove(gridPos: string): boolean{
        return this.#map.delete(gridPos);
    }

    has(gridPos: string){
        return this.#map.get(gridPos)!==undefined
    }

    get(gridPos: string): undefined | T | null{
        return this.#map.get(gridPos)
    }

    getAll(): Map<string, T|null>{
        return this.#map;
    }

    clear(){
        this.#map.clear();
    }
}