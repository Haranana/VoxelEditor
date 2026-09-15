import { Vector3 } from "../../../math/vector/vector3";
import { SceneObject, type WorldObjectTransform } from "../sceneObject";

export class LightSource extends SceneObject{
    worldTransform: WorldObjectTransform | null = {
        translation: new Vector3(0,0,0),
        scale: new Vector3(1,1,1),
        rotation: new Vector3(1,1,1),
    }

    constructor(name: string = "Light"){
        super(name);
    }
}    