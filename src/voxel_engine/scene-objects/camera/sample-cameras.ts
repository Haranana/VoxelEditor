import { Vector3 } from "../../../math/vector3.type";
import { Camera } from "./camera";

export function getSampleCamera(name: string): Camera{
    const camera: Camera = new Camera(name, new Vector3(0,0,0), 1000);
    camera.fovY = 90;
    camera.near = 0.1;
    camera.far = 5000,
    camera.transform = {
        translation: new Vector3(0, 0, -1000),
        scale: new Vector3(1, 1, 1),
        rotation: new Vector3(0, 0, 0),
    },
    camera.projectionType = "perspective",
    camera.pitch = 0.0;
    camera.yaw = 0.0;
    return camera;
}