import type { Vector3 } from "../../math/vector/vector3";
import { RenderableObject } from "../../render-engine/renderableObjects/renderableObject";
import { shadedWorldObjectShader, worldObjectGridShader, worldObjectShader } from "../../render-engine/shaders/base-shaders";
import { Shader } from "../../render-engine/shaders/shader";
import { CameraShaderResources, LightSourcesResources, ViewportShaderResources, WorldObjectShaderResources } from "../../render-engine/shaders/shader-resource";
import type { VoxelObject } from "./voxel-object";
import { VoxelObjectChunkRenderables, VoxelObjectRenderable } from "./voxel-object-renderable";
import { generateVoBorderGridMesh, generateVoBorderOutlineMesh, generateVoSelectedAreaMesh } from "./voxel/voxel-mesh-generator";

// Class for managing renderableObjects related to voxel scene object  
export class VoxelObjectRenderablesManager{    
    constructor(voxelObject: VoxelObject){
        this.#chunksRenderableObjects = new VoxelObjectChunkRenderables(
            voxelObject,
            this.#createChunkRo,
            this.#updateChunkRo
        );
        this.#objectGridRenderableObject = new VoxelObjectRenderable(
            voxelObject,
            this.#createVoGridRo,
            this.#updateVoGridRo
        );
        this.#borderOutlineRenderableObject = new VoxelObjectRenderable(
            voxelObject,
            this.#createVoBorderGridRo,
            this.#updateVoBorderGridRo
        );
        this.#borderGridRenderableObject = new VoxelObjectRenderable(
            voxelObject,
            this.#createVoBorderGridRo,
            this.#updateVoBorderGridRo
        );
        this.#selectedAreaRenderableObject = new VoxelObjectRenderable(
            voxelObject,
            this.#createVoSelectedAreaRo,
            this.#updateVoSelectedAreaRo,
        );
    }

    #chunksRenderableObjects: VoxelObjectChunkRenderables;
    #objectGridRenderableObject: VoxelObjectRenderable;
    #borderOutlineRenderableObject: VoxelObjectRenderable;
    #borderGridRenderableObject: VoxelObjectRenderable;
    #selectedAreaRenderableObject: VoxelObjectRenderable;

    //object chunks
    getChunksRenderableObjects(vo: VoxelObject): RenderableObject[]{        
        return this.#chunksRenderableObjects.getRenderableObjects(vo);
    }

    setChunksRenderableObjectDirty(chunkOffset: number){
        this.#chunksRenderableObjects.setRenderableObjectDirty(chunkOffset);
    }

    clearChunkMesh(chunkOffset: number){
        this.#chunksRenderableObjects.setMeshToRebuild(chunkOffset);
    }

    #createChunkRo(vo: VoxelObject, chunkPos: Vector3): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        const shader = new Shader(shadedWorldObjectShader(), "vertexShader", "fragmentShader", 
        [new ViewportShaderResources(0) ,new CameraShaderResources(1),new WorldObjectShaderResources(2), new LightSourcesResources(3)]);
        out.mesh = generateChunkMesh(vo, chunkPos);
        out.material = {
            shader
        };
        out.collider = null; 
        out.worldTransform = vo.transform;
        out.screenTransform = null;
        out.name = vo.name ;
        return out;
    }

    #updateChunkRo(vo: VoxelObject, chunkPos: Vector3, ro: RenderableObject): void{
        ro.worldTransform = {...vo.transform};
        
        if(!ro.material || !ro.material.shader){            
            const shader = new Shader(worldObjectShader(), "vertexShader", "fragmentShader", 
            [new ViewportShaderResources(0) ,new CameraShaderResources(1),new WorldObjectShaderResources(2), new LightSourcesResources(3)]);
            ro.material = {shader};
        }

        if(!ro.mesh){
            ro.mesh = generateChunkMesh(vo, chunkPos);
        }
        ro.name = vo.name;
        ro.collider = null; 
        ro.screenTransform = null;
    }

    //object grid
    getObjectGridRenderableObject(vo: VoxelObject): RenderableObject{        
        return this.#objectGridRenderableObject.getRenderableObject(vo);
    }

    setObjectGridRenderableObjectDirty(){
        this.#objectGridRenderableObject.setRenderableObjectDirty();
    }

    clearObjectGridMesh(){
        this.#objectGridRenderableObject.setMeshToRebuild();
    }    

    #createVoGridRo(vo: VoxelObject): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        const shader = new Shader(worldObjectGridShader(), "vertexShader", "fragmentShader", 
        [new ViewportShaderResources(0) ,new CameraShaderResources(1),new WorldObjectShaderResources(2)]);
        out.mesh = generateVoGridMesh(vo);
        out.material = {
            shader
        };
        out.collider = null; 
        out.worldTransform = vo.transform;
        out.screenTransform = null;
        out.name = "grid" + "(" + vo.name + ")" ;
        return out;
    }

    #updateVoGridRo(vo: VoxelObject, ro: RenderableObject): void{
        ro.worldTransform = {...vo.transform};
        
        if(!ro.material || !ro.material.shader){            
            const shader = new Shader(worldObjectGridShader(), "vertexShader", "fragmentShader", 
            [new ViewportShaderResources(0) ,new CameraShaderResources(1),new WorldObjectShaderResources(2)]);
            ro.material = {shader};
        }

        if(!ro.mesh){
            ro.mesh = generateVoGridMesh(vo);
        }
        ro.name = "grid" + "(" + vo.name + ")" ;
        ro.collider = null; 
        ro.screenTransform = null;
    }    

    //border outline
    getBorderOutlineRenderableObject(vo: VoxelObject): RenderableObject{        
        return this.#borderOutlineRenderableObject.getRenderableObject(vo);
    }

    setBorderOutlineRenderableObjectDirty(){
        this.#borderOutlineRenderableObject.setRenderableObjectDirty();
    }

    clearBorderOutlineMesh(){
        this.#borderOutlineRenderableObject.setMeshToRebuild();
    }   
    
    #createVoBorderOutlineRo(vo: VoxelObject): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        const shader = new Shader(worldObjectGridShader(), "vertexShader", "fragmentShader", 
        [new ViewportShaderResources(0) ,new CameraShaderResources(1),new WorldObjectShaderResources(2)]);
        out.mesh = generateVoBorderOutlineMesh(vo);
        out.material = {
            shader
        };
        out.collider = null; 
        out.worldTransform = vo.transform;
        out.screenTransform = null;
        out.name = "borderOutline" + "(" + vo.name + ")" ;
        return out;
    }

    #updateVoBorderOutlineRo(vo: VoxelObject, ro: RenderableObject): void{
        ro.worldTransform = {...vo.transform};
        
        if(!ro.material || !ro.material.shader){            
            const shader = new Shader(worldObjectGridShader(), "vertexShader", "fragmentShader", 
            [new ViewportShaderResources(0) ,new CameraShaderResources(1),new WorldObjectShaderResources(2)]);
            ro.material = {shader};
        }

        if(!ro.mesh){
            ro.mesh = generateVoBorderOutlineMesh(vo);
        }
        ro.name = "borderOutline" + "(" + vo.name + ")" ;
        ro.collider = null; 
        ro.screenTransform = null;
    }    

    //border grid
    getBorderGridRenderableObject(vo: VoxelObject): RenderableObject{        
        return this.#borderGridRenderableObject.getRenderableObject(vo);
    }

    setBorderGridRenderableObjectDirty(){
        this.#borderGridRenderableObject.setRenderableObjectDirty();
    }

    clearBorderGridMesh(){
        this.#borderGridRenderableObject.setMeshToRebuild();
    }    
    
    #createVoBorderGridRo(vo: VoxelObject): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        const shader = new Shader(worldObjectGridShader(), "vertexShader", "fragmentShader", 
        [new ViewportShaderResources(0) ,new CameraShaderResources(1),new WorldObjectShaderResources(2)]);
        out.mesh = generateVoBorderGridMesh(vo);
        out.material = {
            shader
        };
        out.collider = null; 
        out.worldTransform = vo.transform;
        out.screenTransform = null;
        out.name = "borderGrid" + "(" + vo.name + ")" ;
        return out;
    }

    #updateVoBorderGridRo(vo: VoxelObject, ro: RenderableObject): void{
        ro.worldTransform = {...vo.transform};
        
        if(!ro.material || !ro.material.shader){            
            const shader = new Shader(worldObjectGridShader(), "vertexShader", "fragmentShader", 
            [new ViewportShaderResources(0) ,new CameraShaderResources(1),new WorldObjectShaderResources(2)]);
            ro.material = {shader};
        }

        if(!ro.mesh){
            ro.mesh = generateVoBorderGridMesh(vo);
        }
        ro.name = "borderGrid" + "(" + vo.name + ")" ;
        ro.collider = null; 
        ro.screenTransform = null;
    }

    //selected area
    getSelectedAreaRenderableObject(vo: VoxelObject): RenderableObject{        
        return this.#selectedAreaRenderableObject.getRenderableObject(vo);
    }

    setSelectedAreaRenderableObjectDirty(){
        this.#selectedAreaRenderableObject.setRenderableObjectDirty();
    }

    clearSelectedAreaMesh(){
        this.#selectedAreaRenderableObject.setMeshToRebuild();
    }    

    #createVoSelectedAreaRo(vo: VoxelObject): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        const shader = new Shader(worldObjectShader(), "vertexShader", "fragmentShader", 
        [new ViewportShaderResources(0) ,new CameraShaderResources(1),new WorldObjectShaderResources(2)]);        
        out.mesh = generateVoSelectedAreaMesh(vo);
        out.material = {
            shader
        };
        out.collider = null; 
        out.worldTransform = vo.transform;
        out.screenTransform = null;
        out.name = "selectedArea" + "(" + vo.name + ")" ;

        return out;
    }

    #updateVoSelectedAreaRo(vo: VoxelObject, ro: RenderableObject): void{
        ro.worldTransform = {...vo.transform};
        
        if(!ro.material || !ro.material.shader){            
            const shader = new Shader(worldObjectShader(), "vertexShader", "fragmentShader", 
            [new ViewportShaderResources(0) ,new CameraShaderResources(1),new WorldObjectShaderResources(2)]);
            ro.material = {shader};
        }

        if(!ro.mesh){
            ro.mesh = generateVoSelectedAreaMesh(vo);
        }
        ro.name = "selectedArea" + "(" + vo.name + ")" ;
        ro.collider = null; 
        ro.screenTransform = null;
    }    
}



