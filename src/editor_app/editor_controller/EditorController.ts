import type { RefObject } from "react";
import { Vector3 } from "../../math/vector3.type";
import type { Scene } from "../../voxel_engine/scene/scene";
import { clamp, mod } from "../../math/utils";
import type { Vector2 } from "../../math/vector2.type";
import { Camera, type ProjectionType } from "../../voxel_engine/scene-objects/camera/camera";
import { getVoxelFromObject, marqueeSelectRectangle } from "../../voxel_engine/voxel-ray-caster";
import { Matrices4 } from "../../math/matrices";
import { faceDirectionToVector, vectorToFaceDirection, VoxelObject } from "../../voxel_engine/scene-objects/voxel/voxel-object";
import { Vector4 } from "../../math/vector4.type";
import { generateCylinderVoxelArray, generatePyramidVoxelArray, generateSphereVoxelArray } from "../../voxel_engine/scene-objects/voxel/voxel-array-generator";
import type { SceneObject } from "../../voxel_engine/scene-objects/sceneObject";
import { getBasicSampleVoxelObject } from "../../voxel_engine/scene-objects/voxel/sample-voxel-objects";
import { getSampleCamera } from "../../voxel_engine/scene-objects/camera/sample-cameras";


type BoxSelectSession = {
    startCoords: Vector3 | null,
    endCoords: Vector3 | null,
}

type MarqueeSelectSession = {
    startCoords: Vector2 | null,
    endCoords: Vector2 | null,
}

type CameraMoveSession = {
    lastX: number | null,
    lastY: number | null,
    deltaX: number,
    deltaY: number,
}

export type SelectMode = 
| "Voxel"
| "Cube"
| "Face"
| "Color"
| "Connected"
| "Marquee"

export type EditMode = 
| "Add"
| "Paint"
| "Remove"
| "Move"
| "Select"

export class EditorController{
    selectMode: SelectMode  = "Voxel";
    editMode: EditMode  = "Add";
    scene: Scene | null = null;
    renderScene: (()=>void) | null = null;
    initialized: boolean = false;

    constructor(){}

    init(scene: Scene, renderScene: ()=>void){
        this.renderScene = renderScene;
        this.#startCameraMoveAnimationLoop();
        this.scene = scene;

        this.initialized = true;
    }

    setRenderScene(renderScene: ()=>void){
        this.renderScene = renderScene;
    }

    //Pressed keys handling
    pressedKeys : Set<string> = new Set();

    registerKeyDown(e: KeyboardEvent){
        this.pressedKeys.add(e.key.toLowerCase());
    }

    registerKeyUp(e: KeyboardEvent){
        this.pressedKeys.delete(e.key.toLowerCase());
    }

    //Camera properties handling
    cameraMoveSession: CameraMoveSession = {
        lastX : null,
        lastY : null,
        deltaX: 0,
        deltaY: 0,
    };
    animationFrameId: number | null = null;
    lastTime: number | null = null;
    cameraFovYMinValue = 1;
    cameraFovYMaxValue = 179;

    cameraNearMinValue = 0.001;
    cameraNearMaxValue = 1000;

    cameraFarMinValue = 0.001;
    cameraFarMaxValue = 5000;

    cameraDistanceMinValue = 0;
    cameraDistanceMaxValue = 10000;

    cameraPitchMinValue = -89;
    cameraPitchMaxValue = 89;
    cameraYawMinValue = 0;
    cameraYawMaxValue = 360;

    mouseWheelSensitivity = 0.25;
    
    onCameraModified : (()=>void) | null = null; //not sure whats that supposed to do, dont remember


    #startCameraMoveAnimationLoop(){
        const cameraMoveAnimationLoop = (time: number) => {         
            if(this.initialized && this.scene && this.scene.getActiveCamera() ){  
                const scene = this.scene!;
                const camera = scene.getActiveCamera();
                
                if(!camera) return;

                const pitchChangeRate = 90;
                const yawChangeRate = 90;
                const last = this.lastTime ?? time;
                const deltaTime = (time - last) / 1000;
                this.lastTime = time;
                
                //let updatedCamera = { ...this.camera!};
                let cameraModified = false;

                if(this.pressedKeys.has("w")){
                    camera.pitch = clamp({value: camera.pitch + pitchChangeRate*deltaTime, min: -89, max: 89});
                    cameraModified = true;
                }
                if(this.pressedKeys.has("s")){
                    camera.pitch = clamp({value: camera.pitch - pitchChangeRate*deltaTime, min: -89, max: 89});
                    cameraModified = true;
                }
                if(this.pressedKeys.has("a")){
                    camera.yaw = camera.yaw + yawChangeRate*deltaTime;
                    cameraModified = true;
                }
                if(this.pressedKeys.has("d")){
                    camera.yaw = camera.yaw - yawChangeRate*deltaTime;
                    cameraModified = true;
                }   

                
                const mouseSensitivity = 0.5;
                const dx = this.cameraMoveSession.deltaX;
                const dy = this.cameraMoveSession.deltaY;     

                if (dx !== 0 || dy !== 0) {
                    camera.yaw -= dx * mouseSensitivity;
                    camera.pitch -=dy * mouseSensitivity;
                    camera.pitch = clamp( {value: camera.pitch , min: -89, max: 89});
                    this.cameraMoveSession.deltaX = 0;
                    this.cameraMoveSession.deltaY = 0;

                    cameraModified = true;
                }

                if(cameraModified){
                    //console.log("[EditorController] camera modified: " + this.camera!.pitch + " : " + this.camera!.yaw);
                    if(this.onCameraModified!=null) this.onCameraModified();
                    this.renderScene!();   
                }
            }
            this.animationFrameId = requestAnimationFrame(cameraMoveAnimationLoop);
        }
        this.animationFrameId = requestAnimationFrame(cameraMoveAnimationLoop);
    }

    hasCameraMoveSessionStarted(){
        return this.cameraMoveSession.lastX != null && this.cameraMoveSession.lastY != null;
    }

    startCameraMoveSession(clickPos: Vector2){        
        this.cameraMoveSession.lastX = clickPos.x;
        this.cameraMoveSession.lastY = clickPos.y;
    }

    updateCameraMoveSession(clickPos: Vector2){
        if(!this.hasCameraMoveSessionStarted()) return;
        
        
        const dx = clickPos.x - this.cameraMoveSession.lastX!;
        const dy = clickPos.y - this.cameraMoveSession.lastY!;

        if(dx!==0 || dy!==0) {
            this.cameraMoveSession.deltaX += dx;
            this.cameraMoveSession.deltaY += dy;

            this.cameraMoveSession.lastX = clickPos.x;
            this.cameraMoveSession.lastY = clickPos.y;
        }
    }

    endCameraMoveSession(){
        this.cameraMoveSession = {lastX: null,
            lastY: null,
            deltaX: 0,
            deltaY: 0,
        };
    }

    stopCameraMoveAnimationLoop(){
        if(this.animationFrameId!=null){
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    setCameraFovY(newVal: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;
        const v = clamp({ value: newVal, min: this.cameraFovYMinValue, max: this.cameraFovYMaxValue });

        if (v !== camera.fovY) {
            camera.fovY = v;
            if(this.onCameraModified!=null) this.onCameraModified();
            this.renderScene!();
        }
    }

    addCameraFovY(delta: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;
        this.setCameraFovY(camera.fovY + delta);
    }


    setCameraNear(newVal: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        const near = clamp({ value: newVal, min: this.cameraNearMinValue, max: this.cameraNearMaxValue });
        const far = clamp({
            value: near >= camera.far ? near + 0.001 : camera.far,
            min: this.cameraFarMinValue,
            max: this.cameraFarMaxValue,
        });

        const changed = near !== camera.near || far !== camera.far;

        camera.near = near;
        camera.far = far;

        if (changed) {
            if(this.onCameraModified!=null) this.onCameraModified();
            this.renderScene!();
        }
    }

    addCameraNear(delta: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;        
        this.setCameraNear(camera.near + delta);
    }

    setCameraFar(newVal: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        const far = clamp({ value: newVal, min: this.cameraFarMinValue, max: this.cameraFarMaxValue });
        const near = clamp({
            value: far <= camera.near ? Math.max(this.cameraNearMinValue, far - 0.001) : camera.near,
            min: this.cameraNearMinValue,
            max: this.cameraNearMaxValue,
        });

        const changed = near !== camera.near || far !== camera.far;

        camera.near = near;
        camera.far = far;

        if (changed){
            if(this.onCameraModified!=null) this.onCameraModified();
            this.renderScene!();
        }
    }

    addCameraFar(delta: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;        
        this.setCameraFar(camera.far + delta);
    }

    setCameraDistance(value: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        const v = clamp({ value, min: this.cameraDistanceMinValue, max: this.cameraDistanceMaxValue });

        if (v !== camera.distance) {
            camera.distance = v;
            if(this.onCameraModified!=null) this.onCameraModified();
            this.renderScene!();
        }
    }

    addCameraDistance(delta: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;        
        this.setCameraDistance(camera.distance + delta);
    }

    setCameraDistanceByWheel(mouseDeltaY: number){
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        const value =  Math.max(0.1, camera.distance + mouseDeltaY * this.mouseWheelSensitivity);
        const v = clamp({ value, min: this.cameraDistanceMinValue, max: this.cameraDistanceMaxValue });

        if (v !== camera.distance) {
            camera.distance = v;
            if(this.onCameraModified!=null) this.onCameraModified();
            this.renderScene!();
        }
    }

    setCameraProjectionType(value: ProjectionType){
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        if(value!==camera.projectionType){
            camera.projectionType = value;
            if(this.onCameraModified!=null) this.onCameraModified();
            this.renderScene!();
        }
    }

    setCameraPitch(value: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        const v = clamp({ value, min: this.cameraPitchMinValue, max: this.cameraPitchMaxValue });

        if (v !== camera.pitch) {
            camera.pitch = v;
            if(this.onCameraModified!=null) this.onCameraModified();
            this.renderScene!();
        }
    }

    addCameraPitch(delta: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        this.setCameraPitch(camera.pitch + delta);
    }

    setCameraYaw(value: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        const v = mod(value, 360);

        if (v !== camera.yaw) {
            camera.yaw = v;
            if(this.onCameraModified!=null) this.onCameraModified();
            this.renderScene!();
        }
    }

    addCameraYaw(delta: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        this.setCameraYaw(camera.yaw + delta);
    }

    setCameraTarget(x: number, y: number, z: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        if (camera.target.x !== x || camera.target.y !== y || camera.target.z !== z) {
            camera.target = new Vector3(x, y, z);
            if(this.onCameraModified!=null) this.onCameraModified();
            this.renderScene!();
        }
    }

    setCameraTargetX(x: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        const t = camera.target;
        this.setCameraTarget(x, t.y, t.z);
    }

    setCameraTargetY(y: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        const t = camera.target;
        this.setCameraTarget(t.x, y, t.z);
    }

    setCameraTargetZ(z: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        const t = camera.target;
        this.setCameraTarget(t.x, t.y, z);
    }

    addCameraTargetX(delta: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        this.setCameraTargetX(camera.target.x + delta);
    }

    addCameraTargetY(delta: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        this.setCameraTargetY(camera.target.y + delta);
    }

    addCameraTargetZ(delta: number) {
        if(!this.initialized) return;
        const scene = this.scene!;
        const camera = scene.getActiveCamera();
        if(!camera) return;

        this.setCameraTargetZ(camera.target.z + delta);
    }

    getCameraTarget(): Vector3 | null{
        if(!this.initialized || !this.scene) return null;
        const camera = this.scene.getActiveCamera(); 
        if(!camera) return null;
        return camera.target;
    }

    getCameraProjectionType(): ProjectionType | null{
        if(!this.initialized || !this.scene) return null;
        const camera = this.scene.getActiveCamera(); 
        if(!camera) return null;
        return camera.projectionType;
    }    

    getCameraFovY(): number | null{
        if(!this.initialized || !this.scene) return null;
        const camera = this.scene.getActiveCamera(); 
        if(!camera) return null;
        return camera.fovY;
    }        

    getCameraNear(): number | null{
        if(!this.initialized || !this.scene) return null;
        const camera = this.scene.getActiveCamera(); 
        if(!camera) return null;
        return camera.near;
    }   
    
    getCameraFar(): number | null{
        if(!this.initialized || !this.scene) return null;
        const camera = this.scene.getActiveCamera(); 
        if(!camera) return null;
        return camera.far;
    }    

    getCameraDistance(): number | null{
        if(!this.initialized || !this.scene) return null;
        const camera = this.scene.getActiveCamera(); 
        if(!camera) return null;
        return camera.distance;
    }   

    getCameraPitch(): number | null{
        if(!this.initialized || !this.scene) return null;
        const camera = this.scene.getActiveCamera(); 
        if(!camera) return null;
        return camera.pitch;
    }   
    
    getCameraYaw(): number | null{
        if(!this.initialized || !this.scene) return null;
        const camera = this.scene.getActiveCamera(); 
        if(!camera) return null;
        return camera.yaw;
    }       
    //Select and Edit component

    boxSelectSession: BoxSelectSession = {
        startCoords: null,
        endCoords: null,
    }

    marqueeSelectSession: MarqueeSelectSession = {
        startCoords: null,
        endCoords: null,
    }

    hasBoxSelectSessionStarted(){
        return this.boxSelectSession.startCoords!=null;
    }

    hasMarqueeSelectSessionStarted(){
        return this.marqueeSelectSession.startCoords!=null
    }

    resetSelectSession(){
        if(!this.initialized) return;
        const selectedObject = this.scene!.getActiveVoxelObject();
        if(!selectedObject) return;

        const selectAreaModified = selectedObject.resetSelect();
        this.boxSelectSession = {
            startCoords: null,
            endCoords: null,
        }
        this.marqueeSelectSession = {
            startCoords: null,
            endCoords: null,            
        }
        if(selectAreaModified){
            this.renderScene!();
        }
    }

    handleCanvasPointerDown(pointerPos: Vector2, canvasSize: Vector2){
        if(!this.initialized) return;
        const scene = this.scene!;
        const voxelObject = scene.getActiveVoxelObject();
        const camera = scene.getActiveCamera();
        if(!voxelObject || !camera) return;        

        const lastEmpty = this.editMode === "Add";
        const hitOnExit = true;
        const mvp = camera.getProjectionMatrix(canvasSize).multMatrix(Matrices4.transform(voxelObject.getObjectRo().worldTransform!)).multMatrix(camera.getCameraView());
        const rayCastResults = getVoxelFromObject(camera, pointerPos, voxelObject, canvasSize, Matrices4.transform(voxelObject.getObjectRo().worldTransform!), camera.getProjectionMatrix(canvasSize), camera.getCameraView(), lastEmpty , hitOnExit);
        if(!rayCastResults) return;
        const hitVoxel : Vector3 = rayCastResults.voxelCoords;

        let voxelObjectChanged = false;
        let selectedAreaChanged = false;
        if(this.selectMode =="Voxel" || this.selectMode=="Face" || this.selectMode=="Connected" || this.selectMode=="Color"){
                if(this.editMode=="Add"){
                    voxelObjectChanged = voxelObject.addSelectedVoxels(this.currentColor)!=0;
                    selectedAreaChanged = voxelObject.resetSelect()!=0;
                }else if(this.editMode=="Paint"){
                    voxelObjectChanged = voxelObject.paintSelectedVoxels(this.currentColor)!=0;
                    selectedAreaChanged = voxelObject.resetSelect()!=0;
                }else if(this.editMode=="Remove"){
                    voxelObjectChanged = voxelObject.removeSelectedVoxels()!=0;
                    selectedAreaChanged = voxelObject.resetSelect()!=0;
                }
        }else if(this.selectMode=="Cube"){
            this.boxSelectSession.startCoords = hitVoxel;  
                selectedAreaChanged = voxelObject.selectVoxel(hitVoxel);
        }else if(this.selectMode=="Marquee"){
            this.marqueeSelectSession.startCoords = pointerPos;
            
            selectedAreaChanged = voxelObject.selectVoxelArray(marqueeSelectRectangle(
                pointerPos,pointerPos,voxelObject,canvasSize,mvp
            ));
        }

        if(voxelObjectChanged || selectedAreaChanged){
            this.renderScene!();
        }
    }

    handleCanvasPointerMove(pointerPos: Vector2, canvasSize: Vector2){
        if(!this.initialized) return;
        const scene = this.scene!;
        const voxelObject = scene.getActiveVoxelObject();
        const camera = scene.getActiveCamera();
        if(!voxelObject || !camera) return;

        const lastEmpty = this.editMode === "Add";
        const hitOnExit = true;   
        
        const rayCastResults = getVoxelFromObject(
            camera, 
            pointerPos, 
            voxelObject, canvasSize, 
            Matrices4.transform(voxelObject.getObjectRo().worldTransform!), 
            camera.getProjectionMatrix(canvasSize), 
            camera.getCameraView(), 
            lastEmpty , 
            hitOnExit);
        if(!rayCastResults){
            this.resetSelectSession();
            return;
        }

        const hitVoxel : Vector3 = rayCastResults.voxelCoords;
        const hitDirection: Vector3 = faceDirectionToVector(rayCastResults.hitDirection);
        //console.log(`[controller -> handleCanvasPointerMove] voxelObjectTransform[${voxelObject.getObjectRo().worldTransform!.translation}]`)
        const mvp = camera.getProjectionMatrix(canvasSize).multMatrix(Matrices4.transform(voxelObject.getObjectRo().worldTransform!)).multMatrix(camera.getCameraView());

        let selectedAreaChanged = false;
        let voxelObjectChanged = false;
        if(this.hasMarqueeSelectSessionStarted()){
            if(this.editMode=="Remove"){
                
                selectedAreaChanged = voxelObject.selectVoxelArray(marqueeSelectRectangle(
                    this.marqueeSelectSession.startCoords!,pointerPos,voxelObject,canvasSize,mvp
                ));
                //voxelObjectChanged = voxelObject.removeSelectedVoxels() != 0;
            }else if(this.editMode=="Paint"){
                                
                selectedAreaChanged = voxelObject.selectVoxelArray(marqueeSelectRectangle(
                    this.marqueeSelectSession.startCoords!,pointerPos,voxelObject,canvasSize,mvp
                ));
            }
        }
        else if(this.hasBoxSelectSessionStarted()){            
            if(this.editMode == "Add"){
                if(this.selectMode=="Voxel"){
                    voxelObject.selectVoxel(hitVoxel);
                    voxelObjectChanged = voxelObject.addSelectedVoxels(this.currentColor) != 0;
                }else if(this.selectMode=="Cube"){
                    selectedAreaChanged = voxelObject.selectCube(this.boxSelectSession.startCoords!, hitVoxel);
                }
            }else if(this.editMode=="Remove"){
                if(this.selectMode=="Voxel"){
                    voxelObject.selectVoxel(hitVoxel);
                    voxelObjectChanged = voxelObject.removeSelectedVoxels() != 0;
                }else if(this.selectMode=="Cube"){
                    selectedAreaChanged = voxelObject.selectCube(this.boxSelectSession.startCoords!, hitVoxel);
                }
            }else if(this.editMode=="Paint"){
                if(this.selectMode=="Voxel"){
                    voxelObject.selectVoxel(hitVoxel);
                    voxelObjectChanged = voxelObject.paintSelectedVoxels(this.currentColor) != 0;
                }else if(this.selectMode=="Cube"){
                    selectedAreaChanged = voxelObject.selectCube(this.boxSelectSession.startCoords!, hitVoxel);
                }
            }
        }else{
            if(this.editMode == "Add"){
                if(this.selectMode=="Voxel" || this.selectMode=="Cube"){
                    selectedAreaChanged = voxelObject.selectVoxel(hitVoxel);
                }else if(this.selectMode=="Face"){
                    selectedAreaChanged = voxelObject.selectFace(hitVoxel , vectorToFaceDirection(hitDirection), true);
                }
            }else if(this.editMode=="Remove" || this.editMode=="Paint"){
                if(this.selectMode=="Voxel" || this.selectMode=="Cube"){
                    selectedAreaChanged = voxelObject.selectVoxel(hitVoxel);
                }else if(this.selectMode=="Face"){
                    selectedAreaChanged = voxelObject.selectFace(hitVoxel , vectorToFaceDirection(hitDirection));
                }else if(this.selectMode=="Color"){
                    selectedAreaChanged = voxelObject.selectByColor(hitVoxel);
                }else if(this.selectMode=="Connected"){
                    selectedAreaChanged = voxelObject.selectConnected(hitVoxel);   
                }
            }else{
                //higlightCausedChange = props.selectedObject.highlightVoxel(hitVoxel);
            }
        }

        if(selectedAreaChanged || voxelObjectChanged) {
            this.renderScene!();
        }
    }

    handleCanvasPointerUp(pointerPos: Vector2, canvasSize: Vector2){
        if(!this.initialized) return;
        const scene = this.scene!;
        const voxelObject = scene.getActiveVoxelObject();
        const camera = scene.getActiveCamera();
        if(!voxelObject || !camera) return;

        if(this.hasCameraMoveSessionStarted()){
            this.resetSelectSession();
        }       

        const lastEmpty = this.editMode === "Add";
        const hitOnExit = true;   
        const rayCastResults = getVoxelFromObject(camera, pointerPos, voxelObject, canvasSize, Matrices4.transform(voxelObject.getObjectRo().worldTransform!), camera.getProjectionMatrix(canvasSize), camera.getCameraView(), lastEmpty , hitOnExit);
        if(!rayCastResults) return;

        const hitVoxel : Vector3 = rayCastResults.voxelCoords;

        if(this.hasBoxSelectSessionStarted()){
            this.boxSelectSession.endCoords = hitVoxel;
            if(this.selectMode=="Cube"){
                if(this.editMode=="Add"){
                    voxelObject.addSelectedVoxels(this.currentColor);
                }else if(this.editMode=="Paint"){
                    voxelObject.paintSelectedVoxels(this.currentColor);
                }else if(this.editMode=="Remove"){
                    console.log("Removing " + voxelObject.selectedVoxels.size + " voxels")
                    voxelObject.removeSelectedVoxels();
                }
            }
            this.resetSelectSession();
        }
        if(this.hasMarqueeSelectSessionStarted()){
                if(this.editMode=="Paint"){
                    voxelObject.paintSelectedVoxels(this.currentColor);
                }else if(this.editMode=="Remove"){
                    voxelObject.removeSelectedVoxels();
                }
            this.resetSelectSession();
        }
        
        voxelObject.resetSelect();
        this.handleCanvasPointerMove(pointerPos, canvasSize);
        this.renderScene!();        

    }

    //scene
    toggleSceneObjectGrid(){
        if(!this.initialized || !this.scene) return;
        this.scene.toggleSelectedObjectWireframe;
        this.renderScene!();
    }

    toggleSceneBorderGrid(){
        if(!this.initialized || !this.scene) return;
        this.scene.toggleSelectedObjectBorderGrid;
        this.renderScene!();
    }

    toggleSceneBorderWire(){
        if(!this.initialized || !this.scene) return;
        this.scene.toggleSelectedObjectBorderOutline;
        this.renderScene!();
    }

    setSceneActiveObject(sceneId: number){
        if(!this.initialized || !this.scene) return;
        const obj: SceneObject | undefined = this.scene.getObjectById(sceneId);
        if(obj){
            if(obj instanceof VoxelObject){
                this.scene.setActiveVoxelObjectId(sceneId);
            }else if(obj instanceof Camera){
                this.scene.setActiveCameraId(sceneId);
            }
        }        
    }

    setSceneActiveCamera(sceneId: number){
        if(!this.initialized || !this.scene) return;
        this.scene.setActiveCameraId(sceneId);
    }

    setSceneActiveVo(sceneId: number){
        if(!this.initialized || !this.scene) return;
        this.scene.setActiveVoxelObjectId(sceneId);
    }

    deleteSceneObject(sceneId: number){
        if(!this.initialized || !this.scene) return;
        this.scene.removeObject(sceneId);                
    }

    toggleSceneObjectEnabled(sceneId: number){
        if(!this.initialized || !this.scene) return;
        this.scene.toggleObjectEnabled(sceneId);              
    }

    //returns null if editor is uninitialized or if scene is null
    getSceneObjectsOfType<T extends SceneObject>(objType: abstract new (...args: any[]) => T): T[] | null{
        if(!this.initialized || !this.scene) {            
            return null;
        }
        return this.scene.getObjectsOfType(objType);
    }

    addNewVoxelObject(name: string = "VoxelObject", factoryFunction: ((name: string)=>VoxelObject) = getBasicSampleVoxelObject){
        if(!this.initialized || !this.scene) return;
        const vo = factoryFunction(name);
        this.scene.addObject(vo);
    }

    addNewCamera(name: string = "Camera", factoryFunction: ((name: string)=>Camera) = getSampleCamera){
        if(!this.initialized || !this.scene) return;
        const c = factoryFunction(name);
        this.scene.addObject(c);
        if(this.renderScene) this.renderScene(); //fixes things when only camera is added
    }

    //returns false if not initialized
    isCameraActiveById(sceneId: number): boolean{
        if(!this.initialized || !this.scene) return false;
        return this.scene.isCameraActiveById(sceneId);        
    }

    //returns false if not initialized
    isVoActiveById(sceneId: number): boolean{
        if(!this.initialized || !this.scene) return false;
        return this.scene.isVoxelObjectSelectedById(sceneId);        
    }    

    // if at any point change of scene will be possible this should be modified
    // so that it automatically subscribes to a new scene
    subscribeObjectEnabledChangeSceneEvent(listener: ()=>void){
        if(!this.initialized || !this.scene) return;
        this.scene.objectEnabledChangeEvent.subscribe(listener);
    }

    subscribeObjectListChangedSceneEvent(listener: ()=>void){
        if(!this.initialized || !this.scene) return;
        this.scene.objectListChangedEvent.subscribe(listener);
    }

    subscribeObjectAddedSceneEvent(listener: ()=>void){
        if(!this.initialized || !this.scene) return;
        this.scene.objectAddedEvent.subscribe(listener);
    }

    subscribeObjectRemovedSceneEvent(listener: ()=>void){
        if(!this.initialized || !this.scene) return;
        this.scene.objectRemovedEvent.subscribe(listener);
    }

    subscribeActiveVoChangedSceneEvent(listener: ()=>void){
        if(!this.initialized || !this.scene) return;
        this.scene.activeVoChanged.subscribe(listener);
    }

    subscribeActiveCameraChangedSceneEvent(listener: ()=>void){
        if(!this.initialized || !this.scene) return;
        this.scene.activeCameraChanged.subscribe(listener);
    }

    subscribeActiveVoSelectedAreaChangedSceneEvent(listener: ()=>void){
        if(!this.initialized || !this.scene) return;
        this.scene.activeVoSelectedAreaChangeEvent.subscribe(listener);        
    }

    subscribeActiveVoVoxelsChangedSceneEvent(listener: ()=>void){
        if(!this.initialized || !this.scene) return;
        this.scene.activeVoVoxelsChangeEvent.subscribe(listener);        
    }

    subscribeActiveVoTransformChangedSceneEvent(listener: ()=>void){
        if(!this.initialized || !this.scene) return;
        this.scene.activeVoTransformChangeEvent.subscribe(listener);        
    }

    subscribeActiveVoSizeChangedSceneEvent(listener: ()=>void){
        if(!this.initialized || !this.scene) return;
        this.scene.activeVoSizeChangeEvent.subscribe(listener);        
    }

    //color

    //current color should in most cases have alpha of 255
    currentColor: Vector4 = new Vector4(0,0,0,255);
    
    setCurrentColor(c: Vector3){
        if(!this.initialized) return;
        const scene = this.scene!;
        const voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;

        this.currentColor = new Vector4(c.x, c.y, c.z, 255);
        voxelObject.setSelectedVoxelsColor(c);
    }

    getCurrentColor(): Vector4{
        return this.currentColor;
    }

    //voxel object advanced modifiers
    changeVoxelObjectSizeTo(newSize: Vector3){
        if(!this.initialized) return;
        const scene = this.scene!;
        const voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;

        const currentSize: Vector3 = voxelObject.size;
        voxelObject.resize(newSize);
        if(currentSize != voxelObject.size){
            this.renderScene!();
        }
    }

    changeVoxelObjectSizeByScalar(mult: number){
        if(!this.initialized) return;
        const scene = this.scene!;
        const voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;

        const currentSize: Vector3 = voxelObject.size;
        voxelObject.resize(currentSize.multByScalar(mult));
        if(currentSize != voxelObject.size){
            this.renderScene!();
        }
    }

    doubleVoxelObjectSize(){
        if(!this.initialized) return;
        this.changeVoxelObjectSizeByScalar(2);
    }

    halfVoxelObjectSize(){
        if(!this.initialized) return;
        this.changeVoxelObjectSizeByScalar(1/2);
    }

    fillVoxelObjectVoxels(){
        if(!this.initialized) return;
        const scene = this.scene!;
        const voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;

        const objectModified: boolean = voxelObject.selectEmptyVoxels() > 0;
        voxelObject.addSelectedVoxels(this.currentColor);
        voxelObject.resetSelect();
        if(objectModified){
            this.renderScene!();
        }
    }

    emptyVoxelObjectVoxels(){
        if(!this.initialized) return;
        const scene = this.scene!;
        const voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;

        const objectModified: boolean = voxelObject.selectNonEmptyVoxels() > 0;
        voxelObject.removeSelectedVoxels();
        voxelObject.resetSelect();
        if(objectModified){
            this.renderScene!();
        }
    }

    reverseVoxelObjectVoxels(){
        if(!this.initialized) return;
        const scene = this.scene!;
        const voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;

        voxelObject.selectAllVoxels();
        voxelObject.reverseSelectedVoxels(this.currentColor);
        voxelObject.resetSelect();
        this.renderScene!();
    }

    regenerateVoxelObjectToCube(){
        if(!this.initialized) return;
        this.fillVoxelObjectVoxels()
    }

    regenerateVoxelObjectToSphere(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;

        voxelObject.setVoxels(generateSphereVoxelArray(voxelObject.size, this.currentColor))
        this.renderScene!();
    }

    regenerateVoxelObjectToPyramid(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;

        voxelObject.setVoxels(generatePyramidVoxelArray(voxelObject.size, this.currentColor))
        this.renderScene!();
    }

    regenerateVoxelObjectToCylinder(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;

        voxelObject.setVoxels(generateCylinderVoxelArray(voxelObject.size, this.currentColor));
        this.renderScene!();
    }

    flipVoxelObjectByX(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;

        voxelObject.selectAllVoxels();
        voxelObject.flipSelectedVoxelsByX();
        voxelObject.resetSelect();
        this.renderScene!();
    }

    flipVoxelObjectByY(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;
        
        voxelObject.selectAllVoxels();
        voxelObject.flipSelectedVoxelsByY();
        voxelObject.resetSelect();
        this.renderScene!();
    }

    flipVoxelObjectByZ(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;

        voxelObject.selectAllVoxels();
        voxelObject.flipSelectedVoxelsByZ();
        voxelObject.resetSelect();
        this.renderScene!();
    }

    rotateVoxelObjectByX(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;

        voxelObject.selectAllVoxels();
        voxelObject.rotateSelectedVoxelsByX();
        voxelObject.resetSelect();
        this.renderScene!();
    }

    rotateVoxelObjectByY(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;

        voxelObject.selectAllVoxels();
        voxelObject.rotateSelectedVoxelsByY();
        voxelObject.resetSelect();
        this.renderScene!();
    }

    rotateVoxelObjectByZ(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;

        voxelObject.selectAllVoxels();
        voxelObject.rotateSelectedVoxelsByZ();
        voxelObject.resetSelect();
        this.renderScene!();
    }

    getVoxelObjectSelectedVoxelsCount(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getActiveVoxelObject();
        if(!voxelObject) return;

        return voxelObject.selectedVoxels.size;
    }




    // Select and edit modes
    
    getEditMode(): EditMode{
        return this.editMode;
    }

    setEditMode(editMode: EditMode){
        this.editMode = editMode;
    }

    getSelectMode(): SelectMode{
        return this.selectMode;
    }

    setSelectMode(selectMode: SelectMode){
        this.selectMode = selectMode;
    }    
}