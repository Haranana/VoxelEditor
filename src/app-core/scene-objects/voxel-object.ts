import { gridPosToOffset } from "../../math/utils";
import { Vector3 } from "../../math/vector/vector3";
import type { VoxelFormat } from "../../voxel-engine/voxel-formats/voxel-format";
import { VoxelGridFormat } from "../../voxel-engine/voxel-formats/voxel-grid-format";
import type { Voxel } from "../../voxel-engine/voxel-types/voxel";
import { AppCoreEvent } from "../events/event";
import { SceneObject, type WorldObjectTransform } from "./sceneObject";
import { VoxelObjectRenderablesManager } from "./voxel-object-renderables-manager";
import { VoxelObjectSelectedArea } from "./voxel/voxel-object-selected-area";


export type SelectedAreaType = "static" | "dynamic";

// (0,0,0) of model space should be middle of the object
export class VoxelObject extends SceneObject{

    voxelFormat: VoxelFormat<Voxel> = new VoxelGridFormat();

    //dictates hard borders of voxel object
    static readonly maxGridSize: Vector3 = new Vector3(256,256,256);
    static readonly minGridSize: Vector3 = new Vector3(2,2,2);
    static readonly #defaultGridSize: Vector3 = new Vector3(64,64,64);
    #gridSize: Vector3 = VoxelObject.#defaultGridSize.copy();

    transform: WorldObjectTransform = {
        translation: new Vector3(0,0,0),
        scale: new Vector3(1,1,1),
        rotation: new Vector3(0,0,0),
    }    

    renderablesManager = new VoxelObjectRenderablesManager(this);
    voxelUnitSize = 50;

    readonly #selectedAreas: Map<SelectedAreaType, VoxelObjectSelectedArea> = new Map([
        ['static', new VoxelObjectSelectedArea(this.#gridSize)],
        ['dynamic', new VoxelObjectSelectedArea(this.#gridSize)],
    ]);

    selectedAreaChangeEvent: AppCoreEvent<void> = new AppCoreEvent();
    voxelsChangeEvent: AppCoreEvent<void> = new AppCoreEvent();
    transformChangeEvent: AppCoreEvent<void> = new AppCoreEvent();
    sizeChangeEvent: AppCoreEvent<void> = new AppCoreEvent();

    #notifyOfSelectedAreaChange(){        
        this.selectedAreaChangeEvent.emit();
    }
    #onSelectedAreaChange(){
        this.renderablesManager.clearSelectedAreaMesh();
        this.#notifyOfSelectedAreaChange();
    }
    
    #notifyOfVoxelsChange(){ 
        this.voxelsChangeEvent.emit();
    }
    #onVoxelsChange(chunkPos: Vector3){
        const chunkOffset = gridPosToOffset(chunkPos, this.getChunksAmount());
        this.renderablesManager.clearChunkMesh(chunkOffset);
        this.#notifyOfVoxelsChange();
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
    
    getChunksAmount(): Vector3{
        return this.voxelFormat.getChunksAmount().copy();
    }
    getChunkSize(): Vector3{
        return this.voxelFormat.getChunkSize();
    }
}