import type { Mesh } from "../../../render_engine/meshes/Mesh";
import { MeshBuilder } from "../../../render_engine/meshes/MeshBuilder";

// collection of functions for creating Meshes of Gizmos  

export function generateCameraControllsGizmoMesh(): Mesh{
        const meshBuilder: MeshBuilder = new MeshBuilder({
            topology: "triangle-list",
            attributes:[
                "color",
                "quadUV",
            ]
        });
        const out = meshBuilder.build();
        return out;
}

export function generateResizeGizmoMesh(): Mesh{
        const meshBuilder: MeshBuilder = new MeshBuilder({
            topology: "triangle-list",
            attributes:[
                "color",
                "quadUV",
            ]
        });
        const out = meshBuilder.build();
        return out;
}

export function generateRotateGizmoMesh(): Mesh{
        const meshBuilder: MeshBuilder = new MeshBuilder({
            topology: "triangle-list",
            attributes:[
                "color",
                "quadUV",
            ]
        });
        const out = meshBuilder.build();
        return out;
}

export function generateMoveGizmoMesh(): Mesh{
        const meshBuilder: MeshBuilder = new MeshBuilder({
            topology: "triangle-list",
            attributes:[
                "color",
                "quadUV",
            ]
        });
        const out = meshBuilder.build();
        return out;
}