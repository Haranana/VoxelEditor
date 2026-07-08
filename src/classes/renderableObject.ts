import { Vector3 } from "../math/vector3.type";

export enum RenderTechniqueType {
    FILLED,
    WIREFRAME,
    BORDER,
    GIZMO,
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

