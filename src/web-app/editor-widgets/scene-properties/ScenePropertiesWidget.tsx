import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { ExpandableRow } from "../expendable-row/ExpendableRow";
import './scene-properties.css'
import { useContext } from "react";
import { ControllerContext } from "../../../app-core/core-controller/core-controller-context";

export type ScenePropertiesWidgetProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onValueChange: ()=>void;
    version: number;
}

export default function ScenePropertiesWidget(props: ScenePropertiesWidgetProps){
    const TriggerIcon = props.isOpen? ChevronDownIcon : ChevronRightIcon;
    const controller = useContext(ControllerContext)!;

    return <ExpandableRow
        className="ScenePropertiesWidget"
        trigger = {<button type="button" className="ExpandableRowTriggerButton">
        <TriggerIcon className="ExpandableRowTriggerButtonIcon" />
        <p className="ExpandableRowTriggerButtonText">Scene Properties</p>
      </button>}
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}
    >
        <div className="WidgetButtonsPanelWrapper">
            <div className="WidgetButtonsPanel">
                <button className={`${controller.isActiveVoGridOn()? "ActiveButton" : ""}`} onClick={()=>{controller.toggleActiveVoGrid();props.onValueChange()}}>Object Grid</button>
                <button className={`${controller.isActiveVoBorderGridOn()? "ActiveButton" : ""}`} onClick={()=>{controller.toggleActiveVoBorderGrid();props.onValueChange()}}>Border Grid</button>
                <button className={`${controller.isActiveVoBorderOutlineOn()? "ActiveButton" : ""}`} onClick={()=>{controller.toggleActiveVoBorderOutline();props.onValueChange()}}>Border Outline</button>
            </div>     
        </div>
    </ExpandableRow>
}