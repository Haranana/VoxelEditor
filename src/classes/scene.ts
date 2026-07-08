import { Camera } from "./camera";
import { RenderableObject, RenderTechniqueType } from "./renderableObject";
import { SceneObject } from "./sceneObject";
import { VoxelObject } from "./voxelObject";

export type RenderSceneOptions = {
    borderWire: boolean,
    borderGrid: boolean,
    voxelObjectsGrid: boolean,
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

    readonly objects: Map<string, SceneObject> = new Map<string, SceneObject>();
    #selectedSceneObjectId: string | null = null;
    #selectedVoxelObjectId: string | null = null;
    #activeCameraId: string | null = null; 

    getActiveCamera(): Camera | null{
        if(this.#activeCameraId){
            const objectWithActiveCameraId : SceneObject | undefined = this.objects.get(this.#activeCameraId);
            if(objectWithActiveCameraId instanceof Camera){
                return objectWithActiveCameraId;
            }            
        }
        return null;
    }

    getSelectedVoxelObject(): VoxelObject | null {
        if(this.#selectedVoxelObjectId){
            const objectWithSelectedObjectId : SceneObject | undefined = this.objects.get(this.#selectedVoxelObjectId);
            if(objectWithSelectedObjectId instanceof VoxelObject){
                return objectWithSelectedObjectId;
            }            
        }
        return null;
    }

    getSelectedSceneObject(): SceneObject | null{
        if(this.#selectedSceneObjectId){
            const objectWithSelectedObjectId : SceneObject | undefined = this.objects.get(this.#selectedSceneObjectId);
            if(objectWithSelectedObjectId instanceof SceneObject){
                return objectWithSelectedObjectId;
            }            
        }
        return null;
    }

    setActiveCameraId(newId: string) : boolean{
        if(this.objects.get(newId) instanceof Camera){
            this.#activeCameraId = newId;
            return true;
        }
        return false;
    }

    setSelectedVoxelObjectId(newId: string) : boolean{
        if(this.objects.get(newId) instanceof VoxelObject){
            this.#selectedVoxelObjectId = newId;
            return true;
        }
        return false;
    }

    setSelectedSceneObjectId(newId: string) : boolean{
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

    addObject(newObject: SceneObject): boolean{
        if(this.objects.has(newObject.id)) return false;
        this.objects.set(newObject.id , newObject);
        if(newObject instanceof VoxelObject && !this.#selectedVoxelObjectId) this.#selectedVoxelObjectId = newObject.id;
        if(newObject instanceof Camera && !this.#activeCameraId) this.#activeCameraId = newObject.id;
        if(!this.#selectedSceneObjectId) this.#selectedSceneObjectId = newObject.id;
        return true;
    }

    removeObject(id: string): boolean{
        if(!this.objects.has(id)) return false;
        this.objects.delete(id);
        if(this.#activeCameraId == id) this.#activeCameraId = null;
        if(this.#selectedSceneObjectId == id) this.#selectedSceneObjectId = null;
        if(this.#selectedVoxelObjectId == id) this.#selectedVoxelObjectId = null;
        return true;
    }
}