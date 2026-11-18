
import { Vector2 } from "../../math/vector/vector2";
import { Vector3 } from "../../math/vector/vector3";
import { RenderableObject} from "../../render-engine/renderableObjects/renderableObject";
import { screenObjectShader, worldObjectGridShader, worldObjectShader } from "../../render-engine/shaders/base-shaders";
import { Shader } from "../../render-engine/shaders/shader";
import { CameraShaderResources, GizmoCameraShaderResources, ScreenObjectShaderResources, ViewportShaderResources, WorldObjectShaderResources } from "../../render-engine/shaders/shader-resource";
import type { Camera } from "../scene-objects/camera/camera";
import { generateAxisBorderMesh, generateCameraControllsGizmoMesh, generateMoveGizmoMesh, generateRotateGizmoMesh, generateScaleGizmoMesh } from "./scene-objects-mesh-generator";
import { getDefaultScreenTransform, RenderableSceneObject, type ScreenOverlayTransform, type WorldObjectTransform } from "../scene-objects/sceneObject";
import { radiansToDegrees } from "../../math/utils";

/*
    Static class responsible for storing and creating
    Scene Objects of the scene such as gizmos, scene floor grid etc
*/
export class SceneObjectsManager{
    constructor(){
        this.#cameraControllGizmo = this.#createCameraControllGizmo();
        this.#moveObjectGizmo = this.#createMoveObjectGizmo();
        this.#scaleObjectGizmo = this.#createScaleObjectGizmo();
        this.#rotateObjectGizmo = this.#createRotateObjectGizmo();
        
        this.#sceneAxisBorderX = this.#createAxisBorderX();
        this.#sceneAxisBorderY = this.#createAxisBorderY();
        this.#sceneAxisBorderZ = this.#createAxisBorderZ();
    }

    // Camera controll gizmo
    #cameraControllGizmo: RenderableSceneObject;

    #createCameraControllGizmo(): RenderableSceneObject{
        const out = new RenderableSceneObject("camera controll gizmo", 'Screen');
        out.renderableObject = this.#createCameraControllGizmoRo();
        out.worldTransform = null;
        out.screenTransform = {
            anchor: new Vector2(0.8,0.8),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        }
        return out;
    }

    getCameraControllGizmoRo(c: Camera): RenderableObject{
        //console.log(`[getCameraControllGizmoRo] pitch|yaw: ${radiansToDegrees(c.pitch)}|${radiansToDegrees(c.yaw)}`)
        let out = this.#cameraControllGizmo.renderableObject;
        if(!out){
            out = this.#createCameraControllGizmoRo();            
        }        
        out.screenTransform = out.screenTransform? 
        {
            ...out.screenTransform,
            rotation: new Vector3(c.pitch, c.yaw, 0.0)
        } :
        {
            anchor: new Vector2(0.8,0.8),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        }

        return out;
    }

    #createCameraControllGizmoRo(): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        out.worldTransform = null;
        out.screenTransform =         {
            anchor: new Vector2(0.8,0.8),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        }
        const shader = new Shader(screenObjectShader(), "vertexShader", "fragmentShader", 
        [new ViewportShaderResources(0) ,new CameraShaderResources(1),new ScreenObjectShaderResources(2), new GizmoCameraShaderResources(3)]);
        out.material = {shader};
        out.useSecondaryDepthTexture = true;
        out.mesh = generateCameraControllsGizmoMesh();
        out.collider = null; 
        out.saveToIdBuffer = true;
        out.name = "camera controll gizmo";

        return out;
    }

    // Move object gizmo
    #moveObjectGizmo: RenderableSceneObject;
    #createMoveObjectGizmo(): RenderableSceneObject{
        const out = new RenderableSceneObject("move object gizmo", "Screen");
        out.renderableObject = this.#createMoveObjectGizmoRo();        
        out.worldTransform = null;
        out.screenTransform = getDefaultScreenTransform();      
        return out;
    }

    getMoveObjectGizmoRo(t: ScreenOverlayTransform): RenderableObject{
        let out = this.#moveObjectGizmo.renderableObject;
        if(!out){
            out = this.#createMoveObjectGizmoRo();            
        }            
        out.screenTransform = t;
        return out;
    }

    #createMoveObjectGizmoRo(): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        const shader = new Shader(screenObjectShader(), "vertexShader", "fragmentShader", 
        [new ViewportShaderResources(0) ,new CameraShaderResources(1),new ScreenObjectShaderResources(2), new GizmoCameraShaderResources(3)]);
        out.material = {shader};
        out.useSecondaryDepthTexture = true;
         
        out.mesh = generateMoveGizmoMesh();
        out.collider = null; 
        out.saveToIdBuffer = true;
        
        out.screenTransform = getDefaultScreenTransform(); 
        out.name = "move object gizmo";

        return out;
    }

    // Scale object gizmo
    #scaleObjectGizmo: RenderableSceneObject;
    #createScaleObjectGizmo(): RenderableSceneObject{
        const out = new RenderableSceneObject("scale object gizmo", "Screen");
        out.renderableObject = this.#createScaleObjectGizmoRo();        
        out.worldTransform = null;
        out.screenTransform = getDefaultScreenTransform();        
        return out;
    }

    getScaleObjectGizmoRo(t: ScreenOverlayTransform): RenderableObject{
        let out = this.#scaleObjectGizmo.renderableObject;
        if(!out){
            out = this.#createScaleObjectGizmoRo();            
        }            
        out.screenTransform = t

        return out;
    }

    #createScaleObjectGizmoRo(): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        const shader = new Shader(screenObjectShader(), "vertexShader", "fragmentShader", 
        [new ViewportShaderResources(0) ,new CameraShaderResources(1),new ScreenObjectShaderResources(2), new GizmoCameraShaderResources(3)]);
        out.material = {shader};
        out.saveToIdBuffer = true;
         
        out.mesh = generateScaleGizmoMesh();
        out.collider = null; 
        
        out.screenTransform = getDefaultScreenTransform();
        out.name = "scale object gizmo";

        return out;
    }

    // Rotate object gizmo
    #rotateObjectGizmo: RenderableSceneObject;
    #createRotateObjectGizmo(): RenderableSceneObject{
        const out = new RenderableSceneObject("rotate object gizmo", "Screen");
        out.renderableObject = this.#createRotateObjectGizmoRo();        
        out.worldTransform = null;
        out.screenTransform = getDefaultScreenTransform();        
        return out;
    }

    getRotateObjectGizmoRo(t: ScreenOverlayTransform): RenderableObject{
        let out = this.#rotateObjectGizmo.renderableObject;
        if(!out){
            out = this.#createRotateObjectGizmoRo();            
        }            
        out.screenTransform = t

        return out;
    }

    #createRotateObjectGizmoRo(): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        const shader = new Shader(screenObjectShader(), "vertexShader", "fragmentShader", 
        [new ViewportShaderResources(0) ,new CameraShaderResources(1),new ScreenObjectShaderResources(2), new GizmoCameraShaderResources(3)]);
        out.material = {shader};
        out.saveToIdBuffer = true;
         
        out.mesh = generateRotateGizmoMesh();
        out.collider = null; 
        
        out.screenTransform = getDefaultScreenTransform();
        out.name = "move object gizmo";

        return out;
    }

    // Scene axis borders
    #sceneAxisBorderX: RenderableSceneObject;
    #createAxisBorderX(): RenderableSceneObject{
        const out = new RenderableSceneObject("scene axis border x", "World");

        out.renderableObject = this.#createAxisBorderXRo();        
        out.screenTransform = null;
        out.worldTransform = {
            translation: new Vector3(0,0,0),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        };        
        return out;
    }

    getAxisBorderXRo(t: WorldObjectTransform): RenderableObject{
        let out = this.#sceneAxisBorderX.renderableObject;
        if(!out){
            out = this.#createAxisBorderXRo();            
        }            
        out.worldTransform = out.worldTransform? 
        {
            ...out.worldTransform,
            translation: t.translation,
        } :
        {
            translation: new Vector3(0,0,0),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        }; 

        return out;
    }

    #createAxisBorderXRo(): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        const shader = new Shader(worldObjectGridShader(), "vertexShader", "fragmentShader", 
        [new ViewportShaderResources(0) ,new CameraShaderResources(1),new WorldObjectShaderResources(2)]);
        out.material = {shader};
        
         
        out.mesh = generateAxisBorderMesh('X');
        out.collider = null; 
        
        out.worldTransform = {
            translation: new Vector3(0,0,0),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        }; 
        out.name = "scene axis border x";

        return out;
    }

    #sceneAxisBorderY: RenderableSceneObject;
    #createAxisBorderY(): RenderableSceneObject{
        const out = new RenderableSceneObject("scene axis border y", "World");
        out.renderableObject = this.#createAxisBorderYRo();        
        out.screenTransform = null;
        out.worldTransform = {
            translation: new Vector3(0,0,0),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        };        
        return out;
    }

    getAxisBorderYRo(t: WorldObjectTransform): RenderableObject{
        let out = this.#sceneAxisBorderY.renderableObject;
        if(!out){
            out = this.#createAxisBorderYRo();            
        }            
        out.worldTransform = out.worldTransform? 
        {
            ...out.worldTransform,
            translation: t.translation,
        } :
        {
            translation: new Vector3(0,0,0),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        }; 

        return out;
    }

    #createAxisBorderYRo(): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        const shader = new Shader(worldObjectGridShader(), "vertexShader", "fragmentShader", 
        [new ViewportShaderResources(0) ,new CameraShaderResources(1),new WorldObjectShaderResources(2)]);
        out.material = {shader};
         
        out.mesh = generateAxisBorderMesh('Y');
        out.collider = null; 
        
        out.worldTransform = {
            translation: new Vector3(0,0,0),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        }; 
        out.name = "scene axis border y";

        return out;
    }

    #sceneAxisBorderZ: RenderableSceneObject;
    #createAxisBorderZ(): RenderableSceneObject{
        const out = new RenderableSceneObject("scene axis border z", "World");
        out.renderableObject = this.#createAxisBorderZRo();        
        out.screenTransform = null;
        out.worldTransform = {
            translation: new Vector3(0,0,0),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        };        
        return out;
    }

    getAxisBorderZRo(t: WorldObjectTransform): RenderableObject{
        let out = this.#sceneAxisBorderZ.renderableObject;
        if(!out){
            out = this.#createAxisBorderZRo();            
        }            
        out.worldTransform = out.worldTransform? 
        {
            ...out.worldTransform,
            translation: t.translation,
        } :
        {
            translation: new Vector3(0,0,0),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        }; 

        return out;
    }

    #createAxisBorderZRo(): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        const shader = new Shader(worldObjectGridShader(), "vertexShader", "fragmentShader", 
        [new ViewportShaderResources(0) ,new CameraShaderResources(1),new WorldObjectShaderResources(2)]);
        out.material = {shader};
         
        out.mesh = generateAxisBorderMesh('Z');
        out.collider = null; 
        
        out.worldTransform = {
            translation: new Vector3(0,0,0),
            scale: new Vector3(1,1,1),
            rotation: new Vector3(0,0,0),
        }; 
        out.name = "scene axis border z";

        return out;
    }    
}