import { Vector2 } from "./vector/vector2";
import { Vector3 } from "./vector/vector3";

export function degreeToRadians(d: number){
    return d*Math.PI/180;
}

export type clampInput = {
    value: number;
    min?: number;
    max?: number
} 
export function clamp(input: clampInput) {
    if(input.min && input.max){
        return Math.max(input.min, Math.min(input.max, input.value));
    }else if(input.min){
        return Math.max(input.min, input.value);
    }else if(input.max){
        return Math.min(input.max, input.value);
    }else{
        return input.value;
    }

}

export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function gridPosToOffset(gridPos: Vector3, gridSize: Vector3): number{
    return gridPos.x * gridSize.y * gridSize.z + gridPos.y * gridSize.z + gridPos.z;
}

export function gridOffsetToPos(gridOffset: number, gridSize: Vector3): Vector3{
    const x = Math.floor(gridOffset / (gridSize.y * gridSize.z));
    const remainder = gridOffset % (gridSize.y * gridSize.z);

    const y = Math.floor(remainder / gridSize.z);
    const z = remainder % gridSize.z;

    return new Vector3(x, y, z);
}