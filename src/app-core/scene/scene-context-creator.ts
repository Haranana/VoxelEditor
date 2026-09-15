import { Matrices4 } from "../../math/matrix/matrix-utils.ts";
import { Spaces } from "../../math/geometry/space-utils.ts";
import type { Vector2 } from "../../math/vector/vector2.ts";
import { Vector3 } from "../../math/vector/vector3.ts";
import { Vectors } from "../../math/vector/vector-utils.ts";
import { DistantLight } from "../../render-engine/renderableObjects/distantLight.ts";
import type { RenderableObject } from "../../render-engine/renderableObjects/renderableObject.ts";
import type { Camera } from "../scene-objects/camera/camera.ts";
import type { SceneObject } from "../scene-objects/sceneObject.ts";
import { VoxelObject } from "../scene-objects/voxel/voxel-object.ts";
import type { Scene } from "./scene.ts";
import { SceneGizmos } from "./scene-gizmos.ts";
import type { RenderContext } from "../../render-engine/renderer.ts";


/*
    Static class responsible for creating render context 
    and object list based on the scene
*/

export class SceneContextCreator{

    //debug light for model view
    static readonly modelViewDistLight1: DistantLight = new DistantLight(new Vector3(0.53,-0.53,0.53));
    static readonly modelViewDistLight2: DistantLight = new DistantLight(new Vector3(-0.53,-0.53,-1));
    
    //returns null if for whatever reason objects couldn't be collected
    public static collectRenderableObject(scene: Scene, canvasSize: Vector2): (RenderableObject[] | null){
        const camera = scene.getActiveCamera();
        if(!camera){
            return null
        }
        
        const out: RenderableObject[] = [];
        
        const isSelectedVoxelObject = (obj: SceneObject) =>{
            if(!(obj instanceof VoxelObject)) return false;
            if(!scene.getActiveVoxelObject()) return false;
            if(scene.getActiveVoxelObject()!.sceneId!=obj.sceneId) return false;
            return true;
        }

        scene.getObjectsOfType(VoxelObject).forEach((obj)=>{              
            if( !isSelectedVoxelObject(obj) || !scene.seletedVoxelObjectRenderOptions.voxelObject || !obj.enabled){              
                    return;
            }      
            const objToAdd = obj.getObjectRo();
                   
            out.push(objToAdd);
        });
        
        const selectedVo: VoxelObject | null = scene.getActiveVoxelObject(); ;
        const selectedRo: RenderableObject | null = selectedVo? selectedVo.getObjectRo() : null;

        let loadedObjs = ""

        if(selectedVo && selectedRo){

            if(selectedVo.enabled){
                if(scene.seletedVoxelObjectRenderOptions.voxelObjectGrid){
                    const newRenderableObject = selectedVo.getObjectGridRo();
                    
                    out.push(newRenderableObject);
                }

                if(selectedVo.staticSelectedArea.voxels.size>0){
                    
                    const selectedObjectSelectedArea = selectedVo.getStaticSelectedAreaRo();
                    out.push(selectedObjectSelectedArea);
                }
                if(selectedVo.dynamicSelectedArea.voxels.size>0){
                    const selectedObjectSelectedArea = selectedVo.getDynamicSelectedAreaRo();
                    
                    out.push(selectedObjectSelectedArea);
                }                
            }     
                   
            if(scene.seletedVoxelObjectRenderOptions.borderGrid){
                const newRenderableObject = selectedVo.getBorderGridRo();
                
                out.push(newRenderableObject);
            }

            if(scene.seletedVoxelObjectRenderOptions.borderOutline){
                const newRenderableObject = selectedVo.getBorderOutlineRo();
                
                out.push(newRenderableObject);
            }



            if(scene.sceneGizmosRenderOptions.cameraControllGizmo){
                const newRenderableObject = SceneGizmos.getCameraControllGizmoRo(camera);
                out.push(newRenderableObject);
            }else{
            }
            // Move gizmo position is based on static selected area bounding box center
            if(scene.sceneGizmosRenderOptions.objectMoveGizmo){
                const gizmoPositionGrid = selectedVo.getSelectedAreaMiddle('static');
                
                const camera = scene.getActiveCamera();
                if(gizmoPositionGrid && camera && selectedRo && selectedRo.mesh && selectedRo.mesh.vertices.length>0){
                    const gizmoPositionModel = selectedVo.voxelIdToModelSpace(gizmoPositionGrid);                
                    const gizmoPositionNdc = Spaces.modelToNdc(gizmoPositionModel,Matrices4.transform(selectedVo.transform),
                        camera.getCameraView(), camera.getProjectionMatrix(canvasSize) );
                    
                    const newRenderableObject = SceneGizmos.getMoveRoGizmoRo(selectedRo);                    
                    newRenderableObject.screenTransform!.anchor = Vectors.vector3To2(gizmoPositionNdc);
                    out.push(newRenderableObject);
                }
            }
            if(scene.sceneGizmosRenderOptions.objectResizeGizmo){
                const newRenderableObject = SceneGizmos.getResizeRoGizmoRo(selectedRo);
                out.push(newRenderableObject);
            }
            if(scene.sceneGizmosRenderOptions.objectRotateGizmo){
                const newRenderableObject = SceneGizmos.getRotateRoGizmoRo(selectedRo);
                out.push(newRenderableObject);
            }

            loadedObjs = ""; out.forEach(obj => {
                loadedObjs+=obj.name+" ,";
            }); 
            

        }             

        return out;
    }

    public static collectLightSource(): DistantLight[]{
        return [this.modelViewDistLight1, this.modelViewDistLight2];
    }

    // returns null if for whatever reason context could not be created
    public static createRenderContext(scene: Scene, canvasSize: Vector2): (RenderContext | null){
        const camera = scene.getActiveCamera();
        const resolution = canvasSize;
        if(!camera){
            return null;
        }

        const renderContext: RenderContext = {
        device: null,
        queue: null,
        cameraContext: {
          viewMatrix: camera.getCameraView(),
          ndcProjection: camera.getProjectionMatrix(resolution),       
          position: camera.transform.translation,
        },
        viewportContext: {
          resolution,
        },
        timeContext:  null,
        gizmoCameraContext: {
          pitch: camera.pitch,
          yaw: camera.yaw,
        },
        lightSourcesContext: {
          lights: SceneContextCreator.collectLightSource(),
        },
        globalData: null,
      }
      return renderContext;
    }
}