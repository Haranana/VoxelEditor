import { Vector2 } from "../../../math/vector/vector2";
import { Vector3 } from "../../../math/vector/vector3";
import { Vector4 } from "../../../math/vector/vector4";
import type { Mesh } from "../../../render-engine/meshes/Mesh";
import { MeshBuilder, type MeshBuilderVertex } from "../../../render-engine/meshes/MeshBuilder";
import type { VoxelObject } from "../voxel-object";
import type { VoxelObjectSelectedArea } from "./voxel-object-selected-area";
// collection of functions for creating Meshes of VoxelObject and its associated elements 

export function generateVoMesh(vo: VoxelObject): Mesh{
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

    const objectStart : Vector3 = new Vector3(-vo.getGridSize().x/2 , -vo.getGridSize().y/2, -vo.getGridSize().z/2) 
    for(let x = 0; x < vo.getGridSize().x; x++){
        for(let y = 0; y < vo.getGridSize().y; y++){
            for(let z = 0; z < vo.getGridSize().z; z++){
                const currentVoxelCoords = new Vector3(x,y,z);
                const currentVoxelNonEmpty = vo.isVoxelNonEmpty(currentVoxelCoords);
                const currentVoxelHasGhost = vo.getGhostVoxel(currentVoxelCoords)!==undefined;
                if(currentVoxelNonEmpty || currentVoxelHasGhost){
                    const voxelStartPosition = new Vector3( (objectStart.x +x)*vo.getVoxelSize().x , (objectStart.y+y)*vo.getVoxelSize().y, (objectStart.z+z)*vo.getVoxelSize().z);
                    
                    const getThisVoxelColor = (voxelId: Vector3)=>{

                            return vo.hasGhostVoxel(voxelId)? 
                            vo.getGhostVoxel(voxelId)!.color : vo.getVoxel(voxelId)!.color;
                    }
                    
                    const voxelSize = vo.getVoxelSize();
                    const voxelColor = getThisVoxelColor(currentVoxelCoords);

                    const leftTopFrontPosition = voxelStartPosition.addVector(new Vector3(0,0,voxelSize.z)); //a
                    const rightTopFrontPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,0,voxelSize.y)); //b
                    const rightBottomFrontPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,voxelSize.y,voxelSize.z)); //c
                    const leftBottomFrontPosition = voxelStartPosition.addVector(new Vector3(0,voxelSize.y,voxelSize.z)); //d
                    const leftTopBackPosition = voxelStartPosition.addVector(new Vector3(0,0,0)); //e
                    const rightTopBackPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,0,0)); //f
                    const rightBottomBackPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,voxelSize.y,0)); //g
                    const leftBottomBackPosition = voxelStartPosition.addVector(new Vector3(0,voxelSize.y,0)); //h
                    
                    //front culling
                    const frontNeighbourVoxel = new Vector3(x,y,z+1);
                    if(!vo.isVoxelNonEmpty(frontNeighbourVoxel) && !vo.hasGhostVoxel(frontNeighbourVoxel)){
                        addVoxelSideToMesh(leftTopFrontPosition, rightTopFrontPosition, rightBottomFrontPosition, leftBottomFrontPosition, voxelColor);
                    }

                    //back culling
                    const backNeighbourVoxel = new Vector3(x,y,z-1);
                    if(!vo.isVoxelNonEmpty(backNeighbourVoxel) && !vo.hasGhostVoxel(backNeighbourVoxel)){
                        addVoxelSideToMesh(rightTopBackPosition, leftTopBackPosition, leftBottomBackPosition, rightBottomBackPosition, voxelColor);
                    }

                    //top culling
                    const topNeighbourVoxel = new Vector3(x,y-1,z);
                    if(!vo.isVoxelNonEmpty(topNeighbourVoxel) && !vo.hasGhostVoxel(topNeighbourVoxel)){
                        addVoxelSideToMesh(leftTopBackPosition, rightTopBackPosition, rightTopFrontPosition, leftTopFrontPosition, voxelColor);
                    }

                    //bottom culling
                    const bottomNeighbourVoxel = new Vector3(x,y+1,z);
                    if(!vo.isVoxelNonEmpty(bottomNeighbourVoxel) && !vo.hasGhostVoxel(bottomNeighbourVoxel)){
                        addVoxelSideToMesh(leftBottomFrontPosition, rightBottomFrontPosition, rightBottomBackPosition, leftBottomBackPosition, voxelColor);
                    }

                    //left culling
                    const leftNeighbourVoxel = new Vector3(x-1,y,z);
                    if(!vo.isVoxelNonEmpty(leftNeighbourVoxel) && !vo.hasGhostVoxel(leftNeighbourVoxel)){
                        addVoxelSideToMesh(leftTopBackPosition, leftTopFrontPosition, leftBottomFrontPosition, leftBottomBackPosition, voxelColor);
                    }

                    //right culling
                    const rightNeighbourVoxel = new Vector3(x+1,y,z);
                    if(!vo.isVoxelNonEmpty(rightNeighbourVoxel) && !vo.hasGhostVoxel(rightNeighbourVoxel)){
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

    const addVoxelSideToMesh = (
        leftTopPosition: Vector3,
        rightTopPosition: Vector3,
        rightBottomPosition: Vector3,
        leftBottomPosition: Vector3,
        color: Vector4
    ) =>{
        const leftTop : MeshBuilderVertex = {
            position: leftTopPosition,
            quadUV: new Vector2(0,0), 
            color,
        };

        const rightTop: MeshBuilderVertex = {
            position: rightTopPosition,
            quadUV: new Vector2(1,0), 
            color,
        };

        const rightBottom: MeshBuilderVertex = {
            position: rightBottomPosition,
            quadUV: new Vector2(1,1), 
            color,
        };

        const leftBottom: MeshBuilderVertex = {
            position: leftBottomPosition,
            quadUV: new Vector2(0,1), 
            color,
        };

        meshBuilder.addQuad({
            leftTop,
            rightTop,
            rightBottom,
            leftBottom
        });
    };

    const objectStart : Vector3 = new Vector3(
        -vo.getGridSize().x/2,
        -vo.getGridSize().y/2,
        -vo.getGridSize().z/2
    );

    for(let x = 0; x < vo.getGridSize().x; x++){
        for(let y = 0; y < vo.getGridSize().y; y++){
            for(let z = 0; z < vo.getGridSize().z; z++){

                const currentVoxelCoords = new Vector3(x,y,z);

                const currentVoxelNonEmpty =
                    vo.isVoxelNonEmpty(currentVoxelCoords);

                const currentVoxelHasGhost =
                    vo.hasGhostVoxel(currentVoxelCoords);

                // Normalny voxel LUB ghost voxel
                if(currentVoxelNonEmpty || currentVoxelHasGhost){

                    const voxelStartPosition = new Vector3(
                        (objectStart.x + x) * vo.getVoxelSize().x,
                        (objectStart.y + y) * vo.getVoxelSize().y,
                        (objectStart.z + z) * vo.getVoxelSize().z
                    );

                    const voxelSize = vo.getVoxelSize();
                    const voxelColor = vo.getObjectGridColor();

                    const leftTopFrontPosition =
                        voxelStartPosition.addVector(
                            new Vector3(
                                0-epsilon,
                                0-epsilon,
                                voxelSize.z+epsilon
                            )
                        );

                    const rightTopFrontPosition =
                        voxelStartPosition.addVector(
                            new Vector3(
                                voxelSize.x+epsilon,
                                0-epsilon,
                                voxelSize.z+epsilon
                            )
                        );

                    const rightBottomFrontPosition =
                        voxelStartPosition.addVector(
                            new Vector3(
                                voxelSize.x+epsilon,
                                voxelSize.y+epsilon,
                                voxelSize.z+epsilon
                            )
                        );

                    const leftBottomFrontPosition =
                        voxelStartPosition.addVector(
                            new Vector3(
                                0-epsilon,
                                voxelSize.y+epsilon,
                                voxelSize.z+epsilon
                            )
                        );

                    const leftTopBackPosition =
                        voxelStartPosition.addVector(
                            new Vector3(
                                0-epsilon,
                                0-epsilon,
                                0-epsilon
                            )
                        );

                    const rightTopBackPosition =
                        voxelStartPosition.addVector(
                            new Vector3(
                                voxelSize.x+epsilon,
                                0-epsilon,
                                0-epsilon
                            )
                        );

                    const rightBottomBackPosition =
                        voxelStartPosition.addVector(
                            new Vector3(
                                voxelSize.x+epsilon,
                                voxelSize.y+epsilon,
                                0-epsilon
                            )
                        );

                    const leftBottomBackPosition =
                        voxelStartPosition.addVector(
                            new Vector3(
                                0-epsilon,
                                voxelSize.y+epsilon,
                                0-epsilon
                            )
                        );

                    // front culling
                    const frontNeighbourVoxel = new Vector3(x,y,z+1);

                    if(
                        !vo.isVoxelNonEmpty(frontNeighbourVoxel) &&
                        !vo.hasGhostVoxel(frontNeighbourVoxel)
                    ){
                        addVoxelSideToMesh(
                            leftTopFrontPosition,
                            rightTopFrontPosition,
                            rightBottomFrontPosition,
                            leftBottomFrontPosition,
                            voxelColor
                        );
                    }

                    // back culling
                    const backNeighbourVoxel = new Vector3(x,y,z-1);

                    if(
                        !vo.isVoxelNonEmpty(backNeighbourVoxel) &&
                        !vo.hasGhostVoxel(backNeighbourVoxel)
                    ){
                        addVoxelSideToMesh(
                            rightTopBackPosition,
                            leftTopBackPosition,
                            leftBottomBackPosition,
                            rightBottomBackPosition,
                            voxelColor
                        );
                    }

                    // top culling
                    const topNeighbourVoxel = new Vector3(x,y-1,z);

                    if(
                        !vo.isVoxelNonEmpty(topNeighbourVoxel) &&
                        !vo.hasGhostVoxel(topNeighbourVoxel)
                    ){
                        addVoxelSideToMesh(
                            leftTopBackPosition,
                            rightTopBackPosition,
                            rightTopFrontPosition,
                            leftTopFrontPosition,
                            voxelColor
                        );
                    }

                    // bottom culling
                    const bottomNeighbourVoxel = new Vector3(x,y+1,z);

                    if(
                        !vo.isVoxelNonEmpty(bottomNeighbourVoxel) &&
                        !vo.hasGhostVoxel(bottomNeighbourVoxel)
                    ){
                        addVoxelSideToMesh(
                            leftBottomFrontPosition,
                            rightBottomFrontPosition,
                            rightBottomBackPosition,
                            leftBottomBackPosition,
                            voxelColor
                        );
                    }

                    // left culling
                    const leftNeighbourVoxel = new Vector3(x-1,y,z);

                    if(
                        !vo.isVoxelNonEmpty(leftNeighbourVoxel) &&
                        !vo.hasGhostVoxel(leftNeighbourVoxel)
                    ){
                        addVoxelSideToMesh(
                            leftTopBackPosition,
                            leftTopFrontPosition,
                            leftBottomFrontPosition,
                            leftBottomBackPosition,
                            voxelColor
                        );
                    }

                    // right culling
                    const rightNeighbourVoxel = new Vector3(x+1,y,z);

                    if(
                        !vo.isVoxelNonEmpty(rightNeighbourVoxel) &&
                        !vo.hasGhostVoxel(rightNeighbourVoxel)
                    ){
                        addVoxelSideToMesh(
                            rightTopFrontPosition,
                            rightTopBackPosition,
                            rightBottomBackPosition,
                            rightBottomFrontPosition,
                            voxelColor
                        );
                    }
                }
            }
        }
    }

    return meshBuilder.build();
}

export function generateVoBorderGridMesh(vo: VoxelObject): Mesh {

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

    const step = vo.getVoxelSize();
    const gridSize = vo.getGridSize();

    const objectStart = new Vector3(
        -(gridSize.x  ) * step.x / 2,
        -(gridSize.y  ) * step.y / 2,
        -(gridSize.z  ) * step.z / 2
    );

    const pos = (x:number,y:number,z:number)=>
        objectStart.addVector(
            new Vector3(
                x * step.x,
                y * step.y,
                z * step.z
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

export function generateVoSelectedAreaMesh(vo: VoxelObject, selectedArea: VoxelObjectSelectedArea): Mesh {

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

    const objectStart = new Vector3(
        -vo.getGridSize().x / 2,
        -vo.getGridSize().y / 2,
        -vo.getGridSize().z / 2
    );

    selectedArea.getGridPositions().forEach(voxelCoords => {

        const x = voxelCoords.x;
        const y = voxelCoords.y;
        const z = voxelCoords.z;

        const voxelStartPosition = new Vector3(
            (objectStart.x + x) * vo.getVoxelSize().x,
            (objectStart.y + y) * vo.getVoxelSize().y,
            (objectStart.z + z) * vo.getVoxelSize().z
        );

        const voxelSize = vo.getVoxelSize();
        const voxelColor = selectedArea.color;

        const leftTopFrontPosition = voxelStartPosition.addVector(new Vector3(0,0,voxelSize.z));
        const rightTopFrontPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,0,voxelSize.z));
        const rightBottomFrontPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,voxelSize.y,voxelSize.z));
        const leftBottomFrontPosition = voxelStartPosition.addVector(new Vector3(0,voxelSize.y,voxelSize.z));

        const leftTopBackPosition = voxelStartPosition.addVector(new Vector3(0,0,0));
        const rightTopBackPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,0,0));
        const rightBottomBackPosition = voxelStartPosition.addVector(new Vector3(voxelSize.x,voxelSize.y,0));
        const leftBottomBackPosition = voxelStartPosition.addVector(new Vector3(0,voxelSize.y,0));

        
        const selected = (x:number,y:number,z:number)=>{
            const selectedV = new Vector3(x,y,z)
            return selectedArea.getGridPositions().find((v)=>v.equals(selectedV))!==undefined;
        }

        const occupied = (x:number,y:number,z:number)=>
            vo.isVoxelNonEmpty(new Vector3(x,y,z));

        // front
        if(!occupied(x,y,z+1) && !selected(x,y,z+1)){
            addVoxelSideToMesh(
                leftTopFrontPosition,
                rightTopFrontPosition,
                rightBottomFrontPosition,
                leftBottomFrontPosition,
                voxelColor
            );
        }

        // back
        if(!occupied(x,y,z-1) && !selected(x,y,z-1)){
            addVoxelSideToMesh(
                rightTopBackPosition,
                leftTopBackPosition,
                leftBottomBackPosition,
                rightBottomBackPosition,
                voxelColor
            );
        }

        // top
        if(!occupied(x,y-1,z) && !selected(x,y-1,z)){
            addVoxelSideToMesh(
                leftTopBackPosition,
                rightTopBackPosition,
                rightTopFrontPosition,
                leftTopFrontPosition,
                voxelColor
            );
        }

        // bottom
        if(!occupied(x,y+1,z) && !selected(x,y+1,z)){
            addVoxelSideToMesh(
                leftBottomFrontPosition,
                rightBottomFrontPosition,
                rightBottomBackPosition,
                leftBottomBackPosition,
                voxelColor
            );
        }

        // left
        if(!occupied(x-1,y,z) && !selected(x-1,y,z)){
            addVoxelSideToMesh(
                leftTopBackPosition,
                leftTopFrontPosition,
                leftBottomFrontPosition,
                leftBottomBackPosition,
                voxelColor
            );
        }

        // right
        if(!occupied(x+1,y,z) && !selected(x+1,y,z)){
            addVoxelSideToMesh(
                rightTopFrontPosition,
                rightTopBackPosition,
                rightBottomBackPosition,
                rightBottomFrontPosition,
                voxelColor
            );
        }

    });

    return meshBuilder.build();
}

export function generateVoBorderOutlineMesh(vo: VoxelObject): Mesh {

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

    const borderColor = vo.getBorderColor();
    const borderOffset = 0;
    const gridSize = vo.getGridSize();
    const voxelSize = vo.getVoxelSize();

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

    const objectStart = new Vector3(
        -(gridSize.x * voxelSize.x) / 2,
        -(gridSize.y * voxelSize.y) / 2,
        -(gridSize.z * voxelSize.z) / 2
    );

    const voxelSizeX = voxelSize.x * gridSize.x;
    const voxelSizeY = voxelSize.y * gridSize.y;
    const voxelSizeZ = voxelSize.z * gridSize.z;

    const A = objectStart.addVector(
        new Vector3(0,0,voxelSizeZ)
            .addVector(new Vector3(-borderOffset,-borderOffset,borderOffset))
    );

    const B = objectStart.addVector(
        new Vector3(voxelSizeX,0,voxelSizeZ)
            .addVector(new Vector3(borderOffset,-borderOffset,borderOffset))
    );

    const C = objectStart.addVector(
        new Vector3(voxelSizeX,voxelSizeY,voxelSizeZ)
            .addVector(new Vector3(borderOffset,borderOffset,borderOffset))
    );

    const D = objectStart.addVector(
        new Vector3(0,voxelSizeY,voxelSizeZ)
            .addVector(new Vector3(-borderOffset,borderOffset,borderOffset))
    );

    const E = objectStart.addVector(
        new Vector3(0,0,0)
            .addVector(new Vector3(-borderOffset,-borderOffset,-borderOffset))
    );

    const F = objectStart.addVector(
        new Vector3(voxelSizeX,0,0)
            .addVector(new Vector3(borderOffset,-borderOffset,-borderOffset))
    );

    const G = objectStart.addVector(
        new Vector3(voxelSizeX,voxelSizeY,0)
            .addVector(new Vector3(borderOffset,borderOffset,-borderOffset))
    );

    const H = objectStart.addVector(
        new Vector3(0,voxelSizeY,0)
            .addVector(new Vector3(-borderOffset,borderOffset,-borderOffset))
    );

    // front
    addQuad(A, B, C, D);

    // back
    addQuad(F, E, H, G);

    // top
    addQuad(E, F, B, A);

    // bottom
    addQuad(D, C, G, H);

    // left
    addQuad(E, A, D, H);

    // right
    addQuad(B, F, G, C);

    return meshBuilder.build();
}