import { Vector3 } from "../../math/vector3.type";

export enum RenderTechniqueType {
    FILLED,
    WIREFRAME,
    OUTLINE,
    GIZMO,
    GRID,
}

export class RenderableObject{
    mesh: Mesh | null = null;
    material?: Material;
    collider: Collider | null = null; 
    transform: Transform ={
        translation: new Vector3(0,0,0),
        scale: new Vector3(1,1,1),
        rotation: new Vector3(0,0,0),
    }
    
    copy(){
        const out = new RenderableObject();

        out.mesh = this.mesh;

        if (this.material) {
            out.material = {
                ...this.material,
            };
        }

        out.collider = this.collider;

        out.transform = {
            translation: new Vector3(
                this.transform.translation.x,
                this.transform.translation.y,
                this.transform.translation.z,
            ),
            scale: new Vector3(
                this.transform.scale.x,
                this.transform.scale.y,
                this.transform.scale.z,
            ),
            rotation: new Vector3(
                this.transform.rotation.x,
                this.transform.rotation.y,
                this.transform.rotation.z,
            ),
        };
        return out;
    }
    
}

export type Mesh = {
    vertices: Float32Array,
    indices: Uint32Array,
    topology: GPUPrimitiveTopology,
    layout: VertexLayout,
}

export type VertexLayout = {
    stride: number,
    attributes: VertexAttributes[]
}

export type VertexAttributes = {
    location: number,
    offset: number,
    format: GPUVertexFormat,
}

//to be implemented when starting to work on shading
export type Material = {
    renderTechnique: RenderTechniqueType,
}

//to be implemented when starting to work on mesh hit detection
export type Collider = {

}

export type Transform = {
    translation: Vector3,
    scale: Vector3,
    rotation: Vector3, //in degrees, in future it would probably be better to store radians
}

