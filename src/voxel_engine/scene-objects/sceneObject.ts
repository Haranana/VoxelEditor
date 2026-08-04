import type { Vector2 } from "../../math/vector2.type";
import type { Vector3 } from "../../math/vector3.type";

export type ScreenOverlayTransform = {
    anchor: Vector2,
    scale: Vector3,
    rotation: Vector3,
}

export type WorldObjectTransform = {
    translation: Vector3,
    scale: Vector3,
    rotation: Vector3,
}

export abstract class SceneObject {
    
    sceneId: number | null = null;
    name: string;
    enabled: boolean = true;

    constructor(name = "object") {
        this.name = name;
    }
}