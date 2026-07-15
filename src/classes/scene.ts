import { Camera } from "./camera";
import { RenderableObject, RenderTechniqueType } from "./renderableObject";
import { SceneObject } from "./sceneObject";
import { VoxelObject } from "./voxelObject";

export type RenderSceneOptions = {
    borderGrid: boolean,
    borderOutline: boolean,    
    voxelObject: boolean,
    voxelObjectWireframe: boolean,
}

export type RenderGizmosOptions = {
    cameraControllGizmo: boolean,
    objectMoveGizmo: boolean,
    objectResizeGizmo: boolean,
    objectRotateGizmo: boolean,
};

export class Gizmos{

    static #cameraControllGizmo: RenderableObject | null = null;
    static #objectMoveGizmo: RenderableObject | null = null;
    static #objectResizeGizmo: RenderableObject | null = null;
    static #objectRotateGizmo: RenderableObject | null = null;


    //objects themselved to be created later
    static #createCameraControllGizmo(): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        out.material = {
            renderTechnique: RenderTechniqueType.GIZMO
        }

        return out;
    }

    static #createObjectMoveGizmo(): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        out.material = {
            renderTechnique: RenderTechniqueType.GIZMO
        }
    
        return out;
    }

    static #createObjectResizeGizmo(): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        out.material = {
            renderTechnique: RenderTechniqueType.GIZMO
        }
    
        return out;
    }

    static #createObjectRotateGizmo(): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        out.material = {
            renderTechnique: RenderTechniqueType.GIZMO
        }
    
        return out;
    }

    static getCameraControllGizmo(): RenderableObject{
        if(!this.#cameraControllGizmo){
            this.#cameraControllGizmo = this.#createCameraControllGizmo()
        }
        return this.#cameraControllGizmo;
    }

    static getObjectMoveGizmo(): RenderableObject{
        if(!this.#objectMoveGizmo){
            this.#objectMoveGizmo = this.#createObjectMoveGizmo()    
        }
        return this.#objectMoveGizmo;
    }

    static getObjectResizeGizmo(): RenderableObject{
        if(!this.#objectResizeGizmo){
            this.#objectResizeGizmo = this.#createObjectResizeGizmo()
        }
        return this.#objectResizeGizmo;
    }

    static getObjectRotateGizmo(): RenderableObject{
        if(!this.#objectRotateGizmo){
            this.#objectRotateGizmo = this.#createObjectRotateGizmo()
        }
        return this.#objectRotateGizmo;
    }
}

export class Scene{

    readonly objects: Map<number, SceneObject> = new Map<number, SceneObject>();
    #selectedSceneObjectId: number | null = null;
    #selectedVoxelObjectId: number | null = null;
    #activeCameraId: number | null = null; 
    #nextSceneObjectId: number = 0;

    getActiveCamera(): Camera | null{
        if(this.#activeCameraId != null){
            const objectWithActiveCameraId : SceneObject | undefined = this.objects.get(this.#activeCameraId);
            if(objectWithActiveCameraId instanceof Camera){
                return objectWithActiveCameraId;
            }            
        }
        return null;
    }

    getSelectedVoxelObject(): VoxelObject | null {
        if(this.#selectedVoxelObjectId != null){
            const objectWithSelectedObjectId : SceneObject | undefined = this.objects.get(this.#selectedVoxelObjectId);
            if(objectWithSelectedObjectId instanceof VoxelObject){
                return objectWithSelectedObjectId;
            }            
        }
        return null;
    }

    getSelectedSceneObject(): SceneObject | null{
        if(this.#selectedSceneObjectId != null){
            const objectWithSelectedObjectId : SceneObject | undefined = this.objects.get(this.#selectedSceneObjectId);
            if(objectWithSelectedObjectId instanceof SceneObject){
                return objectWithSelectedObjectId;
            }            
        }
        return null;
    }

    setActiveCameraId(newId: number) : boolean{
        if(this.objects.get(newId) instanceof Camera){
            this.#activeCameraId = newId;
            return true;
        }
        return false;
    }

    setSelectedVoxelObjectId(newId: number) : boolean{
        if(this.objects.get(newId) instanceof VoxelObject){
            this.#selectedVoxelObjectId = newId;
            return true;
        }
        return false;
    }

    setSelectedSceneObjectId(newId: number) : boolean{
        if(this.objects.has(newId)){
            this.#selectedSceneObjectId = newId;
            return true;
        }
        return false;
    }

    getObjectsOfType<T extends SceneObject>(objType: new (...args: any[]) => T): T[]{
        const out: T[] = [];
        this.objects.forEach((obj)=>{
            if(obj instanceof objType) out.push(obj);
        });
        return out;
    }

    //adds object to the scene and appoints scene id to it
    //object cannot be added if it already has scene id
    addObject(newObject: SceneObject): boolean{
        if(newObject.sceneId != null) return false;
        this.objects.set(this.#nextSceneObjectId , newObject);
        newObject.sceneId = this.#nextSceneObjectId;
        this.#nextSceneObjectId++;

        if(newObject instanceof VoxelObject && this.#selectedVoxelObjectId == null ) this.#selectedVoxelObjectId = newObject.sceneId;
        if(newObject instanceof Camera && this.#activeCameraId == null) this.#activeCameraId = newObject.sceneId;
        if(this.#selectedSceneObjectId == null) this.#selectedSceneObjectId = newObject.sceneId;
        return true;
    }

    removeObject(id: number): boolean{
        const obj = this.objects.get(id);
        if(!obj) return false;
        obj.sceneId = null;
        this.objects.delete(id);
        
        if(this.#activeCameraId == id) this.#activeCameraId = null;
        if(this.#selectedSceneObjectId == id) this.#selectedSceneObjectId = null;
        if(this.#selectedVoxelObjectId == id) this.#selectedVoxelObjectId = null;
        return true;
    }
}