import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { ExpandableRow } from "../expendable-row/ExpendableRow";
import { useContext, useEffect } from "react";
import MdiPencilPlusOutline from "../../icons/MdiPencilPlusOutline";
import SolarEraserOutline from "../../icons/SolarEraserOutline";
import MdiBrushVariant from "../../icons/MdiBrushVariant";
import MdiVectorRectangle from "../../icons/MdiVectorRectangle";
import './edit-tools.css'
import TablerColorPicker from "../../icons/TablerColorPicker";
import MdiAxisArrow from "../../icons/MdiAxisArrow";
import { ControllerContext } from "../../../app-core/core-controller/core-controller-context";
import { Tooltip } from "../../other-components/tooltip/Tooltip";
import { selectToEditCompatibility } from "../../../app-core/core-controller/core-controller";

export type EditToolsWidgetProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onValueChange: ()=>void;
    
}

export function EditToolsWidget(props: EditToolsWidgetProps){
    const controller = useContext(ControllerContext)!;
    const TriggerIcon = props.isOpen? ChevronDownIcon : ChevronRightIcon;

    useEffect(()=>{
        controller.editModeChangedEvent.subscribe(props.onValueChange);
    },[])

    return <ExpandableRow
        className="EditToolsWidget"
        trigger = {<button type="button" className="ExpandableRowTriggerButton">
        <TriggerIcon className="ExpandableRowTriggerButtonIcon" />
        <p className="ExpandableRowTriggerButtonText">Edit Tools</p>
      </button>}
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
    >
        <div className="EditToolsButtonsWrapper">
        <div className="EditToolsButtons">
            <Tooltip text="Add" textClass="EditToolsTooltipText">
                <button className={`AddEditButton${controller.getEditMode()==="Add"? " CurrentEditModeButton" : ""}`} 
                onClick={() => {controller.setEditMode("Add"); props.onValueChange()}}
                disabled ={
                   !selectToEditCompatibility.get(controller.getSelectMode())!.has("Add")}
                >
                    <MdiPencilPlusOutline/>
                </button>    
            </Tooltip>

            <Tooltip text="Remove" textClass="EditToolsTooltipText">
                <button
                    className={`RemoveEditButton${controller.getEditMode()==="Remove"? " CurrentEditModeButton" : ""}`} 
                    onClick={() => { controller.setEditMode("Remove"); props.onValueChange() }}
                    disabled={!selectToEditCompatibility.get(controller.getSelectMode())!.has("Remove")}
                >
                    <SolarEraserOutline/>
                </button>    
            </Tooltip>

            <Tooltip text="Paint" textClass="EditToolsTooltipText">
                <button
                    className={`PaintEditButton${controller.getEditMode()==="Paint"? " CurrentEditModeButton" : ""}`} 
                    onClick={() => { controller.setEditMode("Paint"); props.onValueChange() }}
                    disabled={!selectToEditCompatibility.get(controller.getSelectMode())!.has("Paint")}
                >
                    <MdiBrushVariant/>
                </button>                
            </Tooltip>

            <Tooltip text="Move" textClass="EditToolsTooltipText">
                <button
                    className={`MoveEditButton${controller.getEditMode()==="Move"? " CurrentEditModeButton" : ""}`} 
                    onClick={() => { controller.setEditMode("Move"); props.onValueChange() }}
                    disabled={!selectToEditCompatibility.get(controller.getSelectMode())!.has("Move")}
                >
                    <MdiAxisArrow/>
                </button>
            </Tooltip>

            <Tooltip text="Select" textClass="EditToolsTooltipText">
                <button
                    className={`SelectEditButton${controller.getEditMode()==="Select"? " CurrentEditModeButton" : ""}`} 
                    onClick={() => { controller.setEditMode("Select"); props.onValueChange() }}
                    disabled={!selectToEditCompatibility.get(controller.getSelectMode())!.has("Select")}
                >
                    <MdiVectorRectangle/>
                </button>
            </Tooltip>

            <Tooltip text="Pick Color" textClass="EditToolsTooltipText">
                <button
                    className={`SelectEditButton${controller.getEditMode()==="PickColor"? " CurrentEditModeButton" : ""}`} 
                    onClick={() => { controller.setEditMode("PickColor"); 
                        props.onValueChange() }}
                    disabled={!selectToEditCompatibility.get(controller.getSelectMode())!.has("PickColor")}
                >
                    <TablerColorPicker/>
                </button>
            </Tooltip>            
        </div>
        </div>
    
    </ExpandableRow>
}