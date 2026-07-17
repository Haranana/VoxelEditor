import { Vector3 } from "../math/vector3.type";
import { Vector4 } from "../math/vector4.type";
import { Camera } from "./camera";
import { MeshBuilder } from "./MeshBuilder";
import { RenderableObject, RenderTechniqueType } from "./renderableObjects/renderableObject";
import { SceneObject } from "./sceneObjects/sceneObject";
import { VoxelObject } from "./sceneObjects/voxelObject";

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
    const out = new RenderableObject();

        out.material = {
            renderTechnique: RenderTechniqueType.GIZMO
        };

        const mesh = new MeshBuilder({
            topology: "triangle-list",
            attributes: ["color"]
        });

        const RED   = new Vector4(255, 32, 32, 255);
        const GREEN = new Vector4(32, 255, 32, 255);
        const BLUE  = new Vector4(32, 32, 255, 255);

        const shaftLength = 40;
        const shaftWidth = 2;
        const headSize = 5;

        const addBox = (
            center: Vector3,
            size: Vector3,
            color: Vector4
        ) => {

            const hx = size.x / 2;
            const hy = size.y / 2;
            const hz = size.z / 2;

            mesh.addBox(
                {
                    position: new Vector3(center.x - hx, center.y - hy, center.z + hz),
                    color
                },
                {
                    position: new Vector3(center.x + hx, center.y - hy, center.z + hz),
                    color
                },
                {
                    position: new Vector3(center.x + hx, center.y + hy, center.z + hz),
                    color
                },
                {
                    position: new Vector3(center.x - hx, center.y + hy, center.z + hz),
                    color
                },
                {
                    position: new Vector3(center.x - hx, center.y - hy, center.z - hz),
                    color
                },
                {
                    position: new Vector3(center.x + hx, center.y - hy, center.z - hz),
                    color
                },
                {
                    position: new Vector3(center.x + hx, center.y + hy, center.z - hz),
                    color
                },
                {
                    position: new Vector3(center.x - hx, center.y + hy, center.z - hz),
                    color
                }
            );
        };

        // ---------- X ----------
        addBox(
            new Vector3(0, 0, 0),
            new Vector3(shaftLength, shaftWidth, shaftWidth),
            RED
        );

        addBox(
            new Vector3(shaftLength / 2 + headSize / 2, 0, 0),
            new Vector3(headSize, headSize, headSize),
            RED
        );

        addBox(
            new Vector3(-shaftLength / 2 - headSize / 2, 0, 0),
            new Vector3(headSize, headSize, headSize),
            RED
        );

        // ---------- Y ----------
        addBox(
            new Vector3(0, 0, 0),
            new Vector3(shaftWidth, shaftLength, shaftWidth),
            GREEN
        );

        addBox(
            new Vector3(0, shaftLength / 2 + headSize / 2, 0),
            new Vector3(headSize, headSize, headSize),
            GREEN
        );

        addBox(
            new Vector3(0, -shaftLength / 2 - headSize / 2, 0),
            new Vector3(headSize, headSize, headSize),
            GREEN
        );

        // ---------- Z ----------
        addBox(
            new Vector3(0, 0, 0),
            new Vector3(shaftWidth, shaftWidth, shaftLength),
            BLUE
        );

        addBox(
            new Vector3(0, 0, shaftLength / 2 + headSize / 2),
            new Vector3(headSize, headSize, headSize),
            BLUE
        );

        addBox(
            new Vector3(0, 0, -shaftLength / 2 - headSize / 2),
            new Vector3(headSize, headSize, headSize),
            BLUE
        );

        out.mesh = mesh.build();

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