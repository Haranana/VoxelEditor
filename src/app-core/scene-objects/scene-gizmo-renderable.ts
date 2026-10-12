import type { RenderableObject } from "../../render-engine/renderableObjects/renderableObject";
import type { SceneGizmos } from "../scene/scene-gizmos";
import type { Gizmo } from "./gizmo/gizmo-object";

//assumes that gizmo mesh never really changes so no "setMeshToRebuild" function is present
export class GizmoRenderable{
    #renderableObject: RenderableObject;
    #dirtyFlag: boolean = false;    
    #updateRenderableObject: (gizmo: Gizmo, ro: RenderableObject) => void;
    #createRenderableObject: (gizmo: Gizmo) => RenderableObject;
    
    constructor(gizmo: Gizmo,
        createRenderableObject: (gizmo: Gizmo)=>RenderableObject,
        updateRenderableObject: (gizmo: Gizmo, ro: RenderableObject) => void){
        
        this.#createRenderableObject = createRenderableObject;
        this.#updateRenderableObject = updateRenderableObject;
        this.#renderableObject = this.#createRenderableObject(gizmo);
    }

    getRenderableObject(gizmo: Gizmo): RenderableObject{
        if(this.#shouldUpdateRenderableObject()){
            this.#updateRenderableObject(gizmo, this.#renderableObject);
            this.#dirtyFlag = false;
        }
        return this.#renderableObject;
    }
    setRenderableObjectDirty(){
        this.#dirtyFlag = true;
    }

    #shouldUpdateRenderableObject(): boolean{
        return this.#dirtyFlag;
    }
}
