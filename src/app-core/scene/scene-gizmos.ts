import { degreeToRadians } from "../../math/utils";
import { Vector2 } from "../../math/vector/vector2";
import { Vector3 } from "../../math/vector/vector3";
import { RenderableObject} from "../../render-engine/renderableObjects/renderableObject";
import type { Camera } from "../scene-objects/camera/camera";
import { generateCameraControllsGizmoMesh, generateMoveGizmoMesh, generateResizeGizmoMesh, generateRotateGizmoMesh } from "../scene-objects/gizmo/gizmo-mesh-generator";
import { Gizmo } from "../scene-objects/gizmo/gizmo-object";
import { RenderableObjectManager } from "../scene-objects/renderable-object-manager";

/*
    Static class responsible for storing, creating, updating and creating
    renderable objects of scene gizmos
*/
export class SceneGizmos{
    
    static #cameraControllGizmo: Gizmo =  this.#createCameraControllGizmo();
    static getCameraControllGizmoRo(camera: Camera): RenderableObject{
        const gizmo = this.#cameraControllGizmo;
        
        gizmo.screenTransform =gizmo.screenTransform? {...gizmo.screenTransform, rotation: new Vector3(degreeToRadians(camera.pitch), degreeToRadians(camera.yaw), 0.0)} : null;        
        if(!gizmo.gizmoRo){
            gizmo.gizmoRo = RenderableObjectManager.createGizmoRo(gizmo);            
        }
        RenderableObjectManager.rebuildGizmoRo(gizmo, gizmo.gizmoRo)

        return gizmo.gizmoRo;
    }
    static #createCameraControllGizmo(): Gizmo{
        const out = new Gizmo("camera gizmo");
        out.mesh = generateCameraControllsGizmoMesh();
        out.worldTransform = null;
        out.screenTransform = {
            anchor: new Vector2(0.8,0.8),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        }
        out.gizmoType = "screen";
        out.gizmoRo = RenderableObjectManager.createGizmoRo(out);

        return out;
    }

    static #moveRoGizmo: Gizmo =  this.#createMoveRoGizmo();
    static getMoveRoGizmoRo(ro: RenderableObject): RenderableObject{
        const gizmo = this.#moveRoGizmo;
        
        gizmo.worldTransform = gizmo.worldTransform && ro.worldTransform? {...gizmo.worldTransform, translation: ro.worldTransform.translation} : null;        
        if(!gizmo.gizmoRo){
            gizmo.gizmoRo = RenderableObjectManager.createGizmoRo(gizmo);            
        }
        RenderableObjectManager.rebuildGizmoRo(gizmo, gizmo.gizmoRo)

        return gizmo.gizmoRo;
    }
    static #createMoveRoGizmo(): Gizmo{
        const out = new Gizmo("move object gizmo");
        out.mesh = generateMoveGizmoMesh();
        out.screenTransform = {
            anchor: new Vector2(0,0),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        };
        out.gizmoType = "screen";
        out.gizmoRo = RenderableObjectManager.createGizmoRo(out);
        return out;
    }

    static #resizeRoGizmo: Gizmo =  this.#createResizeRoGizmo();
    static getResizeRoGizmoRo(ro: RenderableObject): RenderableObject{
        const gizmo = this.#resizeRoGizmo;
    
        gizmo.worldTransform = gizmo.worldTransform && ro.worldTransform? {...gizmo.worldTransform, translation: ro.worldTransform.translation} : null;
        if(!gizmo.gizmoRo){
            gizmo.gizmoRo = RenderableObjectManager.createGizmoRo(gizmo);            
        }
        RenderableObjectManager.rebuildGizmoRo(gizmo, gizmo.gizmoRo)

        return gizmo.gizmoRo;
    }    
    static #createResizeRoGizmo(): Gizmo{
        const out = new Gizmo("scale object gizmo");
        out.mesh = generateResizeGizmoMesh();
        out.screenTransform = null;
        out.worldTransform = {
            translation: new Vector3(0.5,0.5,0.5),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        }
        out.gizmoType = "world";
        out.gizmoRo = RenderableObjectManager.createGizmoRo(out);

        return out;
    }

    static #rotateRoGizmo: Gizmo =  this.#createRotateRoGizmo();
    static getRotateRoGizmoRo(ro: RenderableObject): RenderableObject{
        const gizmo = this.#rotateRoGizmo;
        
        gizmo.worldTransform = gizmo.worldTransform && ro.worldTransform? {...gizmo.worldTransform, translation: ro.worldTransform.translation} : null;       
        if(!gizmo.gizmoRo){
            gizmo.gizmoRo = RenderableObjectManager.createGizmoRo(gizmo);            
        }
        RenderableObjectManager.rebuildGizmoRo(gizmo, gizmo.gizmoRo)

        return gizmo.gizmoRo;
    }
    static #createRotateRoGizmo(): Gizmo{
        const out = new Gizmo("rotate object gizmo");
        out.mesh = generateRotateGizmoMesh();
        out.screenTransform = null;
        out.worldTransform = {
            translation: new Vector3(0.5,0.5,0.5),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        }
        out.gizmoType = "world";
        out.gizmoRo = RenderableObjectManager.createGizmoRo(out);

        return out;
    }
}