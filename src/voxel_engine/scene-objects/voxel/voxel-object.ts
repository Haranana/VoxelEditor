import { clamp } from "../../../math/utils";
import { Vector3 } from "../../../math/vector3.type";
import { Vector4 } from "../../../math/vector4.type";
import { RenderableObject } from "../../../render_engine/renderableObjects/renderableObject";
import { copyVoxel, type Voxel, type VoxelArray } from "./voxel";
import { getEmptyVoxelArray } from "./voxel-array-generator";
import { RenderableObjectManager } from "../renderable-object-manager";
import { SceneObject, type WorldObjectTransform } from "../sceneObject";

export type FaceDirection = 
| "PosX"
| "NegX"
| "PosY"
| "NegY"
| "PosZ"
| "NegZ"

export function faceDirectionToVector(dir: FaceDirection){
    switch(dir){
        case "PosX":
            return new Vector3(1,0,0);
        case "NegX":
            return new Vector3(-1,0,0);
        case "PosY":
            return new Vector3(0,1,0);
        case "NegY":
            return new Vector3(0,-1,0);
        case "PosZ":
            return new Vector3(0,0,1);
        case "NegZ":
            return new Vector3(0,0,-1);
    }
}

export function vectorToFaceDirection(v: Vector3){
    if(v.equals(new Vector3(1,0,0))){
        return "PosX";
    }else if(v.equals(new Vector3(-1,0,0))){
        return "NegX";
    }else if(v.equals(new Vector3(0,1,0))){
        return "PosY";
    }else if(v.equals(new Vector3(0,-1,0))){
        return "NegY";
    }else if(v.equals(new Vector3(0,0,1))){
        return "PosZ";
    }else{
        return "NegZ";
    }
}

// (0,0,0) of model space should be middle of the object
// for now without any chunk system or any other kind of optimization
// any cell inside VoxelObject may have object of type Voxel or be null
export class VoxelObject extends SceneObject{

    transform: WorldObjectTransform = {
        translation: new Vector3(0,0,0),
        scale: new Vector3(1,1,1),
        rotation: new Vector3(0,0,0),
    }

    disabled: boolean = false;

    //dictates hard borders of voxel object
    readonly maxSize: Vector3 = new Vector3(256,256,256);

    //size of whole voxelObject
    size : Vector3 = new Vector3(0,0,0);
    
    //how much units in worldSpace should one voxel take in each dimension
    baseVoxelSize = 50;

    //for now all voxels are stored simply as 3D array in VoxelObject
    //in fututre this will be replaced by more sophisticated methods
    voxels : VoxelArray = [[[]]];

    selectedVoxelsAlpha = 160;
    selectedVoxelsDefaultColor: Vector4 = new Vector4(160, 130, 210, this.selectedVoxelsAlpha)
    selectedVoxelColor: Vector4 = this.selectedVoxelsDefaultColor.copy();

    //selected voxels are of type string to ensure uniqueness by value
    //use Vector3.toString() and Vector3.fromString() for conversion
    selectedVoxels: Set<string> = new Set();

    constructor(name: string , size: Vector3){
        super(name);
        this.size = size;
        this.voxels = Array.from({ length: size.x }, () =>
            Array.from({ length: size.y }, () =>
                Array.from({ length: size.z }, () => null)
            )
        );
    }

    //managing renderable objects
    #notifyOfSelectedAreaChange(){
        this.#selectedAreaRo.mesh = null;
        this.#setSelectedAreaRoToRebuild();
    }


    #notifyOfMeshChange(){
        this.#objectRo.mesh = null;
        this.#objectGridRo.mesh = null;
        this.#setObjectRoToRebuild();
        this.#setObjectGridRoToRebuild(); 
    }

    
    #notifyOfTransformChange(){
        this.#setObjectRoToRebuild();
        this.#setObjectGridRoToRebuild();
        this.#setSelectedAreaRoToRebuild();
        this.#setBorderOutlineRoToRebuild();
        this.#setBorderGridToRebuild();
    }

    #notifyOfSizeChange(){
        this.#borderGridRo.mesh = null;
        this.#borderOutlineRo.mesh = null;
        this.#setBorderOutlineRoToRebuild();
        this.#setBorderGridToRebuild();
    }

    #objectRo: RenderableObject = RenderableObjectManager.createVoRo(this);
    #objectRoDirtyFlag: boolean = false;
    getObjectRo(): RenderableObject{
        if(this.#shouldRebuildObjectRo()){
            this.#rebuildObjectRo();
        }
        return this.#objectRo;
    }
    #shouldRebuildObjectRo(): boolean{
        return this.#objectRoDirtyFlag;
    }
    #setObjectRoToRebuild(){
        this.#objectRoDirtyFlag = true;
    }
    #rebuildObjectRo(){
        RenderableObjectManager.rebuildVoRo(this, this.#objectRo);
    }

    #objectGridRo: RenderableObject = RenderableObjectManager.createVoBorderGridRo(this);
    objectGridColor: Vector4 = new Vector4(100,100,100,255);
    #objectGridRoDirty: boolean = false;
    getObjectGridRo(): RenderableObject{
        if(this.#shouldRebuildObjectGridRo()){
            this.#rebuildObjectGrid();
        }
        return this.#objectGridRo;
    }
    #shouldRebuildObjectGridRo(): boolean{
        return this.#objectGridRoDirty
    }
    #setObjectGridRoToRebuild(){
        this.#objectGridRoDirty = true;
    }
    #rebuildObjectGrid(){
        RenderableObjectManager.rebuildVoGridRo(this, this.#objectGridRo);
    }

    #selectedAreaRo: RenderableObject = RenderableObjectManager.createVoSelectedAreaRo(this);
    #selectedAreaRoDirty: boolean = false;
    getSelectedAreaRo() : RenderableObject{
        if(this.#shouldRebuildSelectedAreaRo()){
            this.#rebuildSelectedAreaRo();
        }
        return this.#selectedAreaRo;
    }
    #shouldRebuildSelectedAreaRo(): boolean{
        return this.#selectedAreaRoDirty
    }
    #setSelectedAreaRoToRebuild(){
        this.#selectedAreaRoDirty = true;
    }
    #rebuildSelectedAreaRo(){
        RenderableObjectManager.rebuildVoSelectedAreaRo(this, this.#selectedAreaRo);
    }

    borderColor: Vector4 = new Vector4(160, 130, 210, 255);

    #borderOutlineRo: RenderableObject = RenderableObjectManager.createVoBorderOutlineRo(this);
    #borderOutlineRoDirty: boolean = false;
    getBorderOutlineRo(): RenderableObject{
       if(this.#shouldRebuildBorderOutlineRo()){
        this.#rebuildBorderOutlineRo();
       }
       return this.#borderOutlineRo;
    }
    #shouldRebuildBorderOutlineRo(): boolean{
        return this.#borderOutlineRoDirty;
    }
    #setBorderOutlineRoToRebuild(){
        this.#borderOutlineRoDirty = true;
    }
    #rebuildBorderOutlineRo(): void{
        RenderableObjectManager.rebuildVoBorderOutlineRo(this, this.#borderOutlineRo);
    }
    

    #borderGridRo: RenderableObject = RenderableObjectManager.createVoBorderGridRo(this);
    #borderGridRoDirty: boolean = false;
    getBorderGridRo(): RenderableObject{
       if(this.#shouldRebuildBorderGrid()){
        this.#rebuildBorderGridRo();
       }
       return this.#borderGridRo;
    }
    #shouldRebuildBorderGrid(): boolean{
        return this.#borderGridRoDirty;
    }
    #setBorderGridToRebuild(){
        this.#borderGridRoDirty = true;
    }
    #rebuildBorderGridRo(): void{
        RenderableObjectManager.rebuildVoBorderGridRo(this, this.#borderGridRo);
    }

    //receives point in this object model space
    //returns id of possible vexel in this object
    //whether any voxel exists under this id is unkown
    //assumes that (0,0,0) is in the middle of the object
    pointCoordinatesToVoxelId(v: Vector3) : Vector3{
        const xCord :number = Math.floor(v.x/this.baseVoxelSize)+this.size.x/2;
        const yCord :number = Math.floor(v.y/this.baseVoxelSize)+this.size.y/2;
        const zCord :number = Math.floor(v.z/this.baseVoxelSize)+this.size.z/2;
        const result = new Vector3(xCord, yCord, zCord);        
        return result;
    }

    //receives voxel id
    //returns voxel copy or null if id is incorrect
    getVoxel(v: Vector3) : Voxel | null{
        const x = v.x;
        const y = v.y;
        const z = v.z;

        if (
            x < 0 || x >= this.size.x ||
            y < 0 || y >= this.size.y ||
            z < 0 || z >= this.size.z
        ) {
            return null;
        }

        const chosenVoxel = this.voxels[x][y][z];
        return chosenVoxel ? copyVoxel(chosenVoxel) : null;
    }

    setVoxel(pos: Vector3, newVoxel: Voxel){
        try{
            this.voxels[pos.x][pos.y][pos.z] = newVoxel;
            this.#notifyOfMeshChange();
            return true;
        }catch(e: any){
            return false;
        }
    }

    setVoxels(voxels: VoxelArray){
        const size: Vector3 = new Vector3(voxels.length, voxels[0].length, voxels[0][0].length);
        this.voxels = voxels;    
        const sizeModified = this.size!==size;
        this.size = size;

        this.#notifyOfMeshChange();
        if(sizeModified){
            this.#notifyOfSizeChange();
        }

    }

    removeVoxel(pos: Vector3){
        try{
            this.voxels[pos.x][pos.y][pos.z] = null;
            this.#notifyOfMeshChange();
            return true;
        }catch(e: any){
            return false;
        }
    }

    //clear set of selected voxels
    //returns size of selected voxels set before clearing
    resetSelect(){
        const clearedVoxels = this.selectedVoxels.size;
        if(clearedVoxels>0){
            this.selectedVoxels.clear();
            this.#notifyOfSelectedAreaChange();
        }
        return clearedVoxels;
    }

    //adds voxel of given coordinates to set of selected voxels
    //returns true if successfuly added
    //returns false if voxel doesn't exist or if voxel was already selected
    selectVoxel(v: Vector3): boolean{
        //console.log(`[selectVoxel] select request for ${v.toString()}`)
        if(this.voxelExists(v)){
            const vStr = v.toString();
            if(this.selectedVoxels.has(vStr)){
                return false;
            }
            this.resetSelect();
            this.selectedVoxels.add(v.toString());
            this.#notifyOfSelectedAreaChange();
            return true;
            
        }else{
            return false;
        }
    }

    //adds voxels of the same face as starting voxel of given coordinates
    //emptyVoxels = true : selects only empty voxels, otherwise only non-empty
    //returns true if successfuly added or if all voxels were already selected
    //returns false if starting voxel doesn't exist
    selectFace(v: Vector3, dir: FaceDirection, emptyVoxels: boolean = false): boolean{
        //console.log(`[selectFace] select face for ${v.toString()} | ${dir}`)
        if(!this.voxelExists(v)) {
            return false;
        }
        this.resetSelect();
        this.#selectFaceRecursion(v, dir, emptyVoxels);
        //this.voxelsModified = true;
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

    #voxelNeighborsCoords(v: Vector3, dir: FaceDirection): Vector3[]{
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

    #selectFaceRecursion(v: Vector3, dir: FaceDirection, emptyVoxels: boolean){
        //console.log(`[selectFaceRecursion] iteration: ${v} -`)
        const possiblyBlockingVoxelCoords = this.#blockingVoxelCoords(v , dir);
        const voxelBehind = this.#voxelBehindId(v,dir);
        const shouldSkipThisVoxel = emptyVoxels? (!this.voxelExists(v) ||  this.isVoxelNonEmpty(v) || this.selectedVoxels.has(v.toString()) || (this.voxelExists(voxelBehind) && this.isVoxelEmpty(voxelBehind)))
        : !this.voxelExists(v) || this.isVoxelEmpty(v) || this.selectedVoxels.has(v.toString());

        if(shouldSkipThisVoxel) return;
        //console.log(`[selectFaceRecursion] iteration: ${v} +`)
        
        const isCurrentVoxelOnSurface = this.isVoxelEmpty(possiblyBlockingVoxelCoords) || !this.voxelExists(possiblyBlockingVoxelCoords);
        //console.log(`isCurrentVoxelOnSurface: ${isCurrentVoxelOnSurface } | for blocking voxel: ${possiblyBlockingVoxelCoords}`)
        if(!isCurrentVoxelOnSurface) return;

        const selectedVoxel = v;
        this.selectedVoxels.add(selectedVoxel.toString());

        this.#voxelNeighborsCoords(v, dir).forEach((vs)=>{
            this.#selectFaceRecursion(vs, dir, emptyVoxels);
        });
    }

    selectCube(vStart: Vector3, vEnd: Vector3): boolean{
        if(!this.voxelExists(vStart)) return false;
        this.resetSelect();
        this.#notifyOfSelectedAreaChange();
        const clampedEnd = new Vector3(clamp({value: vEnd.x, min: 0 ,max: this.size.x-1 }), 
                                clamp({value: vEnd.y, min: 0 ,max: this.size.y-1 }),
                                clamp({value: vEnd.z, min: 0 ,max: this.size.z-1}));
       
        const correctedVStart = new Vector3(Math.min(vStart.x, clampedEnd.x),
                                            Math.min(vStart.y, clampedEnd.y),
                                            Math.min(vStart.z, clampedEnd.z));
        const correctedVEnd = new Vector3(Math.max(vStart.x, clampedEnd.x),
                                            Math.max(vStart.y, clampedEnd.y),
                                            Math.max(vStart.z, clampedEnd.z));    
                                            
          /*                                  
        const correctedVStart = vStart;
        const correctedVEnd = clampedEnd;
        */

        for(let x: number = correctedVStart.x; x <= correctedVEnd.x; x++){
            for(let y: number = correctedVStart.y; y <= correctedVEnd.y; y++){
                for(let z: number = correctedVStart.z; z <= correctedVEnd.z; z++){
                    this.selectedVoxels.add(new Vector3(x,y,z).toString());
                }
            }
        }
        //this.voxelsModified = true;
        return true;
    }

    //reset selected voxels and selects every empty voxel in object
    //returns number of newly selected voxels
    selectEmptyVoxels(): number{
        this.resetSelect();

        let selectedVoxelsNumber = 0;
        for(let x: number = 0; x <= this.size.x; x++){
            for(let y: number = 0; y <= this.size.y; y++){
                for(let z: number = 0; z <= this.size.z; z++){
                    if(this.isVoxelEmpty(new Vector3(x,y,z))){
                        selectedVoxelsNumber++;     
                        this.selectedVoxels.add(new Vector3(x,y,z).toString());    
                    }       
                }
            }
        }

        if(selectedVoxelsNumber>0) {
            this.#notifyOfSelectedAreaChange();
        }
        return selectedVoxelsNumber;
    }

    selectAllVoxels(): number{
        let selectedVoxelsNumber = 0;
        for(let x: number = 0; x <= this.size.x; x++){
            for(let y: number = 0; y <= this.size.y; y++){
                for(let z: number = 0; z <= this.size.z; z++){
                    if(this.voxelExists(new Vector3(x,y,z))){
                        selectedVoxelsNumber++;     
                        this.selectedVoxels.add(new Vector3(x,y,z).toString());    
                    }       
                }
            }
        }

        if(selectedVoxelsNumber>0) this.#notifyOfSelectedAreaChange();
        return selectedVoxelsNumber;
    }

    //reset selected voxels and selects every non-empty voxel in object
    //returns number of newly selected voxels
    selectNonEmptyVoxels(){
        this.resetSelect();

        let selectedVoxelsNumber = 0;
        for(let x: number = 0; x <= this.size.x; x++){
            for(let y: number = 0; y <= this.size.y; y++){
                for(let z: number = 0; z <= this.size.z; z++){
                    if(this.isVoxelNonEmpty(new Vector3(x,y,z))){
                        selectedVoxelsNumber++;     
                        this.selectedVoxels.add(new Vector3(x,y,z).toString());    
                    }       
                }
            }
        }

        if(selectedVoxelsNumber>0) {
            this.#notifyOfSelectedAreaChange();
        }
        return selectedVoxelsNumber;
    }

    //adds voxel to every coord stored in selectedVoxels if the voxel they point at is empty
    //returns number of added voxels
    addSelectedVoxels(color: Vector4) : number{
        let addedVoxels: number = 0;
        this.selectedVoxels.forEach(v=>{
            const voxel = Vector3.fromString(v);
            if(this.isVoxelEmpty(voxel)){
                this.setVoxel(voxel, {color});
                addedVoxels++;
            }
        });     
        return addedVoxels;
    }

    //fills every empty voxel with voxel of given color
    //removes every non-empty voxel
    //returns number of modified voxels
    reverseSelectedVoxels(color: Vector4): number{
        let modifiedVoxels: number = 0;
        this.selectedVoxels.forEach(v=>{
            const voxel = Vector3.fromString(v);
            if(this.isVoxelEmpty(voxel)){
                this.setVoxel(voxel, {color});
                modifiedVoxels++;
            }else if(this.isVoxelNonEmpty(voxel)){
                this.removeVoxel(voxel);
                modifiedVoxels++;
            }
        });     
        return modifiedVoxels;
    }

    //nulls every voxel which id is stored in selectedVoxels
    //returns number of nulled voxels which were prevoiusly non-empty
    removeSelectedVoxels() : number{
        let removedVoxels: number = 0;
        this.selectedVoxels.forEach(v=>{
            const voxel = Vector3.fromString(v);
            this.removeVoxel(voxel);
            removedVoxels++;
        });
        return removedVoxels;
    }

    //rotations currently work only when full object is selected because they create fresh object and fill it only with rotated voxels
    //todo: FIX!
    rotateSelectedVoxelsByX(): number{
        let modifiedVoxels = 0;
        const maxY = this.size.y-1;
        const outVoxels = getEmptyVoxelArray(this.size);
        this.selectedVoxels.forEach(v=>{
            const voxelPosititon = Vector3.fromString(v);
            const voxel: Voxel | null = this.getVoxel(voxelPosititon);
            const newVoxelPosition = new Vector3(voxelPosititon.x, voxelPosititon.z, maxY - voxelPosititon.y);
            if(this.voxelExists(newVoxelPosition)){
                if(voxel){
                    outVoxels[newVoxelPosition.x][newVoxelPosition.y][newVoxelPosition.z] = copyVoxel(voxel)
                }
            }
            modifiedVoxels++;
        });
        this.voxels = outVoxels;
        this.#notifyOfMeshChange();
        return modifiedVoxels;
    }

    rotateSelectedVoxelsByY(): number{
        let modifiedVoxels = 0;
        const maxZ = this.size.z-1;
        const outVoxels = getEmptyVoxelArray(this.size);
        this.selectedVoxels.forEach(v=>{
            const voxelPosititon = Vector3.fromString(v);
            const voxel: Voxel | null = this.getVoxel(voxelPosititon);
            const newVoxelPosition = new Vector3(maxZ - voxelPosititon.z, voxelPosititon.y, voxelPosititon.x);
            if(this.voxelExists(newVoxelPosition)){
                if(voxel){
                    outVoxels[newVoxelPosition.x][newVoxelPosition.y][newVoxelPosition.z] = copyVoxel(voxel)
                }
            }
            modifiedVoxels++;
        });
        this.voxels = outVoxels;
        this.#notifyOfMeshChange();
        return modifiedVoxels;  
    }

    rotateSelectedVoxelsByZ(): number{
        let modifiedVoxels = 0;
        const maxX = this.size.x-1;
        const outVoxels = getEmptyVoxelArray(this.size);
        this.selectedVoxels.forEach(v=>{
            const voxelPosititon = Vector3.fromString(v);
            const voxel: Voxel | null = this.getVoxel(voxelPosititon);
            const newVoxelPosition = new Vector3(voxelPosititon.y, maxX - voxelPosititon.x, voxelPosititon.z);
            if(this.voxelExists(newVoxelPosition)){
                if(voxel){
                    outVoxels[newVoxelPosition.x][newVoxelPosition.y][newVoxelPosition.z] = copyVoxel(voxel);
                }
            }
            modifiedVoxels++;
        });
        this.voxels = outVoxels;
        this.#notifyOfMeshChange();
        return modifiedVoxels;
    }

    flipSelectedVoxelsByX(): number{
        let modifiedVoxels = 0;
        for(let x = 0; x < Math.floor(this.size.x/2); x++){
            for(let y = 0; y < this.size.y; y++){
                for(let z = 0; z < this.size.z; z++){
                    if(this.selectedVoxels.has(new Vector3(x,y,z).toString())){
                        const voxelPosition = new Vector3(x,y,z);
                        const flippedVoxelPosition = new Vector3(this.size.x - 1 - x ,y,z);
                        if(!voxelPosition.equals(flippedVoxelPosition)){
                            this.swapVoxels(voxelPosition , flippedVoxelPosition);
                            modifiedVoxels++;
                        }
                    }
                }   
            }   
        }
        this.#notifyOfMeshChange();
        return modifiedVoxels;
    }

    flipSelectedVoxelsByY(): number{
        let modifiedVoxels = 0;
        for(let x = 0; x < this.size.x; x++){
            for(let y = 0; y < Math.floor(this.size.y/2); y++){
                for(let z = 0; z < this.size.z; z++){
                    if(this.selectedVoxels.has(new Vector3(x,y,z).toString())){
                        const voxelPosition = new Vector3(x,y,z);
                        const flippedVoxelPosition = new Vector3(x ,this.size.y - 1 -y,z);
                        if(!voxelPosition.equals(flippedVoxelPosition)){
                            this.swapVoxels(voxelPosition , flippedVoxelPosition);
                            modifiedVoxels++;
                        }
                    }
                }   
            }   
        }
        this.#notifyOfMeshChange();
        return modifiedVoxels;
    }

    flipSelectedVoxelsByZ(): number{
        let modifiedVoxels = 0;
        for(let x = 0; x < this.size.x; x++){
            for(let y = 0; y < this.size.y; y++){
                for(let z = 0; z < Math.floor(this.size.z/2); z++){
                    if(this.selectedVoxels.has(new Vector3(x,y,z).toString())){
                        const voxelPosition = new Vector3(x,y,z);
                        const flippedVoxelPosition = new Vector3(x ,y,this.size.z - 1 -z);
                        if(!voxelPosition.equals(flippedVoxelPosition)){
                            this.swapVoxels(voxelPosition , flippedVoxelPosition);
                            modifiedVoxels++;
                        }
                    }
                }   
            }   
        }
        this.#notifyOfMeshChange();
        return modifiedVoxels;
    }

    //swaps values beetwen 2 voxels
    //returns false if id of any voxels was incorrect, true otherwise
    swapVoxels(pos1: Vector3, pos2: Vector3 ): boolean{
        if(!this.voxelExists(pos1) || !this.voxelExists(pos2)) return false;
        const voxel1: Voxel | null = this.isVoxelEmpty(pos1)? null : copyVoxel(this.getVoxel(pos1)!);
        const voxel2: Voxel | null = this.isVoxelEmpty(pos2)? null : copyVoxel(this.getVoxel(pos2)!);;
        
        voxel2==null? this.removeVoxel(pos1) : this.setVoxel(pos1, voxel2);
        voxel1==null? this.removeVoxel(pos2) : this.setVoxel(pos2, voxel1);

        return true;
    }

    //changes color of every non-empty voxel which id is stored in selectedVoxels
    //returns number of modified voxels
    paintSelectedVoxels(newColor: Vector4) : number{
        let modifiedVoxels: number = 0;
        this.selectedVoxels.forEach(v=>{
            if(this.isVoxelNonEmpty(Vector3.fromString(v))){
                const voxel = Vector3.fromString(v);
                this.setVoxel(voxel, {color: newColor});
                modifiedVoxels++;
            }
        });
        if(modifiedVoxels>0){
            this.#notifyOfMeshChange();
        }
        return modifiedVoxels;
    }

    //receives point in this object model space
    //return copy of voxel in those coordinates or null if there's none
    getVoxelFromModelSpacePoint(v: Vector3) : Voxel | null{
        return this.getVoxel(this.pointCoordinatesToVoxelId(v));
    }

    //changes size of voxel object, according to argument newSize, 
    //clamped beetwen 0 and private parameter maxSize
    //returns new size of voxel object
    resize(newSize: Vector3) : Vector3{
        const clampedNewSize = new Vector3(
            clamp({value: newSize.x , min: 0 , max: this.maxSize.x}),
            clamp({value: newSize.y , min: 0 , max: this.maxSize.y}),
            clamp({value: newSize.z , min: 0 , max: this.maxSize.z})
        );

        if(!clampedNewSize.equals(this.size)){
            
            const newVoxels: (Voxel | null)[][][] = Array.from({ length: clampedNewSize.x }, () =>
                Array.from({ length: clampedNewSize.y }, () =>
                    Array.from({ length: clampedNewSize.z }, () => null)
                )
            );

            for(let x = 0; x < Math.min(this.size.x, clampedNewSize.x); x++){
                for(let y = 0; y < Math.min(this.size.y, clampedNewSize.y); y++){
                    for(let z = 0; z < Math.min(this.size.z, clampedNewSize.z); z++){
                        newVoxels[x][y][z] = this.voxels[x][y][z];
                    }
                }
            }

            const newSelectedVoxels = new Set<string>();
            this.selectedVoxels.forEach(vStr =>{
                const v = Vector3.fromString(vStr)
                if(v.x < clampedNewSize.x && v.y < clampedNewSize.y && v.z < clampedNewSize.z){
                    newSelectedVoxels.add(vStr);
                }else{
                    this.#notifyOfSelectedAreaChange();
                }
            })

            this.size = clampedNewSize;
            this.voxels = newVoxels;
            this.selectedVoxels = newSelectedVoxels;

            this.#notifyOfMeshChange();
            this.#notifyOfSizeChange();
        }
        return this.size;
    }

    copy() : VoxelObject{
        const out: VoxelObject = new VoxelObject(this.name, this.size);
        out.voxels = this.voxels.map(layer =>
            layer.map(row =>
                row.map(voxel => voxel ? { ...voxel } : null)
            )
        );
        out.baseVoxelSize = this.baseVoxelSize;
        out.#notifyOfMeshChange();
        out.#notifyOfSizeChange();      
        out.selectedVoxelColor = this.selectedVoxelColor.copy();
        return out;
    }

    voxelExists(v: Vector3): boolean{
        return (v.x >= 0 && v.x < this.size.x && v.y >= 0 && v.y < this.size.y && v.z >= 0 && v.z <this.size.z);
    }

    //returns true if voxel of given coords exists and is non-null
    //returns false either if it's null or doesn't exist
    isVoxelNonEmpty(v: Vector3){
        return this.getVoxel(v)? true : false;
    }

    //returns true if voxel of given coords exists and is null
    //returns false either if it's not a null or doesn't exist
    isVoxelEmpty(v: Vector3){
        if(!this.voxelExists(v)) return false;
        const voxel = this.getVoxel(v);
        return voxel? false : true;
    }

    setSelectedVoxelsColor(v: Vector3){
        this.selectedVoxelColor = new Vector4(v.x, v.y, v.z, this.selectedVoxelsAlpha);
    }
}