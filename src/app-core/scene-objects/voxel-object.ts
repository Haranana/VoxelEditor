import { clamp, gridPosToOffset } from "../../math/utils";
import { Vector3 } from "../../math/vector/vector3";
import { Vector4 } from "../../math/vector/vector4";
import type { ChunkableVoxelFormat} from "../../voxel-engine/voxel-formats/voxel-format";
import { VoxelGridFormat } from "../../voxel-engine/voxel-formats/voxel-grid-format";
import type { FaceDirection } from "../../voxel-engine/voxel-ray-caster";
import type { Voxel } from "../../voxel-engine/voxel-types/voxel";
import { AppCoreEvent } from "../events/event";
import { SceneObject, type WorldObjectTransform } from "./sceneObject";
import { VoxelObjectRenderablesManager } from "./voxel-object-renderables-manager";
import { VoxelObjectGhostVoxels } from "./voxel/voxel-object-ghost-voxels";
import { VoxelObjectSelectedArea } from "./voxel/voxel-object-selected-area";


export type SelectedAreaType = "static" | "dynamic";

// (0,0,0) of model space should be middle of the object
export class VoxelObject extends SceneObject{

    #voxelFormat: ChunkableVoxelFormat<Voxel> = new VoxelGridFormat();
   

    //dictates hard borders of voxel object
    static readonly maxGridSize: Vector3 = new Vector3(256,256,256);
    static readonly minGridSize: Vector3 = new Vector3(2,2,2);
    static readonly #defaultGridSize: Vector3 = new Vector3(32,32,32);
    #gridSize: Vector3 = VoxelObject.#defaultGridSize.copy();
    
    static readonly maxVoxelSize: Vector3 = new Vector3(100,100,100);
    static readonly minVoxelSize: Vector3 = new Vector3(1,1,1);
    static readonly #defaultVoxelSize: Vector3 = new Vector3(40,40,40);
    #voxelSize: Vector3 = VoxelObject.#defaultVoxelSize;

    static readonly #defaultBorderColor = new Vector4(255,255,255,255);
    #borderColor = VoxelObject.#defaultBorderColor.copy();

    static readonly #defaultObjectGridColor = new Vector4(100,100,100,255);
    #objectGridColor = VoxelObject.#defaultObjectGridColor;

    #ghostVoxels: VoxelObjectGhostVoxels = new VoxelObjectGhostVoxels(this.#gridSize); 
    transform: WorldObjectTransform = {
        translation: new Vector3(0,0,0),
        scale: new Vector3(1,1,1),
        rotation: new Vector3(0,0,0),
    }    

    readonly selectedAreas: Map<SelectedAreaType, VoxelObjectSelectedArea> = new Map([
        ['static', new VoxelObjectSelectedArea(this.#gridSize)],
        ['dynamic', new VoxelObjectSelectedArea(this.#gridSize)],
    ]);

    renderablesManager = new VoxelObjectRenderablesManager(this);
    voxelUnitSize = 50;

    selectedAreaChangeEvent: AppCoreEvent<void> = new AppCoreEvent();
    voxelsChangeEvent: AppCoreEvent<void> = new AppCoreEvent();
    transformChangeEvent: AppCoreEvent<void> = new AppCoreEvent();
    sizeChangeEvent: AppCoreEvent<void> = new AppCoreEvent();

    #notifyOfSelectedAreaChange(){        
        this.selectedAreaChangeEvent.emit();
    }
    #onSelectedAreaChange(areaType: SelectedAreaType){
        if(areaType==='dynamic'){
            this.renderablesManager.clearDynamicSelectedAreaMesh();
        }else if(areaType==='static'){
            this.renderablesManager.clearStaticSelectedAreaMesh();
        }
        
        
    }
    
    #notifyOfVoxelsChange(){ 
        this.voxelsChangeEvent.emit();
    }
    #onVoxelsChange(chunkPos: Vector3){
        const chunkOffset = gridPosToOffset(chunkPos, this.getChunksAmount());
        this.renderablesManager.clearChunkMesh(chunkOffset);
        this.renderablesManager.clearObjectGridMesh();
        //this.#notifyOfVoxelsChange();
    }

    //verify if setting flag to dirty is enough to update transform
    #notifyOfTransformChange(){
        this.transformChangeEvent.emit();
    }
    #onTransformChange(){
        this.#notifyOfTransformChange();
    }
    
    //resizing not currently supported!
    #notifyOfSizeChange(){        
        this.sizeChangeEvent.emit();
    }
    #onSizeChange(){
        this.renderablesManager.clearBorderGridMesh();
        this.renderablesManager.clearBorderOutlineMesh();
        this.#notifyOfSizeChange();
    }

    loadGrid(voxelGridFormat: VoxelGridFormat){
        this.#voxelFormat = voxelGridFormat;
        const chunksAmount = this.getChunksAmount();
        for(let x=0; x<chunksAmount.x; x++ ){
            for(let y=0; y<chunksAmount.y; y++ ){
                    for(let z=0; z<chunksAmount.z; z++ ){
                        const chunkPos = new Vector3(x,y,z);
                        this.#onVoxelsChange(chunkPos);
                    }
            }
        }
        
        this.#notifyOfVoxelsChange();
    }

    voxelExists(gridPos: Vector3): boolean{
        return (gridPos.x >= 0 && gridPos.x < this.#gridSize.x &&
            gridPos.y >= 0 && gridPos.y < this.#gridSize.y &&
            gridPos.z >= 0 && gridPos.z <this.#gridSize.z);
    }

    //returns true if voxel of given coords exists and is non-null
    //returns false either if it's null or doesn't exist
    isVoxelNonEmpty(gridPos: Vector3){
        return this.getVoxel(gridPos)? true : false;
    }

    //returns true if voxel of given coords exists and is null
    //returns false either if it's not a null or doesn't exist
    isVoxelEmpty(gridPos: Vector3){
        if(!this.voxelExists(gridPos)) return false;
        const voxel = this.getVoxel(gridPos);
        return voxel===null? true : false;
    }

    //spaces conversions
    modelToGridPos(modelPos: Vector3): Vector3{
        return new Vector3(
            Math.floor(modelPos.x / this.#voxelSize.x) + Math.floor(this.#gridSize.x / 2),
            Math.floor(modelPos.y / this.#voxelSize.y) + Math.floor(this.#gridSize.y / 2),
            Math.floor(modelPos.z / this.#voxelSize.z) + Math.floor(this.#gridSize.z / 2));
    }

    gridPosToChunkPos(gridPos: Vector3): Vector3{
        const chunkSize = this.#voxelFormat.getChunkSize();
        return new Vector3(
            Math.floor(gridPos.x / chunkSize.x),
            Math.floor(gridPos.y / chunkSize.y),
            Math.floor(gridPos.z / chunkSize.z)
        )
    }

    // Returns middle of voxel of given id 
    // Function doesn't check whether voxel of given id actually exists in this voxel object
    GridPosToModel(v: Vector3): Vector3{
        const objectStart : Vector3 = new Vector3(-this.#gridSize.x/2 , -this.#gridSize.y/2, -this.#gridSize.z/2) 
        const voxelSize = this.getVoxelSize();
        const voxelStartPosition = new Vector3( (objectStart.x + v.x)*voxelSize.x , (objectStart.y+v.y)*voxelSize.y, (objectStart.z+v.z)*voxelSize.z);
        const voxelMiddlePosition = new Vector3(voxelStartPosition.x + voxelSize.x/2, voxelStartPosition.y + voxelSize.y/2, voxelStartPosition.z + voxelSize.z/2);
        return voxelMiddlePosition;
    }    

    getVoxelFromModelPos(modelPos: Vector3): undefined | Voxel | null{
        const gridPos = this.modelToGridPos(modelPos);
        return this.getVoxel(gridPos);
    }

    //selected areas

    copySelectedArea(from: SelectedAreaType, to: SelectedAreaType): number{
        const areaFrom = this.selectedAreas.get(from)!;
        const areaTo = this.selectedAreas.get(to)!;
        if(from === to) return 0;

        areaTo.clear();
        const copiedVoxels: Vector3[] = [];
        areaFrom.getGridPositions().forEach(v=>{
            copiedVoxels.push(v);
        });
        return this.selectVoxelsByArray(to, copiedVoxels);
    }

    selectFace(v: Vector3, dir: FaceDirection, areaType: SelectedAreaType, emptyVoxels: boolean = false): boolean{
        if(!this.voxelExists(v)) {
            return false;
        }
        if(areaType==="dynamic"){
            this.resetSelectedArea(areaType);
        }        
        this.#selectFaceRecursion(v, dir, emptyVoxels, areaType);
        this.#notifyOfSelectedAreaChange();
        return true;
    }

    #blockingVoxelCoords(v: Vector3, dir: FaceDirection): Vector3{
        switch(dir){
            case "PosX":
                return v.copy().addVector(new Vector3(1,0,0)); 
            case "NegX":
                return v.copy().addVector(new Vector3(-1,0,0)); 
            case "PosY":
                return v.copy().addVector(new Vector3(0,1,0)); 
            case "NegY":
                return v.copy().addVector(new Vector3(0,-1,0)); 
            case "PosZ":
                return v.copy().addVector(new Vector3(0,0,1)); 
            case "NegZ":
                return v.copy().addVector(new Vector3(0,0,-1));                                                                                
        }
    }

    #voxelBehindId(v: Vector3, dir: FaceDirection): Vector3{
        switch(dir){
            case "PosX":
                return v.copy().addVector(new Vector3(-1,0,0)); 
            case "NegX":
                return v.copy().addVector(new Vector3(1,0,0)); 
            case "PosY":
                return v.copy().addVector(new Vector3(0,-1,0)); 
            case "NegY":
                return v.copy().addVector(new Vector3(0,1,0)); 
            case "PosZ":
                return v.copy().addVector(new Vector3(0,0,-1)); 
            case "NegZ":
                return v.copy().addVector(new Vector3(0,0,1));                                                                                
        }
    }

    #voxelDirNeighborsCoords(v: Vector3, dir: FaceDirection): Vector3[]{
        if(dir == "PosX" || dir=="NegX"){
            return [
                new Vector3(v.x,v.y+1,v.z),
                new Vector3(v.x,v.y-1,v.z),
                new Vector3(v.x,v.y,v.z+1),
                new Vector3(v.x,v.y,v.z-1),                
            ]
        }else if(dir == "PosY" || dir == "NegY"){
            return [
                new Vector3(v.x+1,v.y,v.z),
                new Vector3(v.x-1,v.y,v.z),
                new Vector3(v.x,v.y,v.z+1),
                new Vector3(v.x,v.y,v.z-1),                
            ]
        }else{
            return [
                new Vector3(v.x+1,v.y,v.z),
                new Vector3(v.x-1,v.y,v.z),
                new Vector3(v.x,v.y+1,v.z),
                new Vector3(v.x,v.y-1,v.z),                
            ]
        }
    }

    #voxelNeighborsCoords(v: Vector3): Vector3[]{        
            return [
                new Vector3(v.x,v.y+1,v.z),
                new Vector3(v.x,v.y-1,v.z),
                new Vector3(v.x,v.y,v.z+1),
                new Vector3(v.x,v.y,v.z-1),                                
                new Vector3(v.x+1,v.y,v.z),
                new Vector3(v.x-1,v.y,v.z),                      
            ]
    }
    
    #selectFaceRecursion(v: Vector3, dir: FaceDirection, emptyVoxels: boolean, areaType: SelectedAreaType){
        const possiblyBlockingVoxelCoords = this.#blockingVoxelCoords(v , dir);
        const voxelBehind = this.#voxelBehindId(v,dir);
        const shouldSkipThisVoxel = emptyVoxels? (!this.voxelExists(v) ||  this.isVoxelNonEmpty(v) || this.selectedAreas.get(areaType)!.hasGridPosition(v) || (this.voxelExists(voxelBehind) && this.isVoxelEmpty(voxelBehind)))
        : !this.voxelExists(v) || this.isVoxelEmpty(v) || this.selectedAreas.get(areaType)!.hasGridPosition(v);

        if(shouldSkipThisVoxel) return;
        
        const isCurrentVoxelOnSurface = this.isVoxelEmpty(possiblyBlockingVoxelCoords) || !this.voxelExists(possiblyBlockingVoxelCoords);
        if(!isCurrentVoxelOnSurface) return;

        const selectedVoxel = v;
        this.selectedAreas.get(areaType)!.addGridPosition(selectedVoxel)

        this.#voxelDirNeighborsCoords(v, dir).forEach((vs)=>{
            this.#selectFaceRecursion(vs, dir, emptyVoxels, areaType);
        });
    }

    selectCube(vStart: Vector3, vEnd: Vector3, areaType: SelectedAreaType, allowEmpty: boolean = true): boolean{
        if(!this.voxelExists(vStart)) return false;
        if(areaType==="dynamic"){
            this.resetSelectedArea(areaType);
        }

        
        const clampedEnd = new Vector3(clamp({value: vEnd.x, min: 0 ,max: this.#gridSize.x-1 }), 
                                clamp({value: vEnd.y, min: 0 ,max: this.#gridSize.y-1 }),
                                clamp({value: vEnd.z, min: 0 ,max: this.#gridSize.z-1}));
       
        const correctedVStart = new Vector3(Math.min(vStart.x, clampedEnd.x),
                                            Math.min(vStart.y, clampedEnd.y),
                                            Math.min(vStart.z, clampedEnd.z));
        const correctedVEnd = new Vector3(Math.max(vStart.x, clampedEnd.x),
                                            Math.max(vStart.y, clampedEnd.y),
                                            Math.max(vStart.z, clampedEnd.z));      
                                            
        const voxelsToSelect: Vector3[] = []                                        

        for(let x: number = correctedVStart.x; x <= correctedVEnd.x; x++){
            for(let y: number = correctedVStart.y; y <= correctedVEnd.y; y++){
                for(let z: number = correctedVStart.z; z <= correctedVEnd.z; z++){
                    const v = new Vector3(x,y,z);
                    if(allowEmpty || this.isVoxelNonEmpty(v))
                    voxelsToSelect.push(new Vector3(x,y,z));
                }
            }
        }

        const area = this.selectedAreas.get(areaType)!
        let selectedVoxels = 0;
        voxelsToSelect.forEach((v)=>{
            if(area.addGridPosition(v)){
                selectedVoxels++
            }
        })
        if(selectedVoxels>0) this.#notifyOfSelectedAreaChange();
        return true;
    }

    selectConnected(v: Vector3, areaType: SelectedAreaType): boolean{
        if(!this.voxelExists(v)) {
            return false;
        }
        if(areaType==="dynamic"){
            this.resetSelectedArea(areaType);
        }
        if(this.isVoxelNonEmpty(v)) this.#selectConntectedRecursion(v, areaType);
        this.#notifyOfSelectedAreaChange();   
        return true;
    }

    #selectConntectedRecursion(v: Vector3, areaType: SelectedAreaType){
        this.selectedAreas.get(areaType)!.addGridPosition(v)
        this.#voxelNeighborsCoords(v).forEach((vs)=>{
            if(!this.selectedAreas.get(areaType)!.hasGridPosition(vs) && this.voxelExists(vs) && this.isVoxelNonEmpty(vs)){
                this.#selectConntectedRecursion(vs, areaType);
            }
        });                                                                           
    }

    selectByColor(v: Vector3, areaType: SelectedAreaType): boolean{
        if(!this.voxelExists(v)) {
            return false;
        }

        if(this.isVoxelNonEmpty(v)){
            const c = this.getVoxel(v)!.color;   
            this.resetSelectedArea(areaType);
            
            for(let x = 0; x < this.#gridSize.x; x++){
                for(let y = 0; y < this.#gridSize.y; y++){
                    for(let z = 0; z < this.#gridSize.z; z++){
                        const vId = new Vector3(x,y,z);
                        const v = this.getVoxel(vId);                        
                        if(v && v.color.equals(c)){
                            this.selectedAreas.get(areaType)!.addGridPosition(vId);
                        }
                    }
                }
            }
        }

        this.#notifyOfSelectedAreaChange();
        return true;
    }

    //returns in gridPos or null if no voxels are selected
    getSelectedAreaBoundingBoxCenter(areaType: SelectedAreaType): Vector3|null{
        const area = this.selectedAreas.get(areaType)!;
        return area.getBoundingBoxCenter();
    }

    getSelectedVoxelsCount(areaType: SelectedAreaType): number{
        const area = this.selectedAreas.get(areaType)!;
        return area.getVoxelsCount();
    }

    resetSelectedArea(areaType: SelectedAreaType): number{
        const area = this.selectedAreas.get(areaType)!;
        let clearedVoxelsCount = area.clear();
        if(clearedVoxelsCount){
            this.#onSelectedAreaChange(areaType);
            this.#notifyOfSelectedAreaChange();
        }
        return clearedVoxelsCount;        
    }

    selectVoxel(areaType: SelectedAreaType, gridPos: Vector3): boolean{
        const area = this.selectedAreas.get(areaType)!;
        let selectVoxelSuccess = area.addGridPosition(gridPos);
        if(selectVoxelSuccess){
            this.#onSelectedAreaChange(areaType);
        }
        return selectVoxelSuccess;        
    }

    selectVoxelsByArray(areaType: SelectedAreaType, gridPositions: Vector3[]): number{
        const area = this.selectedAreas.get(areaType)!;
        let selectedVoxelsCount = 0;
        gridPositions.forEach((pos: Vector3)=>{
            if(area.addGridPosition(pos)) selectedVoxelsCount++
        });
        if(selectedVoxelsCount){
            this.#onSelectedAreaChange(areaType);
            this.#notifyOfSelectedAreaChange();
        }
        return selectedVoxelsCount;

    }

    moveSelectedArea(type: SelectedAreaType, delta: Vector3, axis?: "X" | "Y" | "Z"): boolean{
        let out = true;
        const selectedArea = this.selectedAreas.get(type)!;
        let refinedDelta = new Vector3(0,0,0);
        if(axis){
            refinedDelta = axis === 'X'? new Vector3(delta.x, 0,0) : axis === 'Y'? new Vector3(0,delta.y,0) : new Vector3(0,0,delta.z); 
        }else{
            refinedDelta = delta; 
        }

        selectedArea.getGridPositions().forEach((rawV)=>{
            const v = rawV.addVector(refinedDelta);
            if(!this.voxelExists(v)){
                out = false;
            }
        })

        if(out){
            const newSelectedAreaVoxels = new Set<string>();
            selectedArea.getGridPositions().forEach((v)=>{                
                const vMoved = v.addVector(refinedDelta);
                newSelectedAreaVoxels.add(vMoved.toString());             
            })            

            if(selectedArea.getGridPositions().length>0){
                selectedArea.clear();
                newSelectedAreaVoxels.forEach(v=>{
                    selectedArea.addGridPosition(Vector3.fromString(v));
                })
                //selectedArea.voxels = newSelectedAreaVoxels;                
                this.#notifyOfSelectedAreaChange();
            }
        }

        return out;        
    }    

    selectVoxelsByFunction(areaType: SelectedAreaType, shouldSelect: (v: Voxel|null,gridPos: Vector3)=>boolean): number{
        const area = this.selectedAreas.get(areaType)!;
        let selectedVoxelsCount = 0;
        for(let x: number = 0; x<this.#gridSize.x; x++){
            
            for(let y: number = 0; y<this.#gridSize.y; y++){
                for(let z: number = 0; z<this.#gridSize.z; z++){
                    const gridPos = new Vector3(x,y,z);
                    const v = this.getVoxel(gridPos);
                    if(v!==undefined){
                        if(shouldSelect(v, gridPos)){   
                            area.addGridPositionUnsafe(gridPos);
                            selectedVoxelsCount++;         
                        }
                    }
        }}}
        if(selectedVoxelsCount){
            this.#onSelectedAreaChange(areaType);
            this.#notifyOfSelectedAreaChange();
        }
        return selectedVoxelsCount;
    }

    modifySelectedVoxelsByFunction(areaType: SelectedAreaType, f: (gridPos: Vector3, v: Voxel|null)=>Voxel|null): number{
        let modifiedVoxels = 0;
        const selectedArea = this.selectedAreas.get(areaType)!;
        const selectedVoxels = selectedArea.getGridPositions();
        selectedVoxels.forEach((gridPos)=>{            
            const v = this.getVoxel(gridPos);
            if(v===undefined) return;
            const newVoxel = f(gridPos, v);
            if( !((newVoxel === null && v === null) || (newVoxel!== null && v!==null && newVoxel.equals(v))) ){
                modifiedVoxels++;
            }
            this.setVoxel(gridPos,newVoxel);
        });
        
        if(modifiedVoxels>0){
            this.#notifyOfVoxelsChange()
        }
        return modifiedVoxels;
    }

    rotateSelectedVoxels(areaType: SelectedAreaType, x: boolean, y: boolean, z: boolean): number {
        this.copyGhostVoxelsToGrid();
        this.clearGhostVoxels();

        let modifiedVoxels = 0;
        const selectedArea = this.selectedAreas.get(areaType)!;
        const selectedVoxels = selectedArea.getGridPositions()
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        let minZ = Infinity;
        let maxZ = -Infinity;

        for (const v of selectedVoxels){
            if (v.x < minX) minX = v.x;
            if (v.x > maxX) maxX = v.x;
            if (v.y < minY) minY = v.y;
            if (v.y > maxY) maxY = v.y;
            if (v.z < minZ) minZ = v.z;
            if (v.z > maxZ) maxZ = v.z;
        }
        
        
        for (const vGridPos of selectedVoxels){
            const v = this.getVoxel(vGridPos);
            if(v===undefined) continue;

            const vCopy = v? v.copy() : null;
            let newVGridPos: Vector3 = vGridPos.copy();

            this.setVoxel(vGridPos, null);
            selectedArea.removeGridPosition(vGridPos);

            if(x){
                const oldY = newVGridPos.y;
                const oldZ = newVGridPos.z;
                newVGridPos.y =  minY + (oldZ - minZ);
                newVGridPos.z = maxZ - (oldY - minY);                                    
            }
            if(y){           
                const oldX = newVGridPos.x;
                const oldZ = newVGridPos.z;      
                newVGridPos.x = maxX - (oldZ - minZ);
                newVGridPos.z = minZ + (oldX - minX);               
            }
            if(z){
                const oldX = newVGridPos.x;
                const oldY = newVGridPos.y;                  
                newVGridPos.x = minX + (oldY - minY);
                newVGridPos.y = maxY - (oldX - minX);
            }
                        
            this.#ghostVoxels.set(newVGridPos, vCopy);
            modifiedVoxels++;                    
        }
        
        this.copyGhostVoxelsToGrid();
        this.#ghostVoxels.getAll().forEach((_,gridPosStr)=>{
            const gridPos = Vector3.fromString(gridPosStr);
            selectedArea.addGridPosition(gridPos);
        });

        
        this.clearGhostVoxels();
        if(modifiedVoxels){
            this.#onSelectedAreaChange(areaType);
            this.#notifyOfSelectedAreaChange();
            //this.#notifyOfVoxelsChange(); copyGhostVoxelsToGrid should already do it
        }
        return modifiedVoxels;
    }

    //flips by selected area bbox
    flipSelectedVoxels(areaType: SelectedAreaType, flipX: boolean, flipY: boolean, flipZ: boolean): number{
        //enplace ghost voxels, because they are needed in the algorithm
        this.copyGhostVoxelsToGrid();
        this.clearGhostVoxels();
        
        let modifiedVoxels = 0;
        const selectedArea = this.selectedAreas.get(areaType)!;
        const selectedVoxels = selectedArea.getGridPositions();
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        let minZ = Infinity;
        let maxZ = -Infinity;

        for (const v of selectedVoxels){
            if (v.x < minX) minX = v.x;
            if (v.x > maxX) maxX = v.x;
            if (v.y < minY) minY = v.y;
            if (v.y > maxY) maxY = v.y;
            if (v.z < minZ) minZ = v.z;
            if (v.z > maxZ) maxZ = v.z;
        }

        selectedVoxels.forEach(vGridPos=>{

            let flippedGridPos = vGridPos.copy();
            const v = this.getVoxel(vGridPos);
            if(v===undefined) return; 

            this.setVoxel(vGridPos, null);
            selectedArea.removeGridPosition(vGridPos);
            
            if(flipX){                                                        
                flippedGridPos.x = minX + maxX - vGridPos.x;
            }
            if(flipY){
                flippedGridPos.y = minY + maxY - vGridPos.y;
            }
            if(flipZ){
                flippedGridPos.z = minZ + maxZ - vGridPos.z;
            }  
            if(this.addGhostVoxel(flippedGridPos, v)) modifiedVoxels++;
        });

        this.copyGhostVoxelsToGrid();
        this.#ghostVoxels.getAll().forEach((_,gridPosStr)=>{
            const gridPos = Vector3.fromString(gridPosStr);
            this.selectVoxel(areaType, gridPos);
        });
        this.clearGhostVoxels();

        if(modifiedVoxels>0){
            this.#notifyOfVoxelsChange();
            this.#notifyOfSelectedAreaChange();
        }        
        return modifiedVoxels;
    }    

    //ghost voxels
    
    getGhostVoxel(gridPos: Vector3): Voxel|null|undefined{
         
        return this.#ghostVoxels.get(gridPos);
    }

    hasGhostVoxel(gridPos: Vector3): boolean{
        return this.getGhostVoxel(gridPos)!==undefined;
    }

    copySelectedAreaToGhostVoxels(areaType: SelectedAreaType){
        const selectedArea = this.selectedAreas.get(areaType)!;
        const selectedVoxels = selectedArea.getGridPositions();
        let out = 0;

        selectedVoxels.forEach((gridPos)=>{             
            const v = this.getVoxel(gridPos)
            if(v!==undefined){
                if( this.addGhostVoxel(gridPos , v) ) out++;
            }
        });

        return out;
    }

    // Copies each voxel in ghost voxels map and replaces grid voxel of same id with it
    // returns amount of copied voxels
    copyGhostVoxelsToGrid(){
        let out = 0;
        const voxelSparseList = this.#ghostVoxels.getAll();
        voxelSparseList.forEach((voxel, gridPosition)=>{
            if(this.setVoxel(Vector3.fromString(gridPosition) , voxel)){
                out++;
            }
        })
        if(out>0){
            this.#notifyOfVoxelsChange();
        }
        return out;
    }

    // Adds voxel to ghost voxels map if given id is correct grid coordinate
    // returns true if voxel was added, false otherwise 
    addGhostVoxel(gridCoord: Vector3, voxel: Voxel|null): boolean{
        if(this.voxelExists(gridCoord)){
            this.#ghostVoxels.set(gridCoord, voxel)
            const chunkPos = this.gridPosToChunkPos(gridCoord);
            this.#onVoxelsChange(chunkPos)
            this.#notifyOfVoxelsChange();
            return true;
        }
        return false;
    }

    // Clears ghost voxels map
    // returns size of ghost voxels map before clearing
    clearGhostVoxels(): number{
        const voxelsSpareList = this.#ghostVoxels.getAll()
        const out = voxelsSpareList.size;
        voxelsSpareList.forEach((v,gridPosStr)=>{
            voxelsSpareList.delete(gridPosStr);
            const modifiedChunkPos = this.gridPosToChunkPos(Vector3.fromString(gridPosStr));
            this.#onVoxelsChange(modifiedChunkPos);
        })
        
        if(out>0) this.#notifyOfVoxelsChange();
        return out;
    }
    

    moveGhostVoxels(delta: Vector3, axis?: "X" | "Y" | "Z"): boolean{
        let out = true;
        let refinedDelta = new Vector3(0,0,0);
        if(axis){
            refinedDelta = axis === 'X'? new Vector3(delta.x, 0,0) : axis === 'Y'? new Vector3(0,delta.y,0) : new Vector3(0,0,delta.z); 
        }else{
            refinedDelta = delta; 
        }

        const ghostVoxelsList = this.#ghostVoxels.getAll();
        ghostVoxelsList.forEach((v, gridPosStr)=>{
            const gridPosMoved = Vector3.fromString(gridPosStr).addVector(refinedDelta);
            if(!this.voxelExists(gridPosMoved)){
                out = false;
            }
        })

        if(out){
            const newGhostVoxels = new Map<string, Voxel|null>();
            ghostVoxelsList.forEach((v, gridPosStr)=>{
                //const v = Vector3.fromString(vStr)
                const gridPosMoved = Vector3.fromString(gridPosStr).addVector(refinedDelta);
                newGhostVoxels.set(gridPosMoved.toString(), v? v.copy():null);         
            })            
            
            this.clearGhostVoxels();
            newGhostVoxels.forEach((v,k)=>{
                this.addGhostVoxel(Vector3.fromString(k), v);                
            })
            if(newGhostVoxels.size>0){                                                
                this.#notifyOfVoxelsChange();
            }
        }

        return out;
    }    
    
    //getters and setters
    //receives voxel grid position
    //returns voxel copy of null if voxel is empty or undefined if grid position is incorrect
    getVoxel(gridPos: Vector3) : Voxel | null | undefined{
        const out = this.#voxelFormat.getVoxel(gridPos);
        return out? out.copy() : out;       
    }

    setVoxel(gridPos: Vector3, newVoxel: Voxel | null): boolean{        
        const setVoxelResult = this.#voxelFormat.setVoxel(gridPos, newVoxel);
        if(setVoxelResult.success){
            setVoxelResult.dirtyChunks.forEach(c=>{
                this.#onVoxelsChange(c);
            })
            return true;
        }else{
            return false;
        }                        
    }

    getVoxelSize(): Vector3{
        return this.#voxelSize.copy();
    }

    setVoxelSize(size: Vector3): boolean{
        if(size.between(VoxelObject.minVoxelSize , VoxelObject.maxVoxelSize)){
            this.#voxelSize = size.copy();
            return true;
        }
        return false;
    }

    getGridSize(): Vector3{
        return this.#gridSize.copy();
    }

    getChunksAmount(): Vector3{
        return this.#voxelFormat.getChunksAmount().copy();
    }

    getChunkSize(): Vector3{
        return this.#voxelFormat.getChunkSize();
    }

    getBorderColor(): Vector4{
        return this.#borderColor.copy();
    }

    getObjectGridColor(): Vector4{
        return this.#objectGridColor.copy();
    }

}