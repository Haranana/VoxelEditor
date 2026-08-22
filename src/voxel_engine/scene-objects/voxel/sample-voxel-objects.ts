import { Vector3 } from "../../../math/vector3.type";
import { Vector4 } from "../../../math/vector4.type";
import { VoxelObject } from "./voxel-object";

// collection of functions returning sample voxel objects, mainly as a starting object or for debugging 

export function getBasicSampleVoxelObject(name: string = "SampleObject"){
    const defaultColor: Vector4 = new Vector4(101, 204, 224,255);
    const out: VoxelObject = new VoxelObject(name, new Vector3(16,16,16));
    out.setVoxelSize(40);

    for(let x = 0; x < 16; x++){
        for(let y=0; y<16; y++){
            for(let z=0; z<16; z++){
                if(x>2 && y>2 && z>2 && x<14 && y<14 && z<14){
                out.setVoxel(new Vector3(x,y,z), {
                    color: defaultColor
                })
                }
            }
        }
    }
    return out;
}

export function getFlipRotationTestSampleVoxelObject(name: string = "SampleObject"){
    const defaultColor: Vector4 = new Vector4(101, 204, 224,255);
    const out: VoxelObject = new VoxelObject(name, new Vector3(16,16,16));
    out.setVoxelSize(40);

    for(let x = 0; x < 16; x++){
        for(let y=0; y<16; y++){
            for(let z=0; z<16; z++){
                if(x>6 && y>6 && z>6 && x<10 && y<11 && z<10){
                out.setVoxel(new Vector3(x,y,z), {
                    color: defaultColor
                })
                }
            }
        }
    }
    out.setVoxel(new Vector3(8,6,8),{
        color: new Vector4(25,255,25,255),
    });
    out.setVoxel(new Vector3(8,11,8),{
        color: new Vector4(255,25,25,255),
    });    
    out.setVoxel(new Vector3(8,8,10),{
        color: new Vector4(255,255,192,255),
    });
    out.setVoxel(new Vector3(8,8,6),{
        color: new Vector4(255,192,255,255),
    });
    out.setVoxel(new Vector3(6,8,8),{
        color: new Vector4(128,255,255,255),
    });
    out.setVoxel(new Vector3(10,8,8),{
        color: new Vector4(255,128,255,255),
    });    
     
    return out;
}