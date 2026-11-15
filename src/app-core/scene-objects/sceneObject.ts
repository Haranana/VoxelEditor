import { Vector2 } from "../../math/vector/vector2";
import { Vector3 } from "../../math/vector/vector3";
import type { RenderableObject } from "../../render-engine/renderableObjects/renderableObject";
export abstract class SceneObject {
    
    sceneId: number | null = null;
    name: string;
    enabled: boolean = true;

    constructor(name = "object") {
        this.name = name;
    }
}

export type RenderType = "Screen" | "World";

export type ScreenOverlayTransform = {
    anchor: Vector2, //refers to position in NDC
    scale: Vector3,
    rotation: Vector3,
}

export type WorldObjectTransform = {
    translation: Vector3,
    scale: Vector3,
    rotation: Vector3,
}

export function getDefaultWorldTransform(): WorldObjectTransform {
    return {
    translation: new Vector3(0,0,0),
    scale: new Vector3(1,1,1),
    rotation: new Vector3(0,0,0),
    } 
}

export function getDefaultScreenTransform(): ScreenOverlayTransform {
    return {
    anchor: new Vector2(0,0),
    scale: new Vector3(1,1,1),
    rotation: new Vector3(0,0,0),
    } 
}

export class RenderableSceneObject extends SceneObject{
    renderableObject: RenderableObject | null = null
    readonly renderType: RenderType;
    
    screenTransform: ScreenOverlayTransform | null = null
    worldTransform: WorldObjectTransform | null = null

    constructor(name: string, renderType: RenderType ){
        super(name)
        this.renderType = renderType;
        if(renderType==='Screen'){
            this.screenTransform = {
                anchor: new Vector2(0,0),
                scale: new Vector3(1,1,1),
                rotation: new Vector3(1,1,1),
            }
        }else if(renderType==='World'){
            this.worldTransform = {
                translation: new Vector3(0,0,0),
                scale: new Vector3(1,1,1),
                rotation: new Vector3(1,1,1),
            }
        }
    }
}
