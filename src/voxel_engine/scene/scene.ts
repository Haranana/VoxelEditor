import { Camera } from "../scene-objects/camera/camera";
import { SceneObject } from "../scene-objects/sceneObject";
import { VoxelObject } from "../scene-objects/voxel/voxel-object";

export type SelectedVoxelObjectRenderOptions = {
    borderGrid: boolean,
    borderOutline: boolean,    
    voxelObject: boolean,
    voxelObjectWireframe: boolean,
}

export type SceneGizmosRenderOptions = {
    cameraControllGizmo: boolean,
    objectMoveGizmo: boolean,
    objectResizeGizmo: boolean,
    objectRotateGizmo: boolean,
};

export class Scene{

    readonly objects: Map<number, SceneObject> = new Map<number, SceneObject>();      
    seletedVoxelObjectRenderOptions: SelectedVoxelObjectRenderOptions = {
        borderGrid: true,
        borderOutline: true,    
        voxelObject: true,
        voxelObjectWireframe: true,
    }

    sceneGizmosRenderOptions: SceneGizmosRenderOptions = {
        cameraControllGizmo: false,
        objectMoveGizmo: false,
        objectResizeGizmo: false,
        objectRotateGizmo: false,
    }
    
    #selectedSceneObjectId: number | null = null;
    #selectedVoxelObjectId: number | null = null;
    #activeCameraId: number | null = null; 
    #nextSceneObjectId: number = 0;

    toggleSelectedObjectBorderGrid(){
        this.seletedVoxelObjectRenderOptions.borderGrid = !this.seletedVoxelObjectRenderOptions.borderGrid;
    }

    toggleSelectedObjectBorderOutline(){
        this.seletedVoxelObjectRenderOptions.borderOutline = !this.seletedVoxelObjectRenderOptions.borderOutline;
    }

    toggleSelectedObjectVisibility(){
        this.seletedVoxelObjectRenderOptions.voxelObject = !this.seletedVoxelObjectRenderOptions.voxelObject;
    }

    toggleSelectedObjectWireframe(){
        this.seletedVoxelObjectRenderOptions.voxelObjectWireframe = !this.seletedVoxelObjectRenderOptions.voxelObjectWireframe;
    }

    toggleCameraControllGizmo(){
        this.sceneGizmosRenderOptions.cameraControllGizmo = !this.sceneGizmosRenderOptions.cameraControllGizmo;
    }

    toggleObjectMoveGizmo(){
        this.sceneGizmosRenderOptions.objectMoveGizmo = !this.sceneGizmosRenderOptions.objectMoveGizmo;
    }

    toggleObjectResizeGizmo(){
        this.sceneGizmosRenderOptions.objectResizeGizmo = !this.sceneGizmosRenderOptions.objectResizeGizmo;
    }

    toggleObjectRotateGizmo(){
        this.sceneGizmosRenderOptions.objectRotateGizmo = !this.sceneGizmosRenderOptions.objectRotateGizmo;
    }

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