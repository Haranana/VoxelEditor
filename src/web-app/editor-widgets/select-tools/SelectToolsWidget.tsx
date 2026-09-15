import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { ExpandableRow } from "../expendable-row/ExpendableRow";
import { useContext, useEffect } from "react";
import './select-tool.css'
import { ControllerContext } from "../../../app-core/core-controller/core-controller-context";
import type { SelectMode } from "../../../app-core/core-controller/core-controller";

export type SelectToolsWidgetProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onValueChange: ()=>void;
}

export function SelectToolsWidget(props: SelectToolsWidgetProps){
    const controller = useContext(ControllerContext)!;
    const TriggerIcon = props.isOpen? ChevronDownIcon : ChevronRightIcon;

    useEffect(()=>{
        controller.subscribeActiveVoSelectedAreaChangedSceneEvent(props.onValueChange);
    },[]); 

    return <ExpandableRow className="SelectToolsWidget"
        trigger = {<button type="button" className="ExpandableRowTriggerButton">
        <TriggerIcon className="ExpandableRowTriggerButtonIcon" />
        <p className="ExpandableRowTriggerButtonText">Select Tools</p>
      </button>}
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}                               
    >
        
        <span className="SelectModeWrapper">
            {/*<p className="SelectModeText">Select Tool: </p>*/}
            <select
                id="SelectModeInput"
                value={controller.getSelectMode()}
                onChange={(e) =>
                    {
                        controller.setSelectMode(e.target.value as SelectMode)
                        props.onValueChange();
                    }
                }>
                <option value="Voxel">Voxel</option>
                <option value="Face">Face</option>
                <option value="Cube">Cube</option>
                <option value="Color">Color</option>
                <option value="Connected">Connected</option>
                <option value="Marquee">Marquee</option>
            </select>
        </span>       
        <div className="QuickSelectPanel">
                <p className="QuickSelectTitle">Quick Select</p>
                <span className="QuickSelectButtons">
                    <button className="SelectAllButton" onClick={()=>controller.selectAllVoxels()}>All</button>
                    <button className="SelectNoButton" onClick={()=>controller.selectNoneVoxels()}>None</button>           
                    <button className="SelectEmptyButton" onClick={()=>controller.selectEmptyVoxels()}>Empty</button>         
                    <button className="SelectNonEmptyButton" onClick={()=>controller.selectNonEmptyVoxels()}>Filled</button>
                </span> 
        </div> 

        <p className="SelectedVoxelsCount">
            Selected Voxels: {controller.getVoxelObjectSelectedVoxelsCount()}
        </p>
    </ExpandableRow>
}