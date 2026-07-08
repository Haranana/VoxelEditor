import type { RefObject } from "react";
import type {ProjectionType } from "./classes/camera";
import type { RenderSceneOptions, Scene } from "./classes/scene";
import { faceDirectionToVector, vectorToFaceDirection } from "./classes/voxelObject";
import type { EditMode, SelectMode } from "./EditorPage";
import { clamp, mod } from "./math/utils";
import type { Vector2 } from "./math/vector2.type"
import { Vector3 } from "./math/vector3.type"
import { Vector4 } from "./math/vector4.type";
import { generateVoxelObjectCylinder, generateVoxelObjectPyramid, generateVoxelObjectSphere } from "./VoxelObjectGenerator";
import { getVoxelFromObject } from "./classes/rayCaster";
import { Matrices4 } from "./math/matrices";

type SelectSession = {
    startCoords: Vector3 | null,
    endCoords: Vector3 | null,
}

type CameraMoveSession = {
    lastX: number | null,
    lastY: number | null,
    deltaX: number,
    deltaY: number,
}

export class EditorController{
    selectModeRef: RefObject<SelectMode> | null = null;
    //selectMode: SelectMode | null = null;
    editModeRef: RefObject<EditMode> | null = null;
    scene: Scene | null = null;
    renderScene: (()=>void) | null = null;
    initialized: boolean = false;

    constructor(){}

    init(selectMode: RefObject<SelectMode>, editMode: RefObject<EditMode>, scene: Scene, renderScene: ()=>void){
        this.renderScene = renderScene;
        this.startCameraMoveAnimationLoop();
        this.selectModeRef = selectMode;
        this.selectModeRef = selectMode
        this.editModeRef = editMode;
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

    onCameraModified : (()=>void) | null = null;

    startCameraMoveAnimationLoop(){
        const cameraMoveAnimationLoop = (time: number) => {            
            if(!this.initialized) return;
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
                    
            this.animationFrameId = requestAnimationFrame(cameraMoveAnimationLoop);
        };
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

    //Select and Edit component

    selectSession: SelectSession = {
        startCoords: null,
        endCoords: null,
    }

    hasSelectSessionStarted(){
        return this.selectSession.startCoords!=null;
    }

    resetSelectSession(){
        if(!this.initialized) return;
        const selectedObject = this.scene!.getSelectedVoxelObject();
        if(!selectedObject) return;

        const selectAreaModified = selectedObject.resetSelect();
        this.selectSession = {
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
        const voxelObject = scene.getSelectedVoxelObject();
        const camera = scene.getActiveCamera();
        if(!voxelObject || !camera) return;

        const editMode = this.editModeRef!.current;
        const selectMode = this.selectModeRef!.current;

        const lastEmpty = editMode === "Add";
        const hitOnExit = true;
        const rayCastResults = getVoxelFromObject(camera, pointerPos, voxelObject, canvasSize, Matrices4.transform(voxelObject.getRenderableObject().transform), camera.getProjectionMatrix(canvasSize), camera.getCameraView(), lastEmpty , hitOnExit);
        if(!rayCastResults) return;
        const hitVoxel : Vector3 = rayCastResults.voxelCoords;

        let voxelObjectChanged = false;
        let selectedAreaChanged = false;
        if(selectMode=="Voxel" || selectMode=="Face"){
                if(editMode=="Add"){
                    voxelObjectChanged = voxelObject.addSelectedVoxels(this.currentColor)!=0;
                    selectedAreaChanged = voxelObject.resetSelect()!=0;
                }else if(editMode=="Paint"){
                    voxelObjectChanged = voxelObject.paintSelectedVoxels(this.currentColor)!=0;
                    selectedAreaChanged = voxelObject.resetSelect()!=0;
                }else if(editMode=="Remove"){
                    voxelObjectChanged = voxelObject.removeSelectedVoxels()!=0;
                    selectedAreaChanged = voxelObject.resetSelect()!=0;
                }
        }else if(selectMode=="Cube"){
            this.selectSession.startCoords = hitVoxel;  
                selectedAreaChanged = voxelObject.selectVoxel(hitVoxel);
        }

        if(voxelObjectChanged || selectedAreaChanged){
            this.renderScene!();
        }
    }

    handleCanvasPointerMove(pointerPos: Vector2, canvasSize: Vector2){
        if(!this.initialized) return;
        const scene = this.scene!;
        const voxelObject = scene.getSelectedVoxelObject();
        const camera = scene.getActiveCamera();
        if(!voxelObject || !camera) return;

        const editMode = this.editModeRef!.current;
        const selectMode = this.selectModeRef!.current;

        const lastEmpty = editMode === "Add";
        const hitOnExit = true;   
        const rayCastResults = getVoxelFromObject(camera, pointerPos, voxelObject, canvasSize, Matrices4.transform(voxelObject.getRenderableObject().transform), camera.getProjectionMatrix(canvasSize), camera.getCameraView(), lastEmpty , hitOnExit);
        if(!rayCastResults){
            this.resetSelectSession();
            return;
        }

        const hitVoxel : Vector3 = rayCastResults.voxelCoords;
        const hitDirection: Vector3 = faceDirectionToVector(rayCastResults.hitDirection);

        let selectedAreaChanged = false;
        let voxelObjectChanged = false;

        if(this.hasSelectSessionStarted()){
            //console.log("[controller] session in move")
            if(editMode == "Add"){
                if(selectMode=="Voxel"){
                    voxelObject.selectVoxel(hitVoxel);
                    voxelObjectChanged = voxelObject.addSelectedVoxels(this.currentColor) != 0;
                }else if(selectMode=="Cube"){
                    selectedAreaChanged = voxelObject.selectCube(this.selectSession.startCoords!, hitVoxel);
                }
            }else if(editMode=="Remove"){
                if(selectMode=="Voxel"){
                    voxelObject.selectVoxel(hitVoxel);
                    voxelObjectChanged = voxelObject.removeSelectedVoxels() != 0;
                }else if(selectMode=="Cube"){
                    selectedAreaChanged = voxelObject.selectCube(this.selectSession.startCoords!, hitVoxel);
                }
            }else if(editMode=="Paint"){
                if(selectMode=="Voxel"){
                    voxelObject.selectVoxel(hitVoxel);
                    voxelObjectChanged = voxelObject.paintSelectedVoxels(this.currentColor) != 0;
                }else if(selectMode=="Cube"){
                    selectedAreaChanged = voxelObject.selectCube(this.selectSession.startCoords!, hitVoxel);
                }
            }
        }else{
            if(editMode == "Add"){
                if(selectMode=="Voxel" || selectMode=="Cube"){
                    selectedAreaChanged = voxelObject.selectVoxel(hitVoxel);
                }else if(selectMode=="Face"){
                    selectedAreaChanged = voxelObject.selectFace(hitVoxel , vectorToFaceDirection(hitDirection), true);
                }
            }else if(editMode=="Remove" || editMode=="Paint"){
                if(selectMode=="Voxel" || selectMode=="Cube"){
                    selectedAreaChanged = voxelObject.selectVoxel(hitVoxel);
                }else if(selectMode=="Face"){
                    selectedAreaChanged = voxelObject.selectFace(hitVoxel , vectorToFaceDirection(hitDirection));
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
        const voxelObject = scene.getSelectedVoxelObject();
        const camera = scene.getActiveCamera();
        if(!voxelObject || !camera) return;

        //console.log(this.editMode + " : " + this.selectMode);
        if(this.hasCameraMoveSessionStarted()){
            this.resetSelectSession();
        }

        const editMode = this.editModeRef!.current;
        const selectMode = this.selectModeRef!.current;

        const lastEmpty = this.editModeRef!.current === "Add";
        const hitOnExit = true;   
        const rayCastResults = getVoxelFromObject(camera, pointerPos, voxelObject, canvasSize, Matrices4.transform(voxelObject.getRenderableObject().transform), camera.getProjectionMatrix(canvasSize), camera.getCameraView(), lastEmpty , hitOnExit);
        if(!rayCastResults) return;

        const hitVoxel : Vector3 = rayCastResults.voxelCoords;

        if(this.hasSelectSessionStarted()){
            this.selectSession.endCoords = hitVoxel;
            if(selectMode=="Cube"){
                if(editMode=="Add"){
                    voxelObject.addSelectedVoxels(this.currentColor);
                }else if(editMode=="Paint"){
                    voxelObject.paintSelectedVoxels(this.currentColor);
                }else if(editMode=="Remove"){
                    voxelObject.removeSelectedVoxels();
                }
            }
            this.resetSelectSession();
        }

        voxelObject.resetSelect();
        this.renderScene!();        
    }

    //scene
    toggleSceneObjectGrid(options: RenderSceneOptions){
        if(!this.initialized) return;
        options.voxelObjectsGrid = !options.voxelObjectsGrid;
        this.renderScene!();
    }

    toggleSceneBorderGrid(options: RenderSceneOptions){
        if(!this.initialized) return;
        options.borderGrid = !options.borderGrid;
        this.renderScene!();
    }

    toggleSceneBorderWire(options: RenderSceneOptions){
        if(!this.initialized) return;
        options.borderWire = !options.borderWire;
        this.renderScene!();
    }

    //color

    //current color should in most cases have alpha of 255
    currentColor: Vector4 = new Vector4(0,0,0,255);
    
    setCurrentColor(c: Vector3){
        if(!this.initialized) return;
        const scene = this.scene!;
        const voxelObject = scene.getSelectedVoxelObject();
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
        const voxelObject = scene.getSelectedVoxelObject();
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
        const voxelObject = scene.getSelectedVoxelObject();
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
        const voxelObject = scene.getSelectedVoxelObject();
        if(!voxelObject) return;

        const objectModified: boolean = voxelObject.selectEmptyVoxels() > 0;
        voxelObject.addSelectedVoxels(this.currentColor);
        voxelObject.resetSelect();
        if(objectModified){
            console.log("AAAAAAAAAAA");
            this.renderScene!();
        }
    }

    emptyVoxelObjectVoxels(){
        if(!this.initialized) return;
        const scene = this.scene!;
        const voxelObject = scene.getSelectedVoxelObject();
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
        const voxelObject = scene.getSelectedVoxelObject();
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
        let voxelObject = scene.getSelectedVoxelObject();
        if(!voxelObject) return;

        voxelObject = generateVoxelObjectSphere(voxelObject.id, voxelObject.size, this.currentColor);
        this.renderScene!();
    }

    regenerateVoxelObjectToPyramid(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getSelectedVoxelObject();
        if(!voxelObject) return;

        voxelObject = generateVoxelObjectPyramid(voxelObject.id, voxelObject.size, this.currentColor);
        this.renderScene!();
    }

    regenerateVoxelObjectToCylinder(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getSelectedVoxelObject();
        if(!voxelObject) return;

        voxelObject = generateVoxelObjectCylinder(voxelObject.id, voxelObject.size, this.currentColor);
        this.renderScene!();
    }

    flipVoxelObjectByX(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getSelectedVoxelObject();
        if(!voxelObject) return;

        voxelObject.selectAllVoxels();
        voxelObject.flipSelectedVoxelsByX();
        voxelObject.resetSelect();
        this.renderScene!();
    }

    flipVoxelObjectByY(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getSelectedVoxelObject();
        if(!voxelObject) return;
        
        voxelObject.selectAllVoxels();
        voxelObject.flipSelectedVoxelsByY();
        voxelObject.resetSelect();
        this.renderScene!();
    }

    flipVoxelObjectByZ(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getSelectedVoxelObject();
        if(!voxelObject) return;

        voxelObject.selectAllVoxels();
        voxelObject.flipSelectedVoxelsByZ();
        voxelObject.resetSelect();
        this.renderScene!();
    }

    rotateVoxelObjectByX(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getSelectedVoxelObject();
        if(!voxelObject) return;

        voxelObject.selectAllVoxels();
        voxelObject.rotateSelectedVoxelsByX();
        voxelObject.resetSelect();
        this.renderScene!();
    }

    rotateVoxelObjectByY(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getSelectedVoxelObject();
        if(!voxelObject) return;

        voxelObject.selectAllVoxels();
        voxelObject.rotateSelectedVoxelsByY();
        voxelObject.resetSelect();
        this.renderScene!();
    }

    rotateVoxelObjectByZ(){
        if(!this.initialized) return;
        const scene = this.scene!;
        let voxelObject = scene.getSelectedVoxelObject();
        if(!voxelObject) return;

        voxelObject.selectAllVoxels();
        voxelObject.rotateSelectedVoxelsByZ();
        voxelObject.resetSelect();
        this.renderScene!();
    }
    
}