import { useContext, useState } from "react";
import { ControllerContext } from "../../../app-core/core-controller/core-controller-context";
import type { EditorView } from "../../../app-core/core-controller/core-controller";
import './editor-view-select-bar.css'

export type EditorViewSelectBarProps = {
    version: number,
    onValueChange: ()=>void,
}
export default function EditorViewSelectBar(props: EditorViewSelectBarProps){

    const controller = useContext(ControllerContext)!;

    const onEditorViewButtonPressed = (editorView: EditorView) => {
        controller.setEditorView(editorView);
        props.onValueChange();
        //setVersion(v=>v+1)
    }

    return <div className="EditorViewSelectBar">
        <button className={`EditorViewSelectBarButton ${controller.getEditorView()==='object'? "activeButton" : ""}`} 
        onClick={()=>onEditorViewButtonPressed("object")}>Object</button>
        <button className={`EditorViewSelectBarButton ${controller.getEditorView()==='scene'? "activeButton" : ""}`} 
        onClick={()=>onEditorViewButtonPressed("scene")}>Scene</button>
        <button className={`EditorViewSelectBarButton ${controller.getEditorView()==='render'? "activeButton" : ""}`}  
        onClick={()=>onEditorViewButtonPressed("render")}>Render</button>
    </div>
}