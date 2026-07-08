import {  useContext, useEffect, useRef, type RefObject } from "react";
import type { ObjectProperties } from "../RenderableObjectTypes";
import { Vector2 } from "../math/vector2.type";
import type { Renderer } from "../classes/renderer";
import type { Scene } from "../classes/scene";
import { ControllerContext } from "../ControllerContext";

export type EditorCanvasProps = {
    renderer: Renderer,
    scene: Scene,
    onRenderAndSceneInit: ()=>void,
    renderScene: ()=>void,
    objectProperties: ObjectProperties;
    canvasRef: RefObject<HTMLCanvasElement | null>;
}

export default function EditorCanvas(props: EditorCanvasProps) {
    const controller = useContext(ControllerContext);

    function getMousePos(canvas: HTMLCanvasElement, evt: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    var rect = canvas.getBoundingClientRect();
        return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        };
    }
    
    function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>){
        if(!props.canvasRef.current || !controller) return; 
        const clickPos = new Vector2(getMousePos(props.canvasRef.current, e).x , getMousePos(props.canvasRef.current, e).y);
        const canvasSize = new Vector2(props.canvasRef.current.width, props.canvasRef.current.height);
        
        if(e.button === 0){
            controller.handleCanvasPointerDown(clickPos, canvasSize);
        }else if(e.button===2){ 
            controller.startCameraMoveSession(clickPos);
        }
    }

    function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>){
        if(!props.canvasRef.current || !controller) return; 
        const clickPos = new Vector2(getMousePos(props.canvasRef.current, e).x , getMousePos(props.canvasRef.current, e).y);
        const canvasSize = new Vector2(props.canvasRef.current.width, props.canvasRef.current.height);

        controller.updateCameraMoveSession(clickPos);
        controller.handleCanvasPointerMove(clickPos, canvasSize);
    }

    function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>){
        if(!props.canvasRef.current || !controller) return; 
        const clickPos = new Vector2(getMousePos(props.canvasRef.current, e).x , getMousePos(props.canvasRef.current, e).y);
        const canvasSize = new Vector2(props.canvasRef.current.width, props.canvasRef.current.height);
        
        controller.endCameraMoveSession();
        controller.handleCanvasPointerUp(clickPos, canvasSize);
    }

    //TODO - do anything with that???
    function handlePointerCancel(_: React.PointerEvent<HTMLCanvasElement>){
        if(!props.canvasRef.current || !controller) return; 
    }

    useEffect(()=>{
        const canvas = props.canvasRef.current;
        if (!canvas) return;

        const run = async () => {
            await props.renderer.init(canvas);
            props.onRenderAndSceneInit();
        };

        run();
    }, []);

    const pressedKeysRef = useRef<Set<string>>(new Set());
    useEffect(() => {
        const canvas = props.canvasRef.current;
        if (!canvas) return;
        

        const handleKeyDown = (e: KeyboardEvent) => {
        pressedKeysRef.current.add(e.key.toLowerCase());
        }

        const handleKeyUp = (e: KeyboardEvent) => {
        pressedKeysRef.current.delete(e.key.toLowerCase());
        }

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if(!controller) return;
            controller.setCameraDistanceByWheel(e.deltaY);
        };

        const canvas = props.canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener("wheel", handleWheel);
        return () => {
            canvas.removeEventListener("wheel", handleWheel);
        };

    }, []);

  return (
    <div className="CanvasContainer">
        <canvas
        ref={props.canvasRef}
        onContextMenu={(e)=>e.preventDefault()}
        
        onPointerDown={(e) => handlePointerDown(e)}
        onPointerUp={(e)=>handlePointerUp(e)}
        onPointerCancel={(e)=>handlePointerCancel(e)}
        onPointerMove={e=>handlePointerMove(e)}
        
        className="EditorMainCanvas"
        />
    </div>
  );
}
