import { Vector2 } from "../../math/vector/vector2";
import { Vector3 } from "../../math/vector/vector3";
import type { Vector4 } from "../../math/vector/vector4";
import type { Mesh } from "../../render-engine/meshes/Mesh";
import { MeshBuilder, type MeshBuilderVertex } from "../../render-engine/meshes/MeshBuilder";
import  { VoxelObject } from "./voxel-object";
import type { VoxelObjectSelectedArea } from "./voxel/voxel-object-selected-area";

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

    const gridSize: Vector3 = vo.getGridSize()
    const voxelSize = vo.getVoxelSize();
    const objectStart : Vector3 = new Vector3(-gridSize.x/2 , -gridSize.y/2, -gridSize.z/2).hadamard(voxelSize); 
    const chunkSize = vo.getChunkSize();
    
    const startingVoxel = chunkPos.hadamard(chunkSize);
    const endingVoxel = new Vector3(
    Math.min(startingVoxel.x + chunkSize.x, gridSize.x),
    Math.min(startingVoxel.y + chunkSize.y, gridSize.y),
    Math.min(startingVoxel.z + chunkSize.z, gridSize.z)
    );

    for(let x = startingVoxel.x; x < endingVoxel.x; x++){
        for(let y = startingVoxel.y; y < endingVoxel.y; y++){
            for(let z = startingVoxel.z; z < endingVoxel.z;  z++){

                const voxelGridPos = new Vector3(x,y,z);
                const currentVoxelNonEmpty = vo.isVoxelNonEmpty(voxelGridPos);
                const currentVoxelHasNonEmptyGhost = vo.getGhostVoxel(voxelGridPos) instanceof Vector3;
                const chunkPositionOffset = new Vector3(x*voxelSize.x,y*voxelSize.y,z*voxelSize.z);

                if(currentVoxelNonEmpty || currentVoxelHasNonEmptyGhost){
                    const voxelStartPosition = objectStart.addVector(chunkPositionOffset);
                    const getThisVoxelColor = ()=>{
                            return currentVoxelHasNonEmptyGhost? 
                            vo.getGhostVoxel(voxelGridPos)!.color : vo.getVoxel(voxelGridPos)!.color;
                    }                            
                    const voxelColor = getThisVoxelColor();

                    const leftTopFrontPosition = voxelStartPosition.addVector(new Vector3(0,0,voxelSize.z)); //a
                    const rightTopFrontPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,0,voxelSize.z)); //b
                    const rightBottomFrontPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,voxelSize.y,voxelSize.z)); //c
                    const leftBottomFrontPosition = voxelStartPosition.addVector(new Vector3(0,voxelSize.y,voxelSize.z)); //d
                    const leftTopBackPosition = voxelStartPosition.addVector(new Vector3(0,0,0)); //e
                    const rightTopBackPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,0,0)); //f
                    const rightBottomBackPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,voxelSize.y,0)); //g
                    const leftBottomBackPosition = voxelStartPosition.addVector(new Vector3(0,voxelSize.y,0)); //h
                    
                    const voxelVisualEmpty = (gridPos: Vector3)=>{
                        const ghostVoxel = vo.getGhostVoxel(gridPos);
                        if(ghostVoxel!==undefined){
                            return ghostVoxel===null;
                        }else{
                            return !vo.voxelExists(gridPos) || vo.isVoxelEmpty(gridPos);
                        }
                    }

                    //front culling
                    const frontNeighbourVoxel = new Vector3(x,y,z+1);
                    if(voxelVisualEmpty(frontNeighbourVoxel)){
                        addVoxelSideToMesh(leftTopFrontPosition, rightTopFrontPosition, rightBottomFrontPosition, leftBottomFrontPosition, voxelColor);
                    }

                    //back culling
                    const backNeighbourVoxel = new Vector3(x,y,z-1);
                    if(voxelVisualEmpty(backNeighbourVoxel)){
                        addVoxelSideToMesh(rightTopBackPosition, leftTopBackPosition, leftBottomBackPosition, rightBottomBackPosition, voxelColor);
                    }

                    //top culling
                    const topNeighbourVoxel = new Vector3(x,y-1,z);
                    if(voxelVisualEmpty(topNeighbourVoxel)){
                        addVoxelSideToMesh(leftTopBackPosition, rightTopBackPosition, rightTopFrontPosition, leftTopFrontPosition, voxelColor);
                    }

                    //bottom culling
                    const bottomNeighbourVoxel = new Vector3(x,y+1,z);
                    if(voxelVisualEmpty(bottomNeighbourVoxel)){
                        addVoxelSideToMesh(leftBottomFrontPosition, rightBottomFrontPosition, rightBottomBackPosition, leftBottomBackPosition, voxelColor);
                    }

                    //left culling
                    const leftNeighbourVoxel = new Vector3(x-1,y,z);
                    if(voxelVisualEmpty(leftNeighbourVoxel)){
                        addVoxelSideToMesh(leftTopBackPosition, leftTopFrontPosition, leftBottomFrontPosition, leftBottomBackPosition, voxelColor);
                    }

                    //right culling
                    const rightNeighbourVoxel = new Vector3(x+1,y,z);
                    if(voxelVisualEmpty(rightNeighbourVoxel)){
                        addVoxelSideToMesh(rightTopFrontPosition, rightTopBackPosition, rightBottomBackPosition, rightBottomFrontPosition, voxelColor);
                    }                                                       
                }
            }
        }
    }
    return meshBuilder.build();
}

export function generateVoGridMesh(vo: VoxelObject): Mesh{
    
    const epsilon = 0.00;
    const meshBuilder: MeshBuilder = new MeshBuilder({
        topology: "triangle-list",
        attributes:[
            "position",
            "color",
            "quadUV",
        ]
    },
    {
        depthWriteEnabled: false,
        depthCompare: 'less-equal',
        format: 'depth24plus',        
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

    const gridSize: Vector3 = vo.getGridSize()
    const voxelSize = vo.getVoxelSize();
    const objectStart : Vector3 = new Vector3(-gridSize.x/2 , -gridSize.y/2, -gridSize.z/2).hadamard(voxelSize); 

    for(let x = 0; x < gridSize.x; x++){
        for(let y = 0; y < gridSize.y; y++){
            for(let z = 0; z < gridSize.z; z++){

                const voxelGridPos = new Vector3(x,y,z);
                const currentVoxelNonEmpty = vo.isVoxelNonEmpty(voxelGridPos);
                const currentVoxelHasNonEmptyGhost = vo.getGhostVoxel(voxelGridPos) instanceof Vector3;
                const chunkPositionOffset = new Vector3(x*voxelSize.x,y*voxelSize.y,z*voxelSize.z);

                if(currentVoxelNonEmpty || currentVoxelHasNonEmptyGhost){
                    
                    const voxelStartPosition = objectStart.addVector(chunkPositionOffset);
                    const getThisVoxelColor = ()=>{
                            return vo.getObjectGridColor();
                    }                            
                    const voxelColor = getThisVoxelColor();

                    const leftTopFrontPosition = voxelStartPosition.addVector(new Vector3(-epsilon,-epsilon,voxelSize.z+epsilon)); //a
                    const rightTopFrontPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x+epsilon,-epsilon,voxelSize.z+epsilon)); //b
                    const rightBottomFrontPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x+epsilon,voxelSize.y+epsilon,voxelSize.z+epsilon)); //c
                    const leftBottomFrontPosition = voxelStartPosition.addVector(new Vector3(-epsilon,voxelSize.y+epsilon,voxelSize.z+epsilon)); //d
                    const leftTopBackPosition = voxelStartPosition.addVector(new Vector3(-epsilon,-epsilon,-epsilon)); //e
                    const rightTopBackPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x+epsilon,-epsilon,-epsilon)); //f
                    const rightBottomBackPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x+epsilon,voxelSize.y+epsilon,-epsilon)); //g
                    const leftBottomBackPosition = voxelStartPosition.addVector(new Vector3(-epsilon,voxelSize.y+epsilon,-epsilon)); //h
                    
                    const voxelVisualEmpty = (gridPos: Vector3)=>{
                        const ghostVoxel = vo.getGhostVoxel(gridPos);
                        if(ghostVoxel!==undefined){
                            return ghostVoxel===null;
                        }else{
                            return !vo.voxelExists(gridPos) || vo.isVoxelEmpty(gridPos);
                        }
                    }
                    //front culling
                    const frontNeighbourVoxel = new Vector3(x,y,z+1);
                    if(voxelVisualEmpty(frontNeighbourVoxel)){
                        addVoxelSideToMesh(leftTopFrontPosition, rightTopFrontPosition, rightBottomFrontPosition, leftBottomFrontPosition, voxelColor);
                    }

                    //back culling
                    const backNeighbourVoxel = new Vector3(x,y,z-1);
                    if(voxelVisualEmpty(backNeighbourVoxel)){
                        addVoxelSideToMesh(rightTopBackPosition, leftTopBackPosition, leftBottomBackPosition, rightBottomBackPosition, voxelColor);
                    }

                    //top culling
                    const topNeighbourVoxel = new Vector3(x,y-1,z);
                    if(voxelVisualEmpty(topNeighbourVoxel)){
                        addVoxelSideToMesh(leftTopBackPosition, rightTopBackPosition, rightTopFrontPosition, leftTopFrontPosition, voxelColor);
                    }

                    //bottom culling
                    const bottomNeighbourVoxel = new Vector3(x,y+1,z);
                    if(voxelVisualEmpty(bottomNeighbourVoxel)){
                        addVoxelSideToMesh(leftBottomFrontPosition, rightBottomFrontPosition, rightBottomBackPosition, leftBottomBackPosition, voxelColor);
                    }

                    //left culling
                    const leftNeighbourVoxel = new Vector3(x-1,y,z);
                    if(voxelVisualEmpty(leftNeighbourVoxel)){
                        addVoxelSideToMesh(leftTopBackPosition, leftTopFrontPosition, leftBottomFrontPosition, leftBottomBackPosition, voxelColor);
                    }

                    //right culling
                    const rightNeighbourVoxel = new Vector3(x+1,y,z);
                    if(voxelVisualEmpty(rightNeighbourVoxel)){
                        addVoxelSideToMesh(rightTopFrontPosition, rightTopBackPosition, rightBottomBackPosition, rightBottomFrontPosition, voxelColor);
                    }                                                       
                }
            }
        }
    }

    const out = meshBuilder.build();
    return out;
}

export function generateVoBorderGridMesh(vo: VoxelObject): Mesh{
    const meshBuilder: MeshBuilder = new MeshBuilder({
        topology: "triangle-list",
        attributes:[
            "position",
            "color",
            "quadUV",
        ],
        cullMode: "front"
    },
    {
        depthWriteEnabled: false,
        depthCompare: 'less-equal',
        format: 'depth24plus',        
    });

    const color = vo.getBorderColor();

    const addQuad = (A: Vector3,B: Vector3,C: Vector3,D: Vector3) => {
        meshBuilder.addQuad(
            {
            leftTop: {
                    position: A,
                    quadUV: new Vector2(0,0),
                    color,
                },
            rightTop: {
                    position: B,
                    quadUV: new Vector2(1,0),
                    color,
                },
            rightBottom: {
                    position: C,
                    quadUV: new Vector2(1,1),
                    color,
                },
            leftBottom: {
                    position: D,
                    quadUV: new Vector2(0,1),
                    color,
                }
            }
            )};

    const voxelSize = vo.getVoxelSize();
    const gridSize = vo.getGridSize();

    const objectStart = new Vector3(
        -gridSize.x * voxelSize.x / 2,
        -gridSize.y * voxelSize.y / 2,
        -gridSize.z * voxelSize.z / 2
    );

    const pos = (x:number,y:number,z:number)=>
        objectStart.addVector(
            new Vector3(
                x * voxelSize.x,
                y * voxelSize.y,
                z * voxelSize.z
            )
        );
    
    // FRONT
    for(let x = 0; x < gridSize.x; x++){
        for(let y = 0; y < gridSize.y; y++){           
            addQuad(
                pos(x, y, gridSize.z),
                pos(x+1, y, gridSize.z),
                pos(x+1, y+1, gridSize.z),
                pos(x, y+1, gridSize.z),
            );
        }
    }

    // BACK
    for(let x = 0; x < gridSize.x; x++){
        for(let y = 0; y < gridSize.y; y++){

            addQuad(
                pos(x+1, y, 0),
                pos(x, y, 0),
                pos(x, y+1, 0),
                pos(x+1, y+1, 0),
            );
        }
    }

    // TOP
    for(let x = 0; x < gridSize.x; x++){
        for(let z = 0; z < gridSize.z; z++){

            addQuad(
                pos(x, 0, z),
                pos(x+1, 0, z),
                pos(x+1, 0, z+1),
                pos(x, 0, z+1),
            );
        }
    }

    // BOTTOM
    for(let x = 0; x < gridSize.x; x++){
        for(let z = 0; z < gridSize.z; z++){

            addQuad(
                pos(x, gridSize.y, z+1),
                pos(x+1, gridSize.y, z+1),
                pos(x+1, gridSize.y, z),
                pos(x, gridSize.y, z),
            );
        }
    }

    // LEFT
    for(let y = 0; y < gridSize.y; y++){
        for(let z = 0; z < gridSize.z; z++){

            addQuad(
                pos(0, y, z),
                pos(0, y, z+1),
                pos(0, y+1, z+1),
                pos(0, y+1, z),
            );
        }
    }

    // RIGHT
    for(let y = 0; y < gridSize.y; y++){
        for(let z = 0; z < gridSize.z; z++){

            addQuad(
                pos(gridSize.x, y, z+1),
                pos(gridSize.x, y, z),
                pos(gridSize.x, y+1, z),
                pos(gridSize.x, y+1, z+1),
            );
        }
    }

    return meshBuilder.build();    
}

export function generateVoBorderOutlineMesh(vo: VoxelObject): Mesh{
    const meshBuilder: MeshBuilder = new MeshBuilder({
        topology: "triangle-list",
        attributes:[
            "position",
            "color",
            "quadUV",
        ],
        cullMode: "front"
    },
    {
        depthWriteEnabled: false,
        depthCompare: 'less-equal',
        format: 'depth24plus',        
    });
    const epsilon = 0;
    const borderColor = vo.getBorderColor();

    const addQuad = (
        topLeft: Vector3,
        topRight: Vector3,
        bottomRight: Vector3,
        bottomLeft: Vector3,
    ) => {

        meshBuilder.addQuad({
            leftTop: {
                position: topLeft,
                quadUV: new Vector2(0,0),
                color: borderColor,
            },
            rightTop: {
                position: topRight,
                quadUV: new Vector2(1,0),
                color: borderColor,
            },
            rightBottom: {
                position: bottomRight,
                quadUV: new Vector2(1,1),
                color: borderColor,
            },
            leftBottom:{
                position: bottomLeft,
                quadUV: new Vector2(0,1),
                color: borderColor,
            }}
        );
    };

    const gridSize = vo.getGridSize();
    const voxelSize = vo.getVoxelSize();
    const objectStart = new Vector3(
        -(gridSize.x * voxelSize.x) / 2,
        -(gridSize.y * voxelSize.y) / 2,
        -(gridSize.z * voxelSize.z) / 2
    );

    const BorderCubeSize: Vector3 = voxelSize.hadamard(gridSize);

    const leftTopFront = objectStart.addVector(
        new Vector3(0,0,BorderCubeSize.z).addVector(new Vector3(-epsilon,-epsilon,epsilon))
    );//A

    const rightTopFront = objectStart.addVector(
        new Vector3(BorderCubeSize.x,0,BorderCubeSize.z).addVector(new Vector3(epsilon,-epsilon,epsilon))
    );//B

    const rightBottomFront = objectStart.addVector(
        new Vector3(BorderCubeSize.x,BorderCubeSize.y,BorderCubeSize.z).addVector(new Vector3(epsilon,epsilon,epsilon))
    );//C

    const leftBottomFront = objectStart.addVector(
        new Vector3(0,BorderCubeSize.y,BorderCubeSize.z).addVector(new Vector3(-epsilon,epsilon,epsilon))
    );//D

    const leftTopBack = objectStart.addVector(
        new Vector3(0,0,0).addVector(new Vector3(-epsilon,-epsilon,-epsilon))
    );//E

    const rightTopBack = objectStart.addVector(
        new Vector3(BorderCubeSize.x,0,0).addVector(new Vector3(epsilon,-epsilon,-epsilon))
    );//F

    const rightBottomBack = objectStart.addVector(
        new Vector3(BorderCubeSize.x,BorderCubeSize.y,0).addVector(new Vector3(epsilon,epsilon,-epsilon))
    );//G

    const leftBottomBack = objectStart.addVector(
        new Vector3(0,BorderCubeSize.y,0).addVector(new Vector3(-epsilon,epsilon,-epsilon))
    );//H

    // front
    addQuad(leftTopFront, rightTopFront, rightBottomFront, leftBottomFront);

    // back
    addQuad(rightTopBack, leftTopBack, leftBottomBack, rightBottomBack);

    // top
    addQuad(leftTopBack, rightTopBack, rightTopFront, leftTopFront);

    // bottom
    addQuad(leftBottomFront, rightBottomFront, rightBottomBack, leftBottomBack);

    // left
    addQuad(leftTopBack, leftTopFront, leftBottomFront, leftBottomBack);

    // right
    addQuad(rightTopFront, rightTopBack, rightBottomBack, rightBottomFront);

    return meshBuilder.build();   
}

export function generateVoSelectedAreaMesh(vo: VoxelObject, areaType: 'dynamic'|'static'): Mesh{
    const meshBuilder = new MeshBuilder({
        topology: "triangle-list",
        attributes: [
            "position",
            "color",
            "quadUV",
        ]
    },{
        depthWriteEnabled: false,
        depthCompare: 'less-equal',
        format: 'depth24plus',
    });

    const addVoxelSideToMesh = (
        leftTopPosition: Vector3,
        rightTopPosition: Vector3,
        rightBottomPosition: Vector3,
        leftBottomPosition: Vector3,
        color: Vector4
    ) => {

        meshBuilder.addQuad(
            {
                leftTop: {
                position: leftTopPosition,
                quadUV: new Vector2(0,0),
                color,
            },
            rightTop:{
                position: rightTopPosition,
                quadUV: new Vector2(1,0),
                color,
            },
            rightBottom: {
                position: rightBottomPosition,
                quadUV: new Vector2(1,1),
                color,
            },
            leftBottom: {
                position: leftBottomPosition,
                quadUV: new Vector2(0,1),
                color,
            }}
        );
    };

    const voxelSize = vo.getVoxelSize();
    const gridSize = vo.getGridSize();
    const objectStart = new Vector3(
        (-gridSize.x / 2)*voxelSize.x,
        (-gridSize.y / 2)*voxelSize.y,
        (-gridSize.z / 2)*voxelSize.z
    );

    const selectedArea: VoxelObjectSelectedArea = vo.selectedAreas.get(areaType)!;
    const voxelsColor: Vector4 = selectedArea.color;
    const voxels: Vector3[] = selectedArea.getGridPositions();
    
    voxels.forEach(gridPosition => {        
        const voxelStartPosition = objectStart.addVector(gridPosition.hadamard(voxelSize))

        const leftTopFrontPosition = voxelStartPosition.addVector(new Vector3(0,0,voxelSize.z));
        const rightTopFrontPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,0,voxelSize.z));
        const rightBottomFrontPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,voxelSize.y,voxelSize.z));
        const leftBottomFrontPosition = voxelStartPosition.addVector(new Vector3(0,voxelSize.y,voxelSize.z));

        const leftTopBackPosition = voxelStartPosition.addVector(new Vector3(0,0,0));
        const rightTopBackPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,0,0));
        const rightBottomBackPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,voxelSize.y,0));
        const leftBottomBackPosition = voxelStartPosition.addVector(new Vector3(0,voxelSize.y,0));

        const selected = (gridPosition: Vector3, selectedArea: VoxelObjectSelectedArea)=>{
            return selectedArea.hasGridPosition(gridPosition);
        }
        const occupied = (gridPosition: Vector3)=>{
            return vo.isVoxelNonEmpty(gridPosition) || vo.getGhostVoxel(gridPosition)!=null;
        }

        let neighbour = new Vector3(0,0,0);

        // front
        neighbour = gridPosition.addVector(new Vector3(0,0,1)); 
        if(!occupied(neighbour) && !selected(neighbour, selectedArea)){
            addVoxelSideToMesh(
                leftTopFrontPosition,
                rightTopFrontPosition,
                rightBottomFrontPosition,
                leftBottomFrontPosition,
                voxelsColor
            );
        }

        // back
        neighbour = gridPosition.addVector(new Vector3(0,0,-1)); 
        if(!occupied(neighbour) && !selected(neighbour, selectedArea)){
            addVoxelSideToMesh(
                rightTopBackPosition,
                leftTopBackPosition,
                leftBottomBackPosition,
                rightBottomBackPosition,
                voxelsColor
            );
        }

        // top
        neighbour = gridPosition.addVector(new Vector3(0,-1,0)); 
        if(!occupied(neighbour) && !selected(neighbour, selectedArea)){
            addVoxelSideToMesh(
                leftTopBackPosition,
                rightTopBackPosition,
                rightTopFrontPosition,
                leftTopFrontPosition,
                voxelsColor
            );
        }

        // bottom
        neighbour = gridPosition.addVector(new Vector3(0,1,0)); 
        if(!occupied(neighbour) && !selected(neighbour, selectedArea)){
            addVoxelSideToMesh(
                leftBottomFrontPosition,
                rightBottomFrontPosition,
                rightBottomBackPosition,
                leftBottomBackPosition,
                voxelsColor
            );
        }

        // left
        neighbour = gridPosition.addVector(new Vector3(-1,0,0)); 
        if(!occupied(neighbour) && !selected(neighbour, selectedArea)){
            addVoxelSideToMesh(
                leftTopBackPosition,
                leftTopFrontPosition,
                leftBottomFrontPosition,
                leftBottomBackPosition,
                voxelsColor
            );
        }

        // right
        neighbour = gridPosition.addVector(new Vector3(1,0,0)); 
        if(!occupied(neighbour) && !selected(neighbour, selectedArea)){
            addVoxelSideToMesh(
                rightTopFrontPosition,
                rightTopBackPosition,
                rightBottomBackPosition,
                rightBottomFrontPosition,
                voxelsColor
            );
        }
    });

    return meshBuilder.build();    
}