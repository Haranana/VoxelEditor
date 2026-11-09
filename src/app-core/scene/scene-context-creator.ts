import { Matrices4 } from "../../math/matrix/matrix-utils.ts";
import { Spaces } from "../../math/geometry/space-utils.ts";
import type { Vector2 } from "../../math/vector/vector2.ts";
import { Vector3 } from "../../math/vector/vector3.ts";
import { Vectors } from "../../math/vector/vector-utils.ts";
import { DistantLight } from "../../render-engine/renderableObjects/distantLight.ts";
import type { RenderableObject } from "../../render-engine/renderableObjects/renderableObject.ts";
import type { SceneObject } from "../scene-objects/sceneObject.ts";
import type { Scene } from "./scene.ts";
import { SceneGizmos } from "./scene-gizmos.ts";
import type { RenderContext } from "../../render-engine/renderer.ts";
import { VoxelObject } from "../scene-objects/voxel-object.ts";
import type { EditorView } from "../core-controller/core-controller.ts";
import type { Camera } from "../scene-objects/camera/camera.ts";


/*
    Static class responsible for creating render context 
    and object list based on the scene
*/

export class SceneContextCreator{

    //debug light for model view
    static readonly modelViewDistLight1: DistantLight = new DistantLight(new Vector3(0.53,-0.53,0.53));
    static readonly modelViewDistLight2: DistantLight = new DistantLight(new Vector3(-0.53,-0.53,-1));

    private static collectObjectViewRenderableObjects(scene: Scene, canvasSize: Vector2, camera: Camera): RenderableObject[]{
        
        const out: RenderableObject[] = [];
        const isSelectedVoxelObject = (obj: SceneObject) =>{
            if(!(obj instanceof VoxelObject )) return false;
            if(!scene.getActiveVoxelObject()) return false;
            if(scene.getActiveVoxelObject()!.sceneId!=obj.sceneId) return false;
            return true;
        }

        scene.getObjectsOfType(VoxelObject).forEach((obj)=>{              
            if( !isSelectedVoxelObject(obj) || !scene.objectViewEditorOptions.voxelObject || !obj.enabled){              
                    return;
            }      
            const objToAdd = obj.renderablesManager.getChunksRenderableObjects(obj);
            objToAdd.forEach(chunk=>{
                out.push(chunk);
            })
            
        });
        
        const selectedVo: VoxelObject | null = scene.getActiveVoxelObject(); ;
        const selectedVoChunksRo: RenderableObject[] | null = selectedVo? selectedVo.renderablesManager.getChunksRenderableObjects(selectedVo) : null;

        let loadedObjs = ""

        if(selectedVo /*&& selectedRo*/){

            if(selectedVo.enabled){
                if(scene.objectViewEditorOptions.voxelObjectGrid){
                    const newRenderableObject = selectedVo.renderablesManager.getObjectGridRenderableObject(selectedVo);
                    
                    out.push(newRenderableObject);
                }

                if(selectedVo.getSelectedVoxelsCount("dynamic") >0 ){                    
                    const selectedObjectSelectedArea = selectedVo.renderablesManager.getDynamicSelectedAreaRenderableObject(selectedVo);
                    out.push(selectedObjectSelectedArea);
                }            

                if(selectedVo.getSelectedVoxelsCount("static") >0){
                    const selectedObjectSelectedArea = selectedVo.renderablesManager.getStaticSelectedAreaRenderableObject(selectedVo);
                    out.push(selectedObjectSelectedArea);
                }
            }     
                   
            if(scene.objectViewEditorOptions.borderGrid){
                const newRenderableObject = selectedVo.renderablesManager.getBorderGridRenderableObject(selectedVo);
                
                out.push(newRenderableObject);
            }

            if(scene.objectViewEditorOptions.borderOutline){
                const newRenderableObject = selectedVo.renderablesManager.getBorderOutlineRenderableObject(selectedVo);
                
                out.push(newRenderableObject);
            }



            if(scene.sceneGizmosRenderOptions.cameraControllGizmo){
                const newRenderableObject = SceneGizmos.getCameraControllGizmoRo(camera);
                out.push(newRenderableObject);
            }else{
            }
            // Move gizmo position is based on static selected area bounding box center
            if(scene.sceneGizmosRenderOptions.objectMoveGizmo){
                const gizmoPositionGrid = selectedVo.getSelectedAreaBoundingBoxCenter('static');
                //console.log(`[SceneContextCreator] static area bbox center: ${gizmoPositionGrid}`);
                const camera = scene.getActiveCamera();
                if(gizmoPositionGrid && camera && selectedVoChunksRo && selectedVoChunksRo.length>0 /*&& selectedRo.mesh && selectedRo.mesh.vertices.length>0*/){
                    const gizmoPositionModel = selectedVo.GridPosToModel(gizmoPositionGrid);                
                    const gizmoPositionNdc = Spaces.modelToNdc(gizmoPositionModel,Matrices4.transform(selectedVo.getTransform()),
                        camera.getCameraView(), camera.getProjectionMatrix(canvasSize) );
                    
                    //getRoGizmoRo only needs ro for its transform, so here any chunk ro can be sent
                    const newRenderableObject = SceneGizmos.getMoveRoGizmoRo(selectedVoChunksRo[0]);                     
                    newRenderableObject.screenTransform!.anchor = Vectors.vector3To2(gizmoPositionNdc);
                    out.push(newRenderableObject);
                }
            }
            if(scene.sceneGizmosRenderOptions.objectResizeGizmo && selectedVoChunksRo && selectedVoChunksRo.length>0){
                const newRenderableObject = SceneGizmos.getResizeRoGizmoRo(selectedVoChunksRo[0]);
                out.push(newRenderableObject);
            }
            if(scene.sceneGizmosRenderOptions.objectRotateGizmo && selectedVoChunksRo && selectedVoChunksRo.length>0){
                const newRenderableObject = SceneGizmos.getRotateRoGizmoRo(selectedVoChunksRo[0]);
                out.push(newRenderableObject);
            }

            loadedObjs = ""; out.forEach(obj => {
                loadedObjs+=obj.name+" ,";
            }); 
            

        }             

        return out;
    }

    private static collectSceneViewRenderableObjects(scene: Scene, canvasSize: Vector2, camera: Camera): RenderableObject[]{
        const out: RenderableObject[] = [];
        const isSelectedVoxelObject = (obj: SceneObject) =>{
            if(!(obj instanceof VoxelObject )) return false;
            if(!scene.getActiveVoxelObject()) return false;
            if(scene.getActiveVoxelObject()!.sceneId!=obj.sceneId) return false;
            return true;
        }

        scene.getObjectsOfType(VoxelObject).forEach((obj)=>{              
            if(!obj.enabled){              
                    return;
            }      
            const objChunks = obj.renderablesManager.getChunksRenderableObjects(obj);
            objChunks.forEach(chunk=>{
                out.push(chunk);
            })
            if(scene.sceneViewEditorOptions.voxelObjectsGrid){
                out.push(obj.renderablesManager.getObjectGridRenderableObject(obj));
            }            
        });
        
        const selectedVo: VoxelObject | null = scene.getActiveVoxelObject(); ;        
        if(selectedVo){
            const selectedRo = selectedVo.renderablesManager.getChunksRenderableObjects(selectedVo);
            if(scene.objectViewEditorOptions.borderOutline){
                const newRenderableObject = selectedVo.renderablesManager.getBorderOutlineRenderableObject(selectedVo);
                
                out.push(newRenderableObject);
            }



            if(scene.sceneGizmosRenderOptions.cameraControllGizmo){
                const newRenderableObject = SceneGizmos.getCameraControllGizmoRo(camera);
                out.push(newRenderableObject);
            }


            // Move gizmo position is based on static selected area bounding box center
            if(scene.sceneGizmosRenderOptions.objectMoveGizmo){
                const gizmoPositionGrid = selectedVo.getSelectedAreaBoundingBoxCenter('static');
                if(gizmoPositionGrid &&  selectedRo.length>0 /*&& selectedRo.mesh && selectedRo.mesh.vertices.length>0*/){
                    const gizmoPositionModel = selectedVo.GridPosToModel(gizmoPositionGrid);                
                    const gizmoPositionNdc = Spaces.modelToNdc(gizmoPositionModel,Matrices4.transform(selectedVo.getTransform()),
                        camera.getCameraView(), camera.getProjectionMatrix(canvasSize) );
                    
                    //getRoGizmoRo only needs ro for its transform, so here any chunk ro can be sent
                    const newRenderableObject = SceneGizmos.getMoveRoGizmoRo(selectedRo[0]);                     
                    newRenderableObject.screenTransform!.anchor = Vectors.vector3To2(gizmoPositionNdc);
                    out.push(newRenderableObject);
                }
            }
            if(scene.sceneGizmosRenderOptions.objectResizeGizmo  && selectedRo.length>0){
                const newRenderableObject = SceneGizmos.getResizeRoGizmoRo(selectedRo[0]);
                out.push(newRenderableObject);
            }
            if(scene.sceneGizmosRenderOptions.objectRotateGizmo && selectedRo.length>0){
                const newRenderableObject = SceneGizmos.getRotateRoGizmoRo(selectedRo[0]);
                out.push(newRenderableObject);
            }
            
        }             

        return out;
    }

    private static collectRenderViewRenderableObjects(scene: Scene, canvasSize: Vector2, camera: Camera): RenderableObject[]{
        return []
    }


    
    //returns null if for whatever reason objects couldn't be collected
    public static collectRenderableObject(scene: Scene, canvasSize: Vector2, editorView: EditorView): (RenderableObject[] | null){
        const camera = scene.getActiveCamera();
        if(!camera){
            return null
        }
        
        let out: RenderableObject[] = [];
        if(editorView==='object'){
            out = SceneContextCreator.collectObjectViewRenderableObjects(scene, canvasSize, camera);
        }else if(editorView==='render'){
            out = SceneContextCreator.collectRenderViewRenderableObjects(scene, canvasSize, camera);
        }else if(editorView==='scene'){
            out = SceneContextCreator.collectSceneViewRenderableObjects(scene, canvasSize, camera);
        }


        return out;
    }

    public static collectLightSource(): DistantLight[]{
        return [this.modelViewDistLight1, this.modelViewDistLight2];
    }

    // returns null if for whatever reason context could not be created
    public static createRenderContext(scene: Scene, canvasSize: Vector2, editorView: EditorView): (RenderContext | null){
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