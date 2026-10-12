import { gridOffsetToPos, gridPosToOffset } from "../../math/utils";
import type { Vector3 } from "../../math/vector/vector3";
import type { RenderableObject } from "../../render-engine/renderableObjects/renderableObject";
import type { VoxelObject } from "./voxel-object";

export class VoxelObjectRenderable{
    #renderableObject: RenderableObject;
    #dirtyFlag: boolean = false;    
    #updateRenderableObject: (v: VoxelObject, ro: RenderableObject) => void;
    #createRenderableObject: (v: VoxelObject) => RenderableObject;
    
    constructor(voxelObject: VoxelObject,
        createRenderableObject: (v: VoxelObject)=>RenderableObject,
        updateRenderableObject: (v: VoxelObject, ro: RenderableObject) => void){
        
        this.#createRenderableObject = createRenderableObject;
        this.#updateRenderableObject = updateRenderableObject;
        this.#renderableObject = this.#createRenderableObject(voxelObject);
    }

    getRenderableObject(voxelObject: VoxelObject): RenderableObject{
        if(this.#shouldUpdateRenderableObject()){
            this.#updateRenderableObject(voxelObject, this.#renderableObject);
            this.#dirtyFlag = false;
        }
        return this.#renderableObject;
    }
    setRenderableObjectDirty(){
        this.#dirtyFlag = true;
    }
    setMeshToRebuild(){
        this.#renderableObject.mesh = null;
        this.setRenderableObjectDirty();
        return true;
    }  

    #shouldUpdateRenderableObject(): boolean{
        return this.#dirtyFlag;
    }
}

export class VoxelObjectChunkRenderables{
    #renderableObjects: RenderableObject[];
    #dirtyFlags: boolean[];    
    #updateRenderableObject: (v: VoxelObject, gridPos: Vector3, ro: RenderableObject) => void;
    #createRenderableObject: (v: VoxelObject, gridPos: Vector3) => RenderableObject;
    
    constructor(voxelObject: VoxelObject,
        createRenderableObject: (v: VoxelObject, gridPos: Vector3)=>RenderableObject,
        updateRenderableObject: (v: VoxelObject, gridPos: Vector3, ro: RenderableObject) => void){
        
        this.#createRenderableObject = createRenderableObject;
        this.#updateRenderableObject = updateRenderableObject;
        this.#renderableObjects = [];
        this.#dirtyFlags = []
        const chunksAmountVector = voxelObject.getChunksAmount();
        const renderablesAmount = chunksAmountVector.x * chunksAmountVector.y * chunksAmountVector.z;
        for(let i=0; i<renderablesAmount; i++){
            const chunkPost = gridOffsetToPos(i, voxelObject.getChunksAmount())
            this.#renderableObjects.push(this.#createRenderableObject(voxelObject, chunkPost));
            this.#dirtyFlags.push(false);
        }
    }

    getRenderableObjects(voxelObject: VoxelObject): RenderableObject[]{
        const out: RenderableObject[] = [];
        
        for(let i=0; i<this.#renderableObjects.length; i++){
            if(this.#shouldUpdateRenderableObject(i)){
                const chunkPos = gridOffsetToPos(i , voxelObject.getChunksAmount()); 
                this.#updateRenderableObject(voxelObject, chunkPos, this.#renderableObjects[i]);
            }
            out.push(this.#renderableObjects[i]);
        }        
        return out;
    }

    getRenderableObject(voxelObject: VoxelObject, i: number): RenderableObject|undefined{
        if(!this.inRange(i)) return undefined
        if(this.#shouldUpdateRenderableObject(i)){
            const chunkPost = gridOffsetToPos(i, voxelObject.getChunksAmount())
            this.#updateRenderableObject(voxelObject, chunkPost, this.#renderableObjects[i]);
        }
        return this.#renderableObjects[i];
    }
    setRenderableObjectDirty(i: number): boolean{
        if(!this.inRange(i)) return false;
        this.#dirtyFlags[i] = true;
        return true;
    }

    setMeshToRebuild(i: number): boolean{
        if(!this.inRange(i)) return false;
        this.#renderableObjects[i]!.mesh = null;
        this.setRenderableObjectDirty(i);
        return true;
    }

    #shouldUpdateRenderableObject(i: number): boolean{
        return this.#dirtyFlags[i];
    }

    inRange(i: number): boolean{
        return (i>0 && i<this.#renderableObjects.length);
    }
}