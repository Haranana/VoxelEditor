import { RenderableObject } from "../../render-engine/renderableObjects/renderableObject";
import { screenObjectShader, worldObjectShader } from "../../render-engine/shaders/base-shaders";
import { Shader } from "../../render-engine/shaders/shader";
import { CameraShaderResources, GizmoCameraShaderResources, ScreenObjectShaderResources, ViewportShaderResources, WorldObjectShaderResources } from "../../render-engine/shaders/shader-resource";
import type { Gizmo } from "./gizmo/gizmo-object";

export class SceneRenderablesManager{
    
    #createGizmoRo(gizmo: Gizmo): RenderableObject{
        const out: RenderableObject = new RenderableObject();
        if(gizmo.gizmoType === "world"){ 
            const shader = new Shader(worldObjectShader(), "vertexShader", "fragmentShader", 
            [new ViewportShaderResources(0) ,new CameraShaderResources(1),new WorldObjectShaderResources(2), new GizmoCameraShaderResources(3)]);
            out.material = {shader};
        }else if(gizmo.gizmoType === "screen"){
            const shader = new Shader(screenObjectShader(), "vertexShader", "fragmentShader", 
            [new ViewportShaderResources(0) ,new CameraShaderResources(1),new ScreenObjectShaderResources(2), new GizmoCameraShaderResources(3)]);
            out.material = {shader};
        }        
        out.mesh = gizmo.mesh;
        out.collider = null; 
        out.screenTransform = gizmo.screenTransform;
        out.worldTransform = gizmo.worldTransform;
        out.name = gizmo.name;

        return out;
    }

    #updateGizmoRo(gizmo: Gizmo, ro: RenderableObject): void{
        ro.mesh = gizmo.mesh;                
        if(gizmo.gizmoType === "world"){         
            if(!ro.material || !ro.material.shader){
                const shader = new Shader(worldObjectShader(), "vertexShader", "fragmentShader", 
                [new ViewportShaderResources(0) ,new CameraShaderResources(1),new WorldObjectShaderResources(2)]);
                ro.material = {shader};
            }
            ro.worldTransform = gizmo.worldTransform? {...gizmo.worldTransform} : null;
            
        }else if(gizmo.gizmoType === "screen"){
            if(!ro.material || !ro.material.shader){
            const shader = new Shader(screenObjectShader(), "vertexShader", "fragmentShader", 
            [new ViewportShaderResources(0) ,new CameraShaderResources(1),new ScreenObjectShaderResources(2)]);
            ro.material = {shader};
            }
            ro.screenTransform = gizmo.screenTransform? {...gizmo.screenTransform} : null;                
        }            
        ro.name = gizmo.name;
        ro.collider = null; 
        ro.useSecondaryDepthTexture = true;
    }

}



