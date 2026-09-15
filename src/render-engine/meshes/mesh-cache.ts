import type { Mesh } from "./Mesh";

export type MeshGPUResources = {
    indexBuffer: GPUBuffer,
    vertexBuffer: GPUBuffer,
}

export class GPUMeshCache{
    cache: Map<Mesh, MeshGPUResources> = new Map();
    get(m: Mesh) : MeshGPUResources | undefined{
        return this.cache.get(m);
    }
    set(m: Mesh, res: MeshGPUResources){
        this.cache.set(m,res);
    }
    delete(m: Mesh){
        const obj = this.cache.get(m);
        if(!obj) return;
        obj.vertexBuffer.destroy();
        obj.indexBuffer.destroy();
        this.cache.delete(m);
    }
}