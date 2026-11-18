/*
    Picking interactions with ids in [0-999] are reserved for editor built-in interactions with gizmos
    interactions ids above 999 are for voxel objects and their interaction id depends on their scene id
    eg: picking interaction id 1012 -> scene object of id: 12     
*/

export type PickingInteraction =
| 'miss'
| 'CameraGizmoPosX'
| 'CameraGizmoNegX'
| 'CameraGizmoPosY'
| 'CameraGizmoNegY'
| 'CameraGizmoPosZ'
| 'CameraGizmoNegZ'
| 'MoveGizmoX'
| 'MoveGizmoY'
| 'MoveGizmoZ'
| 'ResizeGizmoPosX'
| 'ResizeGizmoNegX'
| 'ResizeGizmoPosY'
| 'ResizeGizmoNegY'
| 'ResizeGizmoPosZ'
| 'ResizeGizmoNegZ'
| 'RotateGizmoPosX'
| 'RotateGizmoNegX'
| 'RotateGizmoPosY'
| 'RotateGizmoNegY'
| 'RotateGizmoPosZ'
| 'RotateGizmoNegZ'
| 'SceneObject'


const pickingInteractions: ReadonlyMap<number, PickingInteraction> = new Map([
    [0,  "miss"],

    [1,  "CameraGizmoPosX"],
    [2,  "CameraGizmoNegX"],
    [3,  "CameraGizmoPosY"],
    [4,  "CameraGizmoNegY"],
    [5,  "CameraGizmoPosZ"],
    [6,  "CameraGizmoNegZ"],

    [7,  "MoveGizmoX"],
    [8,  "MoveGizmoY"],
    [9,  "MoveGizmoZ"],


    [13, "ResizeGizmoPosX"],
    [14, "ResizeGizmoNegX"],
    [15, "ResizeGizmoPosY"],
    [16, "ResizeGizmoNegY"],
    [17, "ResizeGizmoPosZ"],
    [18, "ResizeGizmoNegZ"],

    [19, "RotateGizmoPosX"],
    [20, "RotateGizmoNegX"],
    [21, "RotateGizmoPosY"],
    [22, "RotateGizmoNegY"],
    [23, "RotateGizmoPosZ"],
    [24, "RotateGizmoNegZ"],
]);

//for simplicity returns undefined on miss
export function getPickingInteractionFromId(id: number): (PickingInteraction | undefined){
    if(id>=1000) return 'SceneObject';
    const out = pickingInteractions.get(id);
    if(out=='miss') return undefined;
    return out;
}

export function getPickingInteractionId(interaction: PickingInteraction): (undefined | number){
    let out: number | undefined = undefined
    pickingInteractions.forEach((v,k)=>{
        if(v===interaction){
            out = k;
        }
    })
    return out;
}

export function sceneObjectIdToPickingIntereactionId(sceneObjectId: number): (undefined|number){
    if(sceneObjectId<0) return undefined;
    return sceneObjectId+1000;
}

export function pickingInteractionIdToSceneId(pickingInteractionId: number) : number|undefined{
    if(pickingInteractionId<0) return undefined;
    return pickingInteractionId-1000;
}