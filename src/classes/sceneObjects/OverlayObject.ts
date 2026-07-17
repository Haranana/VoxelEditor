import { Vector2 } from "../../math/vector2.type";
import { SceneObject } from "./sceneObject";

class GizmoObject extends SceneObject{
    anchor: Vector2;
    constructor(anchor = new Vector2(0.5,0.5), name: string = "gizmo"){
        super(name);
        this.anchor = anchor;
    }
}    