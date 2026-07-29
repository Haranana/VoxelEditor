import "./EditVoxelObjectWidget.css"
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { ExpandableRow } from "./ExpandableRow";
import { useContext } from "react";
import { ControllerContext } from "../editor_controller/ControllerContext";

export type EditVoxelObjectWidgetProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    version: number;
}

export function EditVoxelObjectWidget(props: EditVoxelObjectWidgetProps){
    const controller = useContext(ControllerContext)!;
    const TriggerIcon = props.isOpen? ChevronDownIcon : ChevronRightIcon;

return <ExpandableRow
        trigger = {<button type="button" className="ExpandableRowTriggerButton">
        <TriggerIcon className="ExpandableRowTriggerButtonIcon" />
        <p className="ExpandableRowTriggerButtonText">Edit Object</p>
                </button>}   
        isOpen={props.isOpen}
        onOpenChange={props.onOpenChange}>
            <div className="EditVoxelObjectWidget">
                <div className="EditVoxelObjectSection">
                    <p className="EditVoxelObjectSectionTitle">Size</p>
                    <button onClick={()=>controller.doubleVoxelObjectSize()}>Double</button>
                    <button onClick={()=>controller.halfVoxelObjectSize()}>Half</button>
                </div>
                <div className="EditVoxelObjectSection">
                    <p className="EditVoxelObjectSectionTitle">Voxels</p>
                    <button onClick={()=>controller.fillVoxelObjectVoxels()}>Fill</button>
                    <button onClick={()=>controller.emptyVoxelObjectVoxels()}>Empty</button>
                    <button onClick={()=>controller.reverseVoxelObjectVoxels()}>Reverse</button>
                </div>
                <div className="EditVoxelObjectSection">
                    <p className="EditVoxelObjectSectionTitle">Generate</p>
                    <button onClick={()=>controller.regenerateVoxelObjectToCube()}>Cube</button>
                    <button onClick={()=>controller.regenerateVoxelObjectToSphere()}>Sphere</button>
                    <button onClick={()=>controller.regenerateVoxelObjectToPyramid()}>Pyramid</button>
                    <button onClick={()=>controller.regenerateVoxelObjectToCylinder()}>Cylinder</button>
                </div>
                <div className="EditVoxelObjectSection">
                    <p className="EditVoxelObjectSectionTitle">Flip</p>
                    <button onClick={()=>controller.flipVoxelObjectByX()}>X</button>
                    <button onClick={()=>controller.flipVoxelObjectByY()}>Y</button>
                    <button onClick={()=>controller.flipVoxelObjectByZ()}>Z</button>
                </div>
                <div className="EditVoxelObjectSection">
                    <p className="EditVoxelObjectSectionTitle">Rotate</p>
                    <button onClick={()=>controller.rotateVoxelObjectByX()}>X</button>
                    <button onClick={()=>controller.rotateVoxelObjectByY()}>Y</button>
                    <button onClick={()=>controller.rotateVoxelObjectByZ()}>Z</button>
                </div>    
                <div className="EditVoxelObjectSection">
                
                </div>                             
            </div>
        </ExpandableRow>
}