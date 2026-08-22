import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { useContext } from "react";
import { ControllerContext } from "../../editor_controller/ControllerContext";
import { ExpandableRow } from "../ExpandableRow";
import './EditSelectedVoxels.css'
export type EditSelectedVoxelsWidgetProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditSelectedVoxelsWidget(props: EditSelectedVoxelsWidgetProps){
    const controller = useContext(ControllerContext)!;
    const TriggerIcon = props.isOpen? ChevronDownIcon : ChevronRightIcon;

return <ExpandableRow
        trigger = {<button type="button" className="ExpandableRowTriggerButton">
        <TriggerIcon className="ExpandableRowTriggerButtonIcon" />
        <p className="ExpandableRowTriggerButtonText">Edit Selected Voxels</p>
                </button>}   
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}>
            <div className="EditSelectedVoxelsWidget">
                <div className="WidgetButtonsPanelWrapper">
                    <p className="WidgetButtonsPanelTitle">Voxels</p>
                    <div className="WidgetButtonsPanel">
                    <button onClick={()=>controller.fillVoxelObjectSelectedArea()}>Fill</button>
                    <button onClick={()=>controller.emptyVoxelObjectSelectedArea()}>Empty</button>
                    <button onClick={()=>controller.reverseVoxelObjectSelectedArea()}>Reverse</button>
                    </div>
                </div>
                <div className="WidgetButtonsPanelWrapper">
                    <p className="WidgetButtonsPanelTitle">Flip</p>
                    <div className="WidgetButtonsPanel">
                    <button onClick={()=>controller.flipObjectSelectedAreaByX()}>X</button>
                    <button onClick={()=>controller.flipObjectSelectedAreaByY()}>Y</button>
                    <button onClick={()=>controller.flipObjectSelectedAreaByZ()}>Z</button>
                    </div>
                </div>
                <div className="WidgetButtonsPanelWrapper">
                    <p className="WidgetButtonsPanelTitle">Rotate</p>
                    <div className="WidgetButtonsPanel">
                    <button onClick={()=>controller.rotateObjectSelectedAreaByX()}>X</button>
                    <button onClick={()=>controller.rotateObjectSelectedAreaByY()}>Y</button>
                    <button onClick={()=>controller.rotateObjectSelectedAreaByZ()}>Z</button>
                    </div>
                </div>    
                        
            </div>
        </ExpandableRow>
}