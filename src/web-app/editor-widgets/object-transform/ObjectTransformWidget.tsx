import { useContext, useEffect, useState} from "react";
import { ExpandableRow } from "../expendable-row/ExpendableRow";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import './object-transform-widget.css'
import '../editor-widgets.css'
import MdiLockOutline from "../../icons/MdiLockOutline";
import MdiLockOpenVariantOutline from "../../icons/MdiLockOpenVariantOutline";
import { ControllerContext } from "../../../app-core/core-controller/core-controller-context";
import { MutableNumberField } from "../mutable-number-field/MutableNumberField";
import type { ProjectionType } from "../../../app-core/scene-objects/camera/camera";
import { Vector3 } from "../../../math/vector/vector3";
import { Vectors } from "../../../math/vector/vector-utils";
import { degreeToRadians, radiansToDegrees } from "../../../math/utils";

export type ObjectTransformProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    version: number;
    onValueChange: ()=>void;
};

type Axis = "x"|"y"|"z";


export default function ObjectTransformWidget(props: ObjectTransformProps) {
    const controller = useContext(ControllerContext)!;

    const [isTranslateXLocked, setTranslateXLocked] = useState<boolean>(true);
    const [isTranslateYLocked, setTranslateYLocked] = useState<boolean>(true);
    const [isTranslateZLocked, setTranslateZLocked] = useState<boolean>(true);

    const [isRotationXLocked, setRotationXLocked] = useState<boolean>(true);
    const [isRotationYLocked, setRotationYLocked] = useState<boolean>(true);
    const [isRotationZLocked, setRotationZLocked] = useState<boolean>(true);

    const [isScaleXLocked, setScaleXLocked] = useState<boolean>(true);
    const [isScaleYLocked, setScaleYLocked] = useState<boolean>(true);
    const [isScaleZLocked, setScaleZLocked] = useState<boolean>(true);

    const TriggerIcon = props.isOpen ? ChevronDownIcon : ChevronRightIcon;

    function getModifiedAxes(
        axis: Axis,
        lockX: boolean,
        lockY: boolean,
        lockZ: boolean
    ) {
        let modifyX = false;
        let modifyY = false;
        let modifyZ = false;

        if (axis == "x") {
            modifyX = true;
            if (lockX) {
                if (lockY) modifyY = true;
                if (lockZ) modifyZ = true;
            }
        } else if (axis == "y") {
            modifyY = true;
            if (lockY) {
                if (lockX) modifyX = true;
                if (lockZ) modifyZ = true;
            }
        } else if (axis == "z") {
            modifyZ = true;
            if (lockZ) {
                if (lockX) modifyX = true;
                if (lockY) modifyY = true;
            }
        }

        return { modifyX, modifyY, modifyZ };
    }

    function applyGroupedDelta(
        delta: number,
        axis: Axis,
        lockX: boolean,
        lockY: boolean,
        lockZ: boolean,
        addFunction: (value: Vector3) => void
    ) {
        const { modifyX, modifyY, modifyZ } =
            getModifiedAxes(axis, lockX, lockY, lockZ);

        const deltaVector = new Vector3(
            modifyX ? delta : 0,
            modifyY ? delta : 0,
            modifyZ ? delta : 0
        );

        addFunction(deltaVector);
        props.onValueChange();

        console.log(`[applyGroupedDelta]`)
        console.log(controller.getActiveObjectTranslation()?.toString())
    }

    function applyGroupedValue(
        value: number,
        axis: Axis,
        lockX: boolean,
        lockY: boolean,
        lockZ: boolean,
        getFunction: () => Vector3 | undefined,
        setFunction: (value: Vector3) => void
    ) {
        if (!controller.sceneHasActiveObject()) return;

        const { modifyX, modifyY, modifyZ } =
            getModifiedAxes(axis, lockX, lockY, lockZ);

        const oldValue = getFunction();
        if (!oldValue) return;

        const valueVector = oldValue.copy();

        if (modifyX) valueVector.x = value;
        if (modifyY) valueVector.y = value;
        if (modifyZ) valueVector.z = value;

        setFunction(valueVector);
        props.onValueChange();
    }

    function addTranslate(delta: number, axis: Axis) {
        applyGroupedDelta(
            delta,
            axis,
            isTranslateXLocked,
            isTranslateYLocked,
            isTranslateZLocked,
            value => controller.addTranslateToActiveObject(value)
        );
    }

    function setTranslate(value: number, axis: Axis) {
        applyGroupedValue(
            value,
            axis,
            isTranslateXLocked,
            isTranslateYLocked,
            isTranslateZLocked,
            () => controller.getActiveObjectTranslation(),
            value => controller.setTranslateToActiveObject(value)
        );
    }

    function addRotation(delta: number, axis: Axis) {
        applyGroupedDelta(
            delta,
            axis,
            isRotationXLocked,
            isRotationYLocked,
            isRotationZLocked,
            value => controller.addRotationToActiveObject(value)
        );
    }

    function setRotation(value: number, axis: Axis) {
        applyGroupedValue(
            value,
            axis,
            isRotationXLocked,
            isRotationYLocked,
            isRotationZLocked,
            () => controller.getActiveObjectRotation(),
            value => controller.setRotationToActiveObject(value)
        );
    }

    function addScale(delta: number, axis: Axis) {
        applyGroupedDelta(
            delta,
            axis,
            isScaleXLocked,
            isScaleYLocked,
            isScaleZLocked,
            value => controller.addScaleToActiveObject(value)
        );
    }

    function setScale(value: number, axis: Axis) {
        applyGroupedValue(
            value,
            axis,
            isScaleXLocked,
            isScaleYLocked,
            isScaleZLocked,
            () => controller.getActiveObjectScale(),
            value => controller.setScaleToActiveObject(value)
        );
    }

    return (
        <ExpandableRow
            trigger={
                <button type="button" className="ExpandableRowTriggerButton">
                    <TriggerIcon className="ExpandableRowTriggerButtonIcon" />
                    <p className="ExpandableRowTriggerButtonText">Object transform</p>
                </button>
            }
            isOpen={props.isOpen}
            onOpenChange={props.onOpenChange}
        >
            <div className="EditorWidget ObjectTransformWidget">
                <div className="WidgetSection ObjectTranslate">
                    <p>Translation</p>

                    {(["x", "y", "z"] as Axis[]).map(axis => {
                        const locked =
                            axis === "x" ? isTranslateXLocked :
                            axis === "y" ? isTranslateYLocked :
                            isTranslateZLocked;

                        const setLocked =
                            axis === "x" ? setTranslateXLocked :
                            axis === "y" ? setTranslateYLocked :
                            setTranslateZLocked;

                        return (
                            <div className="MutableFieldWrapper" key={axis}>
                                <p className="MutableFieldTitle">{axis.toUpperCase()}</p>
                                <MutableNumberField
                                    value={controller.getActiveObjectTranslation()?.[axis] ?? 0}
                                    minValue={controller.translationMin}
                                    maxValue={controller.translationMax}
                                    step={20}
                                    onStep={delta => addTranslate(delta, axis)}
                                    onAcceptedChange={value => setTranslate(value, axis)}
                                    canIncrease
                                    canDecrease
                                    inputId={`Translate${axis.toUpperCase()}Value`}
                                />
                                <button
                                    className="targetLockButton"
                                    onClick={() => setLocked(prev => !prev)}
                                >
                                    {locked ? <MdiLockOutline /> : <MdiLockOpenVariantOutline />}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="ObjectWidgetSection ObjectRotation">
                    <p>Rotation</p>

                    {(["x", "y", "z"] as Axis[]).map(axis => {
                        const locked =
                            axis === "x" ? isRotationXLocked :
                            axis === "y" ? isRotationYLocked :
                            isRotationZLocked;

                        const setLocked =
                            axis === "x" ? setRotationXLocked :
                            axis === "y" ? setRotationYLocked :
                            setRotationZLocked;

                        return (
                            <div className="MutableFieldWrapper" key={axis}>
                                <p className="MutableFieldTitle">{axis.toUpperCase()}</p>
                                <MutableNumberField
                                    value={(() => {
                                        const rotation = controller.getActiveObjectRotation();
                                        return rotation ? radiansToDegrees(rotation[axis]) : 0;
                                    })()}
                                    minValue={controller.rotationMinDegrees}
                                    maxValue={controller.rotationMaxDegrees}
                                    step={1}
                                    onStep={delta => addRotation(degreeToRadians(delta), axis)}
                                    onAcceptedChange={value => setRotation(degreeToRadians(value), axis)}
                                    canIncrease
                                    canDecrease
                                    inputId={`Rotation${axis.toUpperCase()}Value`}
                                />
                                <button
                                    className="targetLockButton"
                                    onClick={() => setLocked(prev => !prev)}
                                >
                                    {locked ? <MdiLockOutline /> : <MdiLockOpenVariantOutline />}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="ObjectWidgetSection ObjectScale">
                    <p>Scale</p>

                    {(["x", "y", "z"] as Axis[]).map(axis => {
                        const locked =
                            axis === "x" ? isScaleXLocked :
                            axis === "y" ? isScaleYLocked :
                            isScaleZLocked;

                        const setLocked =
                            axis === "x" ? setScaleXLocked :
                            axis === "y" ? setScaleYLocked :
                            setScaleZLocked;

                        return (
                            <div className="MutableFieldWrapper" key={axis}>
                                <p className="MutableFieldTitle">{axis.toUpperCase()}</p>
                                <MutableNumberField
                                    value={controller.getActiveObjectScale()?.[axis] ?? 1}
                                    minValue={controller.scaleMin}
                                    maxValue={controller.scaleMax}
                                    step={0.1}
                                    onStep={delta => addScale(delta, axis)}
                                    onAcceptedChange={value => setScale(value, axis)}
                                    canIncrease
                                    canDecrease
                                    inputId={`Scale${axis.toUpperCase()}Value`}
                                />
                                <button
                                    className="targetLockButton"
                                    onClick={() => setLocked(prev => !prev)}
                                >
                                    {locked ? <MdiLockOutline /> : <MdiLockOpenVariantOutline />}
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="WidgetButtonsPanelWrapper">
                    <div className="WidgetButtonsPanel">
                        <button onClick={()=>{controller.loadActiveObjectDefaultTransform(); props.onValueChange()}}>Load Default</button>
                    </div>     
                </div>      

            </div>
        </ExpandableRow>
    );
}
