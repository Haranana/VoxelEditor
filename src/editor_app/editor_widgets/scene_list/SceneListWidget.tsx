import { useContext, useEffect, useRef, useState } from "react"
import './SceneList.css'
import { SceneObject } from "../../../voxel_engine/scene-objects/sceneObject"
import { Gizmo } from "../../../voxel_engine/scene-objects/gizmo/gizmo-object"
import { Camera } from "../../../voxel_engine/scene-objects/camera/camera"
import { VoxelObject } from "../../../voxel_engine/scene-objects/voxel/voxel-object"
import SolarCameraLinear from "../../icons/SolarCameraLinear"
import SolarQuestionCircleLinear from "../../icons/SolarQuestionCircleLinear"
import SolarBoxMinimalisticLinear from "../../icons/SolarBoxMinimalisticLinear"
import SolarEyeLinear from "../../icons/SolarEyeLinear"
import SolarEyeClosedLinear from "../../icons/SolarEyeClosedLinear"
import SolarCheckCircleLinear from "../../icons/SolarCheckCircleLinear"
import SolarFilterLinear from "../../icons/SolarFilterLinear"
import MySolarOutlineBoxPlus from "../../icons/MySolarOutlineBoxPlus"
import SolarTrashBin2Outline from "../../icons/SolarTrashBin2Outline"
import MySolarCameraOutline from "../../icons/MySolarCameraOutline"
import MySolarLightbulbMinimalisticOutline from "../../icons/MySolarLightbulbMinimalisticOutline"
import { Tooltip } from "../../other_components/tooltip/Tooltip"
import Popup from "../../other_components/popup/Popup"
import { ControllerContext } from "../../editor_controller/ControllerContext"
import { LightSource } from "../../../voxel_engine/scene-objects/light_source/light-source"
import EmptyIcon from "../../icons/EmptyIcon"

type SceneListObjectType = "gizmo" | "camera" | "voxel" | "object"

type SceneListObject = {
    objectType: SceneListObjectType
    active: boolean, //whether voxelObject is selected, camera is active etc...
    enabled: boolean,
    name: string, 
    sceneId: number,
}

type SceneListFilter = {
    showLightSources: boolean,
    showVoxelObjects: boolean,
    showCameras: boolean,
    showByName: RegExp | null //null if show objects of any name (in accordance to other filters)
}

function soPassesFilter(so: SceneObject, filter: SceneListFilter): boolean{
    console.log(so.name);
    if(so instanceof LightSource && !filter.showLightSources){
        return false;
    }
    if(so instanceof VoxelObject && !filter.showVoxelObjects){
        return false;
    }
    if(so instanceof Camera && !filter.showCameras){
        return false;
    }if(filter.showByName!=null && !filter.showByName.exec(so.name)){
        return false;
    }
    return true;
}

function getIconOfObjectType(t: SceneListObjectType): React.ReactNode{
    if(t == "camera"){
        return <SolarCameraLinear/>
    }else if(t == "gizmo"){
        return <SolarQuestionCircleLinear/>
    }else if(t == "voxel"){
        return <SolarBoxMinimalisticLinear/>
    }else{
        return <SolarQuestionCircleLinear/>
    }
}

function getIconOfObjectByEnabledStatus(s: boolean): React.ReactNode{
    return s? <SolarEyeLinear/> : <SolarEyeClosedLinear/>;
}

function getIconOfObjectByActiveStatus(s: boolean): React.ReactNode{
    return s? <SolarCheckCircleLinear/> : <EmptyIcon/>
}

export function SceneListWidget(){
    const controller = useContext(ControllerContext)!;
    const [sceneListFilter, setSceneListFilter] = useState<SceneListFilter>({
        showLightSources: true,
        showVoxelObjects: true,
        showCameras: true,
        showByName:  null 
    })
    //probably should me memo and not state
    const [sceneObjectsList, setSceneObjectList] = useState<SceneListObject[]>([]);
    const filterOptionsButtonRef = useRef<HTMLButtonElement | null>(null);

    function fetchSceneObjectsFromScene(): SceneObject[]{
        const newObjects = controller.getSceneObjectsOfType(SceneObject);
        if(newObjects){
            return newObjects
        }else{
            console.error(`[SceneListWidget -> onSceneInternalObjectListChanged] editor isn't initialized or scene is null`);
            return [];
        }
    }

    const onSceneInternalObjectListChanged : () => void = () => {
        const newObjects = fetchSceneObjectsFromScene();
        setSceneObjectList(generateSceneObjectsList(newObjects, sceneListFilter))
    }
    const [IsfilterOptionsOpen, setIsFilterOptionsOpen] = useState<boolean>(false); 

    //subscribe on scene object list changed
    useEffect(()=>{
        controller.subscribeObjectListChangedSceneEvent(onSceneInternalObjectListChanged);
        controller.subscribeActiveCameraChangedSceneEvent(onSceneInternalObjectListChanged);
        controller.subscribeActiveVoChangedSceneEvent(onSceneInternalObjectListChanged);
        controller.subscribeObjectEnabledChangeSceneEvent(onSceneInternalObjectListChanged);
    },[])

    useEffect(()=>{
        if(controller.initialized){
            setSceneObjectList(generateSceneObjectsList(fetchSceneObjectsFromScene(), sceneListFilter));
        }
    },[controller.initialized]);


    function generateSceneObjectsList(soList: SceneObject[], filter: SceneListFilter) : SceneListObject[]{
        const out : SceneListObject[] = []
        soList.forEach((so)=>{
            if(!soPassesFilter(so, filter)) return;
            const objectType = so instanceof Gizmo? "gizmo" : so instanceof Camera? "camera" : so instanceof VoxelObject? "voxel" : "object";
            const active = so.sceneId!=null && (controller.isCameraActiveById(so.sceneId) || controller.isVoActiveById(so.sceneId) )
            const enabled = so.enabled
            const name = so.name;
            const sceneId = so.sceneId;
            if(sceneId == null){
                console.log(`[SceneListWidget] Scene object ${name}'s sceneId is null`);
            }else{
                out.push({
                    objectType,
                    active,
                    enabled,
                    name,
                    sceneId,
                })
            }
        });
        return out
    }

    function onFilterChanged(newFilter: SceneListFilter){
        const objects = controller.getSceneObjectsOfType(SceneObject);
        if(objects){
            setSceneObjectList(generateSceneObjectsList(objects, newFilter));
            setSceneListFilter(newFilter);
        }
    }

    function onFilterRegChanged(s: string) {
        const newReg = new RegExp(`.*${s}.*`,"i");

        const newFilter: SceneListFilter = ({...sceneListFilter, showByName: newReg});
        onFilterChanged(newFilter);
    }

    function onFilterVoxelObjectsToggled(){
        const newFilter: SceneListFilter = ({...sceneListFilter, showVoxelObjects: !sceneListFilter.showVoxelObjects});
        onFilterChanged(newFilter);
    }

    function onFilterCamerasToggled(){
        const newFilter: SceneListFilter = ({...sceneListFilter, showCameras: !sceneListFilter.showCameras});
        onFilterChanged(newFilter);        
    }

    function onFilterLightSourcesToggled(){
        const newFilter: SceneListFilter = ({...sceneListFilter, showLightSources: !sceneListFilter.showLightSources});
        onFilterChanged(newFilter);        
    }

    function onObjectEnabledToggled(sceneId: number){
        controller.toggleSceneObjectEnabled(sceneId);
    }

    function onDeleteObjectClicked(sceneId: number){
        controller.deleteSceneObject(sceneId);
    }

    function onInactiveObjectClicked(sceneId: number){
        controller.setSceneActiveObject(sceneId);   
    }

    function onNewVoxelObjectClicked(){
        controller.addNewVoxelObject("NewVo");
    }

    function onNewCameraClicked(){
        controller.addNewCamera("NewCamera")
    }

    //to be implemented when light sources exist
    function onNewLightSourceClicked(){

    }

    return <div className="SceneListWidget">
        <div className="SceneListHeader">
            <input className="SceneListSearchInput" key="sceneListSearchInput" type="text" 
            onChange={(e)=>{onFilterRegChanged(e.target.value)}} />            
            <div className="SceneListFilterWrapper">
                <button ref={filterOptionsButtonRef} className="SceneListFilterButton" onClick={()=>setIsFilterOptionsOpen(prev=>!prev)}>
                    <SolarFilterLinear/>    
                </button >
                {IsfilterOptionsOpen?
                <Popup onClose={()=>setIsFilterOptionsOpen(false)} ignordedNode={filterOptionsButtonRef}>
                    <div className="SceneListFilter">
                        <span className="SceneListFilterRow">
                            <p className="SceneListFilterRowText">Voxel Objects</p>
                            <input className="SceneListFilterRowInput SceneListFilterRowCheckbox" type="checkbox" 
                            defaultChecked={sceneListFilter.showVoxelObjects} onChange={(_)=>onFilterVoxelObjectsToggled()}/>
                        </span>
                        <span className="SceneListFilterRow">
                            <p className="SceneListFilterRowText">Cameras</p>
                            <input className="SceneListFilterRowInput SceneListFilterRowCheckbox" type="checkbox"
                            defaultChecked={sceneListFilter.showCameras} onChange={(_)=>onFilterCamerasToggled()}/>
                        </span>
                        <span className="SceneListFilterRow">
                            <p className="SceneListFilterRowText">Light Sources</p>
                            <input className="SceneListFilterRowInput SceneListFilterRowCheckbox" type="checkbox"
                            defaultChecked={sceneListFilter.showLightSources} onChange={(_)=>onFilterLightSourcesToggled()}/>
                        </span>                                                                
                    </div>
                </Popup>
                : <></>
                }         
            </div>               
        </div>
        <div className="SceneListBody">
            {sceneObjectsList.map((v,i)=>{
                return <div key={i.toString()} 
                className={`SceneListItem ${v.active? "" : "SceneListItemInactive"}`}
                >
                    <div>{getIconOfObjectType(v.objectType)}</div>
                    <p>{v.name}</p>
                    <Tooltip text="Active">
                        <button className={!v.active? "SceneListMakeActiveButton" : ""} onClick={()=>{!v.active? onInactiveObjectClicked(v.sceneId) : {}}}>
                            {getIconOfObjectByActiveStatus(v.active)}</button>
                    </Tooltip>
                    <Tooltip text="Toggle Visibility">
                        <button onClick={()=>onObjectEnabledToggled(v.sceneId)}>
                            {getIconOfObjectByEnabledStatus(v.enabled)}
                        </button>
                    </Tooltip>
                    <Tooltip text="Delete">
                        <button onClick={()=>onDeleteObjectClicked(v.sceneId)}><SolarTrashBin2Outline/></button>
                    </Tooltip>                    
                </div>
            })}
        </div>
        <div className="SceneListFooter">
            <Tooltip text="Create New Voxel Object">
               <button className="SceneListAddObjectButton SceneListAddVoxelButton" onClick={()=>onNewVoxelObjectClicked()}>
                    <MySolarOutlineBoxPlus/>
                </button>
            </Tooltip>

            <Tooltip text="Create New Camera">
               <button className="SceneListAddObjectButton SceneListAddCameraButton" onClick={()=>onNewCameraClicked()}>
                    <MySolarCameraOutline/>
                </button>
            </Tooltip>

            <Tooltip text="Create New Light Source">
               <button className="SceneListAddObjectButton SceneListAddLightButton" onClick={()=>onNewLightSourceClicked()}>
                    <MySolarLightbulbMinimalisticOutline/>
                </button>
            </Tooltip>
        </div>
    </div>
}