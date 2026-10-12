import { Vector3 } from "../../math/vector/vector3";
import type { Mesh } from "../../render-engine/meshes/Mesh";
import { MeshBuilder, type MeshBuilderVertex } from "../../render-engine/meshes/MeshBuilder";
import type { VoxelObject } from "./voxel-object";

export function generateVoChunkMesh(vo: VoxelObject, chunkPos: Vector3): Mesh{
    const meshBuilder: MeshBuilder = new MeshBuilder({
        topology: "triangle-list",
        attributes:[
            "position",
            "color",
            "normal",
        ]
    });

    const addVoxelSideToMesh = (leftTopPosition: Vector3, rightTopPosition: Vector3, rightBottomPosition: Vector3, leftBottomPosition: Vector3, color: Vector4) =>{
        const leftTop : MeshBuilderVertex = {
            position: leftTopPosition,             
            color,
        }
        const rightTop: MeshBuilderVertex = {
            position: rightTopPosition,            
            color,
        }
        const rightBottom: MeshBuilderVertex = {
            position: rightBottomPosition, 
            color,
        }
        const leftBottom: MeshBuilderVertex = {
            position: leftBottomPosition,             
            color,
        }
        meshBuilder.addQuad({leftTop,rightTop,rightBottom,leftBottom})
    }

    const objectStart : Vector3 = new Vector3(-vo.size.x/2 , -vo.size.y/2, -vo.size.z/2) 
    const chunkSize = vo.getChunkSize();
    const chunkStart =  objectStart.addVector(chunkPos.hadamard(chunkSize));
    for(let x = 0; x < chunkSize.x; x++){
        for(let y = 0; y < chunkSize.y; y++){
            for(let z = 0; z < chunkSize.z; z++){
                const currentVoxelCoords = new Vector3(x,y,z);
                const currentVoxelNonEmpty = vo.isVoxelNonEmpty(currentVoxelCoords);
                const currentVoxelHasGhost = vo.ghostVoxels.has(currentVoxelCoords.toString());
                if(currentVoxelNonEmpty || currentVoxelHasGhost){
                    const voxelStartPosition = new Vector3( (objectStart.x +x)*vo.getVoxelSize() , (objectStart.y+y)*vo.getVoxelSize(), (objectStart.z+z)*vo.getVoxelSize());
                    
                    const getThisVoxelColor = (voxelId: Vector3)=>{
                            return vo.ghostVoxels.has(voxelId.toString())? 
                            vo.ghostVoxels.get(voxelId.toString())!.color : vo.getVoxel(voxelId)!.color;
                    }
                    
                    const voxelSize = vo.getVoxelSize();
                    const voxelColor = getThisVoxelColor(currentVoxelCoords);

                    const leftTopFrontPosition = voxelStartPosition.addVector(new Vector3(0,0,voxelSize)); //a
                    const rightTopFrontPosition = voxelStartPosition.addVector(new Vector3(voxelSize,0,voxelSize)); //b
                    const rightBottomFrontPosition = voxelStartPosition.addVector(new Vector3(voxelSize,voxelSize,voxelSize)); //c
                    const leftBottomFrontPosition = voxelStartPosition.addVector(new Vector3(0,voxelSize,voxelSize)); //d
                    const leftTopBackPosition = voxelStartPosition.addVector(new Vector3(0,0,0)); //e
                    const rightTopBackPosition = voxelStartPosition.addVector(new Vector3(voxelSize,0,0)); //f
                    const rightBottomBackPosition = voxelStartPosition.addVector(new Vector3(voxelSize,voxelSize,0)); //g
                    const leftBottomBackPosition = voxelStartPosition.addVector(new Vector3(0,voxelSize,0)); //h
                    
                    //front culling
                    const frontNeighbourVoxel = new Vector3(x,y,z+1);
                    if(!vo.isVoxelNonEmpty(frontNeighbourVoxel) && !vo.ghostVoxels.has(frontNeighbourVoxel.toString())){
                        addVoxelSideToMesh(leftTopFrontPosition, rightTopFrontPosition, rightBottomFrontPosition, leftBottomFrontPosition, voxelColor);
                    }

                    //back culling
                    const backNeighbourVoxel = new Vector3(x,y,z-1);
                    if(!vo.isVoxelNonEmpty(backNeighbourVoxel) && !vo.ghostVoxels.has(backNeighbourVoxel.toString())){
                        addVoxelSideToMesh(rightTopBackPosition, leftTopBackPosition, leftBottomBackPosition, rightBottomBackPosition, voxelColor);
                    }

                    //top culling
                    const topNeighbourVoxel = new Vector3(x,y-1,z);
                    if(!vo.isVoxelNonEmpty(topNeighbourVoxel) && !vo.ghostVoxels.has(topNeighbourVoxel.toString())){
                        addVoxelSideToMesh(leftTopBackPosition, rightTopBackPosition, rightTopFrontPosition, leftTopFrontPosition, voxelColor);
                    }

                    //bottom culling
                    const bottomNeighbourVoxel = new Vector3(x,y+1,z);
                    if(!vo.isVoxelNonEmpty(bottomNeighbourVoxel) && !vo.ghostVoxels.has(bottomNeighbourVoxel.toString())){
                        addVoxelSideToMesh(leftBottomFrontPosition, rightBottomFrontPosition, rightBottomBackPosition, leftBottomBackPosition, voxelColor);
                    }

                    //left culling
                    const leftNeighbourVoxel = new Vector3(x-1,y,z);
                    if(!vo.isVoxelNonEmpty(leftNeighbourVoxel) && !vo.ghostVoxels.has(leftNeighbourVoxel.toString())){
                        addVoxelSideToMesh(leftTopBackPosition, leftTopFrontPosition, leftBottomFrontPosition, leftBottomBackPosition, voxelColor);
                    }

                    //right culling
                    const rightNeighbourVoxel = new Vector3(x+1,y,z);
                    if(!vo.isVoxelNonEmpty(rightNeighbourVoxel) && !vo.ghostVoxels.has(rightNeighbourVoxel.toString())){
                        addVoxelSideToMesh(rightTopFrontPosition, rightTopBackPosition, rightBottomBackPosition, rightBottomFrontPosition, voxelColor);
                    }                                                       
                }
            }
        }
    }
    return meshBuilder.build();
}

export function generateVoGridMesh(vo: VoxelObject): Mesh{
    
}

export function generateVoBorderGridMesh(vo: VoxelObject): Mesh{
    
}

export function generateVoBorderOutline(vo: VoxelObject): Mesh{
    
}

export function generateVoSelectedAreaMesh(vo: VoxelObject): Mesh{
    
}