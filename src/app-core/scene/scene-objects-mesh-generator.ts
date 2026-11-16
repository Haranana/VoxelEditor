import { Vector2 } from "../../math/vector/vector2";
import { Vector3 } from "../../math/vector/vector3";
import { Vector4 } from "../../math/vector/vector4";
import type { Mesh } from "../../render-engine/meshes/Mesh";
import { MeshBuilder, type MeshBuilderBox, type MeshBuilderFaceAttributes, type MeshBuilderQuad, type MeshBuilderTriangle, type MeshBuilderVertex } from "../../render-engine/meshes/MeshBuilder";
import { getPickingInteractionId } from "../picking/picking-interactions";

// collection of functions for creating Meshes of Scene Objects such as gizmos etc

export function generateCameraControllsGizmoMesh(): Mesh{
const builder = new MeshBuilder({
    topology: "triangle-list",
    attributes: ["position","color", "quadUV","pickingInteractionId"],
    frontFace: "cw",
    cullMode: "none",
}, {
    depthWriteEnabled: true,
    depthCompare: "less",
    format: "depth24plus",
});
    const red = new Vector4(192, 32, 32, 255);
    const green = new Vector4(32, 192, 32, 255);
    const blue = new Vector4(32, 32, 192, 255);
    
    const left = -100;
    const right = 100;
    //top and bottom here refers to top/bottom of screen so top->negY, bottom->posY
    const top = -100;
    const bottom = 100;
    const front = 100;
    const back = -100;

    const leftTopFront = new Vector3(left, top, front);
    const rightTopFront = new Vector3(right, top, front);
    const leftBottomFront = new Vector3(left, bottom, front);
    const rightBottomFront = new Vector3(right, bottom, front);
    const leftTopBack = new Vector3(left, top, back);
    const rightTopBack = new Vector3(right, top, back);
    const leftBottomBack = new Vector3(left, bottom, back);
    const rightBottomBack = new Vector3(right, bottom, back);

    const frontPickingInteractionId = getPickingInteractionId('CameraGizmoNegZ');
    const backPickingInteractionId = getPickingInteractionId('CameraGizmoPosZ');
    const topPickingInteractionId = getPickingInteractionId('CameraGizmoPosY');
    const bottomPickingInteractionId = getPickingInteractionId('CameraGizmoNegY');
    const leftPickingInteractionId = getPickingInteractionId('CameraGizmoPosX');
    const rightPickingInteractionId = getPickingInteractionId('CameraGizmoNegX');

    const frontFace: MeshBuilderFaceAttributes = {
        color: blue,
        pickingInteractionId: frontPickingInteractionId
    }

    const backFace: MeshBuilderFaceAttributes = {
        color: blue,
        pickingInteractionId: backPickingInteractionId
    }

    const topFace: MeshBuilderFaceAttributes = {
        color: green,
        pickingInteractionId: topPickingInteractionId
    }

    const bottomFace: MeshBuilderFaceAttributes = {
        color: green,
        pickingInteractionId: bottomPickingInteractionId
    }

    const rightFace: MeshBuilderFaceAttributes = {
        color: red,
        pickingInteractionId: rightPickingInteractionId
    }

    const leftFace: MeshBuilderFaceAttributes = {
        color: red,
        pickingInteractionId: leftPickingInteractionId
    }


    const box : MeshBuilderBox = {
        positions: {
            leftTopFront,
            rightTopFront,
            leftBottomFront,
            rightBottomFront,
            leftTopBack,
            rightTopBack,
            leftBottomBack,
            rightBottomBack,
        },
        faces: {
            front: frontFace,
            back: backFace,
            top: topFace,
            bottom: bottomFace,
            right: rightFace,
            left: leftFace,
        }
    };
    builder.addBox(box)
    const cubeMesh = builder.build();
    return cubeMesh
}

export function generateScaleGizmoMesh(): Mesh {
    const builder: MeshBuilder = new MeshBuilder({
        topology: "triangle-list",
        attributes: ["position", "color", "quadUV", "pickingInteractionId"],
    });

    const red = new Vector4(192, 32, 32, 255);
    const green = new Vector4(32, 192, 32, 255);
    const blue = new Vector4(32, 32, 192, 255);

    const axisLength = 200;
    const axisWidth = 8;
    const handleSize = 24;

    const axisWidthHalf = axisWidth / 2;
    const handleSizeHalf = handleSize / 2;

    const xPosPickId = getPickingInteractionId("ResizeGizmoPosX");
    const xNegPickId = getPickingInteractionId("ResizeGizmoNegX");

    const yPosPickId = getPickingInteractionId("ResizeGizmoPosY");
    const yNegPickId = getPickingInteractionId("ResizeGizmoNegY");

    const zPosPickId = getPickingInteractionId("ResizeGizmoPosZ");
    const zNegPickId = getPickingInteractionId("ResizeGizmoNegZ");

    const addBox = (
        minX: number,
        minY: number,
        minZ: number,
        maxX: number,
        maxY: number,
        maxZ: number,
        color: Vector4,
        pickingInteractionId: number | undefined
    ) => {
        const box: MeshBuilderBox = {
            positions: {
                leftTopFront: new Vector3(minX, minY, maxZ),
                rightTopFront: new Vector3(maxX, minY, maxZ),
                rightBottomFront: new Vector3(maxX, maxY, maxZ),
                leftBottomFront: new Vector3(minX, maxY, maxZ),

                leftTopBack: new Vector3(minX, minY, minZ),
                rightTopBack: new Vector3(maxX, minY, minZ),
                rightBottomBack: new Vector3(maxX, maxY, minZ),
                leftBottomBack: new Vector3(minX, maxY, minZ),
            },

            faces: {
                left: {
                    color,
                    pickingInteractionId,
                },
                right: {
                    color,
                    pickingInteractionId,
                },
                top: {
                    color,
                    pickingInteractionId,
                },
                bottom: {
                    color,
                    pickingInteractionId,
                },
                front: {
                    color,
                    pickingInteractionId,
                },
                back: {
                    color,
                    pickingInteractionId,
                }
            }
        };

        builder.addBox(box);
    };

    const addAxisHandle = (
        axis: "X" | "Y" | "Z",
        positive: boolean,
        color: Vector4,
        pickingInteractionId: number | undefined
    ) => {
        const direction = positive ? 1 : -1;

        const handleCenter = direction * axisLength;

        const shaftStart = positive ? 0 : -axisLength + handleSizeHalf;
        const shaftEnd = positive ? axisLength - handleSizeHalf : 0;

        if (axis === "X") {
            addBox(
                shaftStart,
                -axisWidthHalf,
                -axisWidthHalf,
                shaftEnd,
                axisWidthHalf,
                axisWidthHalf,
                color,
                pickingInteractionId
            );
            addBox(
                handleCenter - handleSizeHalf,
                -handleSizeHalf,
                -handleSizeHalf,
                handleCenter + handleSizeHalf,
                handleSizeHalf,
                handleSizeHalf,
                color,
                pickingInteractionId
            );
        }
        else if (axis === "Y") {
            addBox(
                -axisWidthHalf,
                shaftStart,
                -axisWidthHalf,
                axisWidthHalf,
                shaftEnd,
                axisWidthHalf,
                color,
                pickingInteractionId
            );

            addBox(
                -handleSizeHalf,
                handleCenter - handleSizeHalf,
                -handleSizeHalf,
                handleSizeHalf,
                handleCenter + handleSizeHalf,
                handleSizeHalf,
                color,
                pickingInteractionId
            );
        }
        else {
            addBox(
                -axisWidthHalf,
                -axisWidthHalf,
                shaftStart,
                axisWidthHalf,
                axisWidthHalf,
                shaftEnd,
                color,
                pickingInteractionId
            );

            addBox(
                -handleSizeHalf,
                -handleSizeHalf,
                handleCenter - handleSizeHalf,
                handleSizeHalf,
                handleSizeHalf,
                handleCenter + handleSizeHalf,
                color,
                pickingInteractionId
            );
        }
    };
    addAxisHandle("X", true, red, xPosPickId);
    addAxisHandle("X", false, red, xNegPickId);
    addAxisHandle("Y", true, green, yPosPickId);
    addAxisHandle("Y", false, green, yNegPickId);
    addAxisHandle("Z", true, blue, zPosPickId);
    addAxisHandle("Z", false, blue, zNegPickId);

    return builder.build();
}


export function generateRotateGizmoMesh(): Mesh {
    const builder: MeshBuilder = new MeshBuilder({
        topology: "triangle-list",
        attributes: ["position", "color", "quadUV", "pickingInteractionId"],
    });

    const red = new Vector4(192, 32, 32, 255);
    const green = new Vector4(32, 192, 32, 255);
    const blue = new Vector4(32, 32, 192, 255);

    const ringRadius = 180;
    const tubeRadius = 6;

    const ringSegments = 64;
    const tubeSegments = 8;

    const xPosPickId = getPickingInteractionId("RotateGizmoPosX");
    const xNegPickId = getPickingInteractionId("RotateGizmoNegX");

    const yPosPickId = getPickingInteractionId("RotateGizmoPosY");
    const yNegPickId = getPickingInteractionId("RotateGizmoNegY");

    const zPosPickId = getPickingInteractionId("RotateGizmoPosZ");
    const zNegPickId = getPickingInteractionId("RotateGizmoNegZ");

    const addTriangle = (
        a: Vector3,
        b: Vector3,
        c: Vector3,
        color: Vector4,
        pickingInteractionId: number | undefined
    ) => {
        const makeVertex = (position: Vector3): MeshBuilderVertex => ({
            position,
            color,
            quadUV: new Vector2(0, 0),
            pickingInteractionId,
        });

        const triangle: MeshBuilderTriangle = {
            firstVertex: makeVertex(a),
            secondVertex: makeVertex(b),
            thirdVertex: makeVertex(c),
        };

        builder.addTriangle(triangle);
        const reverseTriangle: MeshBuilderTriangle = {
            firstVertex: makeVertex(c),
            secondVertex: makeVertex(b),
            thirdVertex: makeVertex(a),
        };

        builder.addTriangle(reverseTriangle);
    };

    const getTorusPosition = (
        axis: "X" | "Y" | "Z",
        theta: number,
        phi: number
    ): Vector3 => {
        const radialDistance = ringRadius + tubeRadius * Math.cos(phi);
        const axialDistance = tubeRadius * Math.sin(phi);

        const radialU = Math.cos(theta);
        const radialV = Math.sin(theta);

        if (axis === "X") {
            return new Vector3(
                axialDistance,
                radialDistance * radialU,
                radialDistance * radialV
            );
        }

        if (axis === "Y") {
            return new Vector3(
                radialDistance * radialV,
                axialDistance,
                radialDistance * radialU
            );
        }

        return new Vector3(
            radialDistance * radialU,
            radialDistance * radialV,
            axialDistance
        );
    };

    const addRingHalf = (
        axis: "X" | "Y" | "Z",
        startAngle: number,
        endAngle: number,
        color: Vector4,
        pickingInteractionId: number | undefined
    ) => {
        let i: number;
        let j: number;

        for (i = 0; i < ringSegments / 2; i++) {
            const theta0 = startAngle +
                (endAngle - startAngle) * i / (ringSegments / 2);

            const theta1 = startAngle +
                (endAngle - startAngle) * (i + 1) / (ringSegments / 2);

            for (j = 0; j < tubeSegments; j++) {
                const phi0 = 2 * Math.PI * j / tubeSegments;
                const phi1 = 2 * Math.PI * (j + 1) / tubeSegments;

                const p00 = getTorusPosition(axis, theta0, phi0);
                const p10 = getTorusPosition(axis, theta1, phi0);
                const p11 = getTorusPosition(axis, theta1, phi1);
                const p01 = getTorusPosition(axis, theta0, phi1);

                addTriangle(
                    p00,
                    p10,
                    p11,
                    color,
                    pickingInteractionId
                );
                addTriangle(
                    p00,
                    p11,
                    p01,
                    color,
                    pickingInteractionId
                );
            }
        }
    };

    addRingHalf("X", 0, Math.PI, red, xPosPickId);
    addRingHalf("X", Math.PI, 2 * Math.PI, red, xNegPickId);
    addRingHalf("Y", 0, Math.PI, green, yPosPickId);
    addRingHalf("Y", Math.PI, 2 * Math.PI, green, yNegPickId);
    addRingHalf("Z", 0, Math.PI, blue, zPosPickId);
    addRingHalf("Z", Math.PI, 2 * Math.PI, blue, zNegPickId);

    return builder.build();
}


export function generateMoveGizmoMesh(): Mesh{
    const builder: MeshBuilder = new MeshBuilder({
        topology: "triangle-list",
        attributes: ["position","color", "quadUV","pickingInteractionId"],
    });

    const red = new Vector4(192, 32, 32, 255);
    const green = new Vector4(32, 192, 32, 255);
    const blue = new Vector4(32, 32, 192, 255);
    
    const arrowLength = 200;
    const arrowWidth = 10;
    const arrowheadLength = 50
    const arrowheadWidth = 30

    const arrowWidthHalf = arrowWidth/2;
    const arrowheadWidthHalf = arrowheadWidth/2

    const xMovePickId = getPickingInteractionId('MoveGizmoX');
    const yMovePickId = getPickingInteractionId('MoveGizmoY');
    const zMovePickId = getPickingInteractionId('MoveGizmoZ');

    const xArrowLeftTopFront = new Vector3(arrowWidthHalf,-arrowWidthHalf,arrowWidthHalf);
    const xArrowRightTopFront = new Vector3(arrowWidthHalf+arrowLength,-arrowWidthHalf,arrowWidthHalf);
    const xArrowRightBottomFront = new Vector3(arrowWidthHalf+arrowLength,arrowWidthHalf,arrowWidthHalf);
    const xArrowLeftBottomFront = new Vector3(arrowWidthHalf,arrowWidthHalf,arrowWidthHalf);
    const xArrowLeftTopBack = new Vector3(arrowWidthHalf,-arrowWidthHalf,-arrowWidthHalf);
    const xArrowRightTopBack = new Vector3(arrowWidthHalf+arrowLength,-arrowWidthHalf,-arrowWidthHalf);
    const xArrowRightBottomBack = new Vector3(arrowWidthHalf+arrowLength,arrowWidthHalf,-arrowWidthHalf);
    const xArrowLeftBottomBack = new Vector3(arrowWidthHalf,arrowWidthHalf,-arrowWidthHalf);
    const xArrowBox: MeshBuilderBox = {
        positions: {
            leftTopFront: xArrowLeftTopFront,
            rightTopFront: xArrowRightTopFront,
            rightBottomFront: xArrowRightBottomFront,
            leftBottomFront: xArrowLeftBottomFront,
            leftTopBack: xArrowLeftTopBack,
            rightTopBack: xArrowRightTopBack,
            rightBottomBack: xArrowRightBottomBack,
            leftBottomBack: xArrowLeftBottomBack,

        },
        faces: {
            left: {
                color: red,
                pickingInteractionId: xMovePickId, 
            },
            right: {
                color: red,
                pickingInteractionId: xMovePickId, 
            },
            top: {
                color: red,
                pickingInteractionId: xMovePickId, 
            },
            bottom: {
                color: red,
                pickingInteractionId: xMovePickId, 
            },
            back: {
                color: red,
                pickingInteractionId: xMovePickId, 
            },
            front: {
                color: red,
                pickingInteractionId: xMovePickId, 
            }
        }
    }
    builder.addBox(xArrowBox);

    const xArrowheadBase: MeshBuilderQuad = {
        leftTop:{
            position: new Vector3(arrowLength, -arrowheadWidthHalf, -arrowheadWidthHalf),
            quadUV: new Vector2(0,0),
            color: red,
            pickingInteractionId: xMovePickId,            
        },
        rightTop:{
            position: new Vector3(arrowLength, -arrowheadWidthHalf, arrowheadWidthHalf),
            quadUV: new Vector2(0,0),
            color: red,
            pickingInteractionId: xMovePickId,  
        },
        rightBottom:{
            position: new Vector3(arrowLength, arrowheadWidthHalf,  arrowheadWidthHalf),
            quadUV: new Vector2(0,0),
            color: red,
            pickingInteractionId: xMovePickId,  
        },
        leftBottom:{
            position: new Vector3(arrowLength, arrowheadWidthHalf, -arrowheadWidthHalf),
            quadUV: new Vector2(0,0),
            color: red,
            pickingInteractionId: xMovePickId,  
        }

    }
    builder.addQuad(xArrowheadBase);

    const xArrowheadFrontTriangle: MeshBuilderTriangle = {
        firstVertex: {
            position: new Vector3(arrowLength + arrowheadLength, 0,0),
            color: red,
            quadUV: new Vector2(0,0),
            pickingInteractionId: xMovePickId,
        },
        secondVertex:{
            position: new Vector3(arrowLength, arrowheadWidthHalf, arrowheadWidthHalf),
            color: red,
            quadUV: new Vector2(0,0),
            pickingInteractionId: xMovePickId,
        },
        thirdVertex:{
            position: new Vector3(arrowLength, -arrowheadWidthHalf, arrowheadWidthHalf),
            color: red,
            quadUV: new Vector2(0,0),
            pickingInteractionId: xMovePickId,
        }
    } 
    builder.addTriangle(xArrowheadFrontTriangle);

    const xArrowheadTopTriangle: MeshBuilderTriangle = {
        firstVertex: {
            position: new Vector3(arrowLength + arrowheadLength, 0,0),
            color: red,
            quadUV: new Vector2(0,0),
            pickingInteractionId: xMovePickId,
        },
        secondVertex:{
            position: new Vector3(arrowLength, -arrowheadWidthHalf, arrowheadWidthHalf),
            color: red,
            quadUV: new Vector2(0,0),
            pickingInteractionId: xMovePickId,
        },
        thirdVertex:{
            position: new Vector3(arrowLength, -arrowheadWidthHalf, -arrowheadWidthHalf),
            color: red,
            quadUV: new Vector2(0,0),
            pickingInteractionId: xMovePickId,
        }
    } 
    builder.addTriangle(xArrowheadTopTriangle);

    const xArrowheadBackTriangle: MeshBuilderTriangle = {
        firstVertex: {
            position: new Vector3(arrowLength + arrowheadLength, 0, 0),
            color: red,
            quadUV: new Vector2(0, 0),
            pickingInteractionId: xMovePickId,
        },
        secondVertex: {
            position: new Vector3(arrowLength, -arrowheadWidthHalf, -arrowheadWidthHalf),
            color: red,
            quadUV: new Vector2(0, 0),
            pickingInteractionId: xMovePickId,
        },
        thirdVertex: {
            position: new Vector3(arrowLength, arrowheadWidthHalf, -arrowheadWidthHalf),
            color: red,
            quadUV: new Vector2(0, 0),
            pickingInteractionId: xMovePickId,
        }
    };
    builder.addTriangle(xArrowheadBackTriangle);    

    const xArrowheadBottomTriangle: MeshBuilderTriangle = {
        firstVertex: {
            position: new Vector3(arrowLength + arrowheadLength, 0,0),
            color: red,
            quadUV: new Vector2(0,0),
            pickingInteractionId: xMovePickId,
        },
        secondVertex:{
            position: new Vector3(arrowLength, arrowheadWidthHalf, -arrowheadWidthHalf),
            color: red,
            quadUV: new Vector2(0,0),
            pickingInteractionId: xMovePickId,
        },
        thirdVertex:{
            position: new Vector3(arrowLength, arrowheadWidthHalf, arrowheadWidthHalf),
            color: red,
            quadUV: new Vector2(0,0),
            pickingInteractionId: xMovePickId,
        }
    } 
    builder.addTriangle(xArrowheadBottomTriangle);    

    const yArrowLeftTopFront = new Vector3(
        -arrowWidthHalf,
        arrowWidthHalf,
        arrowWidthHalf
    );

    const yArrowRightTopFront = new Vector3(
        arrowWidthHalf,
        arrowWidthHalf,
        arrowWidthHalf
    );

    const yArrowRightBottomFront = new Vector3(
        arrowWidthHalf,
        arrowWidthHalf + arrowLength,
        arrowWidthHalf
    );

    const yArrowLeftBottomFront = new Vector3(
        -arrowWidthHalf,
        arrowWidthHalf + arrowLength,
        arrowWidthHalf
    );

    const yArrowLeftTopBack = new Vector3(
        -arrowWidthHalf,
        arrowWidthHalf,
        -arrowWidthHalf
    );

    const yArrowRightTopBack = new Vector3(
        arrowWidthHalf,
        arrowWidthHalf,
        -arrowWidthHalf
    );

    const yArrowRightBottomBack = new Vector3(
        arrowWidthHalf,
        arrowWidthHalf + arrowLength,
        -arrowWidthHalf
    );

    const yArrowLeftBottomBack = new Vector3(
        -arrowWidthHalf,
        arrowWidthHalf + arrowLength,
        -arrowWidthHalf
    );

    const yArrowBox: MeshBuilderBox = {
        positions: {
            leftTopFront: yArrowLeftTopFront,
            rightTopFront: yArrowRightTopFront,
            rightBottomFront: yArrowRightBottomFront,
            leftBottomFront: yArrowLeftBottomFront,

            leftTopBack: yArrowLeftTopBack,
            rightTopBack: yArrowRightTopBack,
            rightBottomBack: yArrowRightBottomBack,
            leftBottomBack: yArrowLeftBottomBack,
        },

        faces: {
            left: {
                color: green,
                pickingInteractionId: yMovePickId,
            },
            right: {
                color: green,
                pickingInteractionId: yMovePickId,
            },
            top: {
                color: green,
                pickingInteractionId: yMovePickId,
            },
            bottom: {
                color: green,
                pickingInteractionId: yMovePickId,
            },
            back: {
                color: green,
                pickingInteractionId: yMovePickId,
            },
            front: {
                color: green,
                pickingInteractionId: yMovePickId,
            }
        }
    };

    builder.addBox(yArrowBox);

        const yArrowheadBase: MeshBuilderQuad = {
        leftTop: {
            position: new Vector3(
                -arrowheadWidthHalf,
                arrowLength,
                -arrowheadWidthHalf
            ),
            quadUV: new Vector2(0, 0),
            color: green,
            pickingInteractionId: yMovePickId,
        },

        rightTop: {
            position: new Vector3(
                -arrowheadWidthHalf,
                arrowLength,
                arrowheadWidthHalf
            ),
            quadUV: new Vector2(0, 0),
            color: green,
            pickingInteractionId: yMovePickId,
        },

        rightBottom: {
            position: new Vector3(
                arrowheadWidthHalf,
                arrowLength,
                arrowheadWidthHalf
            ),
            quadUV: new Vector2(0, 0),
            color: green,
            pickingInteractionId: yMovePickId,
        },

        leftBottom: {
            position: new Vector3(
                arrowheadWidthHalf,
                arrowLength,
                -arrowheadWidthHalf
            ),
            quadUV: new Vector2(0, 0),
            color: green,
            pickingInteractionId: yMovePickId,
        }
    };

    builder.addQuad(yArrowheadBase);
        const yArrowheadFrontTriangle: MeshBuilderTriangle = {
        firstVertex: {
            position: new Vector3(0, arrowLength + arrowheadLength, 0),
            color: green,
            quadUV: new Vector2(0, 0),
            pickingInteractionId: yMovePickId,
        },
        secondVertex: {
            position: new Vector3(
                arrowheadWidthHalf,
                arrowLength,
                arrowheadWidthHalf
            ),
            color: green,
            quadUV: new Vector2(0, 0),
            pickingInteractionId: yMovePickId,
        },
        thirdVertex: {
            position: new Vector3(
                -arrowheadWidthHalf,
                arrowLength,
                arrowheadWidthHalf
            ),
            color: green,
            quadUV: new Vector2(0, 0),
            pickingInteractionId: yMovePickId,
        }
    };

    builder.addTriangle(yArrowheadFrontTriangle);


    const yArrowheadTopTriangle: MeshBuilderTriangle = {
        firstVertex: {
            position: new Vector3(0, arrowLength + arrowheadLength, 0),
            color: green,
            quadUV: new Vector2(0, 0),
            pickingInteractionId: yMovePickId,
        },
        secondVertex: {
            position: new Vector3(
                -arrowheadWidthHalf,
                arrowLength,
                arrowheadWidthHalf
            ),
            color: green,
            quadUV: new Vector2(0, 0),
            pickingInteractionId: yMovePickId,
        },
        thirdVertex: {
            position: new Vector3(
                -arrowheadWidthHalf,
                arrowLength,
                -arrowheadWidthHalf
            ),
            color: green,
            quadUV: new Vector2(0, 0),
            pickingInteractionId: yMovePickId,
        }
    };

    builder.addTriangle(yArrowheadTopTriangle);


    const yArrowheadBackTriangle: MeshBuilderTriangle = {
        firstVertex: {
            position: new Vector3(0, arrowLength + arrowheadLength, 0),
            color: green,
            quadUV: new Vector2(0, 0),
            pickingInteractionId: yMovePickId,
        },
        secondVertex: {
            position: new Vector3(
                -arrowheadWidthHalf,
                arrowLength,
                -arrowheadWidthHalf
            ),
            color: green,
            quadUV: new Vector2(0, 0),
            pickingInteractionId: yMovePickId,
        },
        thirdVertex: {
            position: new Vector3(
                arrowheadWidthHalf,
                arrowLength,
                -arrowheadWidthHalf
            ),
            color: green,
            quadUV: new Vector2(0, 0),
            pickingInteractionId: yMovePickId,
        }
    };

    builder.addTriangle(yArrowheadBackTriangle);


    const yArrowheadBottomTriangle: MeshBuilderTriangle = {
        firstVertex: {
            position: new Vector3(0, arrowLength + arrowheadLength, 0),
            color: green,
            quadUV: new Vector2(0, 0),
            pickingInteractionId: yMovePickId,
        },
        secondVertex: {
            position: new Vector3(
                arrowheadWidthHalf,
                arrowLength,
                -arrowheadWidthHalf
            ),
            color: green,
            quadUV: new Vector2(0, 0),
            pickingInteractionId: yMovePickId,
        },
        thirdVertex: {
            position: new Vector3(
                arrowheadWidthHalf,
                arrowLength,
                arrowheadWidthHalf
            ),
            color: green,
            quadUV: new Vector2(0, 0),
            pickingInteractionId: yMovePickId,
        }
    };

    builder.addTriangle(yArrowheadBottomTriangle);

    const zArrowLeftTopFront = new Vector3(
        -arrowWidthHalf,
        -arrowWidthHalf,
        arrowWidthHalf
    );

    const zArrowRightTopFront = new Vector3(
        -arrowWidthHalf,
        -arrowWidthHalf,
        arrowLength,
    );

    const zArrowRightBottomFront = new Vector3(
        -arrowWidthHalf,
        arrowWidthHalf,
        arrowLength
    );

    const zArrowLeftBottomFront = new Vector3(
        -arrowWidthHalf,
        arrowWidthHalf,
        arrowWidthHalf
    );

    const zArrowLeftTopBack = new Vector3(
        arrowWidthHalf,
        -arrowWidthHalf,
        arrowWidthHalf
    );

    const zArrowRightTopBack = new Vector3(
        arrowWidthHalf,
        -arrowWidthHalf,
        arrowLength
    );

    const zArrowRightBottomBack = new Vector3(
        arrowWidthHalf,
        arrowWidthHalf,
        arrowLength
    );

    const zArrowLeftBottomBack = new Vector3(
        arrowWidthHalf,
        arrowWidthHalf,
        arrowWidthHalf
    );

    const zArrowBox: MeshBuilderBox = {
        positions: {
            leftTopFront: zArrowLeftTopFront,
            rightTopFront: zArrowRightTopFront,
            rightBottomFront: zArrowRightBottomFront,
            leftBottomFront: zArrowLeftBottomFront,

            leftTopBack: zArrowLeftTopBack,
            rightTopBack: zArrowRightTopBack,
            rightBottomBack: zArrowRightBottomBack,
            leftBottomBack: zArrowLeftBottomBack,
        },

        faces: {
            left: {
                color: blue,
                pickingInteractionId: zMovePickId,
            },
            right: {
                color: blue,
                pickingInteractionId: zMovePickId,
            },
            top: {
                color: blue,
                pickingInteractionId: zMovePickId,
            },
            bottom: {
                color: blue,
                pickingInteractionId: zMovePickId,
            },
            back: {
                color: blue,
                pickingInteractionId: zMovePickId,
            },
            front: {
                color: blue,
                pickingInteractionId: zMovePickId,
            }
        }
    };

    builder.addBox(zArrowBox);

    const zArrowheadBase: MeshBuilderQuad = {
    leftTop: {
        position: new Vector3(
            arrowheadWidthHalf,
            -arrowheadWidthHalf,
            arrowLength
        ),
        quadUV: new Vector2(0, 0),
        color: blue,
        pickingInteractionId: zMovePickId,
    },

    rightTop: {
        position: new Vector3(
            -arrowheadWidthHalf,
            -arrowheadWidthHalf,
            arrowLength
        ),
        quadUV: new Vector2(0, 0),
        color: blue,
        pickingInteractionId: zMovePickId,
    },

    rightBottom: {
        position: new Vector3(
            -arrowheadWidthHalf,
            arrowheadWidthHalf,
            arrowLength
        ),
        quadUV: new Vector2(0, 0),
        color: blue,
        pickingInteractionId: zMovePickId,
    },

    leftBottom: {
        position: new Vector3(
            arrowheadWidthHalf,
            arrowheadWidthHalf,
            arrowLength
        ),
        quadUV: new Vector2(0, 0),
        color: blue,
        pickingInteractionId: zMovePickId,
    }
};

builder.addQuad(zArrowheadBase);


const zArrowheadFrontTriangle: MeshBuilderTriangle = {
    firstVertex: {
        position: new Vector3(
            0,
            0,
            arrowLength + arrowheadLength
        ),
        color: blue,
        quadUV: new Vector2(0, 0),
        pickingInteractionId: zMovePickId,
    },

    secondVertex: {
        position: new Vector3(
            -arrowheadWidthHalf,
            arrowheadWidthHalf,
            arrowLength
        ),
        color: blue,
        quadUV: new Vector2(0, 0),
        pickingInteractionId: zMovePickId,
    },

    thirdVertex: {
        position: new Vector3(
            -arrowheadWidthHalf,
            -arrowheadWidthHalf,
            arrowLength
        ),
        color: blue,
        quadUV: new Vector2(0, 0),
        pickingInteractionId: zMovePickId,
    }
};

builder.addTriangle(zArrowheadFrontTriangle);


const zArrowheadTopTriangle: MeshBuilderTriangle = {
    firstVertex: {
        position: new Vector3(
            0,
            0,
            arrowLength + arrowheadLength
        ),
        color: blue,
        quadUV: new Vector2(0, 0),
        pickingInteractionId: zMovePickId,
    },

    secondVertex: {
        position: new Vector3(
            -arrowheadWidthHalf,
            -arrowheadWidthHalf,
            arrowLength
        ),
        color: blue,
        quadUV: new Vector2(0, 0),
        pickingInteractionId: zMovePickId,
    },

    thirdVertex: {
        position: new Vector3(
            arrowheadWidthHalf,
            -arrowheadWidthHalf,
            arrowLength
        ),
        color: blue,
        quadUV: new Vector2(0, 0),
        pickingInteractionId: zMovePickId,
    }
};

builder.addTriangle(zArrowheadTopTriangle);


const zArrowheadBackTriangle: MeshBuilderTriangle = {
    firstVertex: {
        position: new Vector3(
            0,
            0,
            arrowLength + arrowheadLength
        ),
        color: blue,
        quadUV: new Vector2(0, 0),
        pickingInteractionId: zMovePickId,
    },

    secondVertex: {
        position: new Vector3(
            arrowheadWidthHalf,
            -arrowheadWidthHalf,
            arrowLength
        ),
        color: blue,
        quadUV: new Vector2(0, 0),
        pickingInteractionId: zMovePickId,
    },

    thirdVertex: {
        position: new Vector3(
            arrowheadWidthHalf,
            arrowheadWidthHalf,
            arrowLength
        ),
        color: blue,
        quadUV: new Vector2(0, 0),
        pickingInteractionId: zMovePickId,
    }
};

builder.addTriangle(zArrowheadBackTriangle);


const zArrowheadBottomTriangle: MeshBuilderTriangle = {
    firstVertex: {
        position: new Vector3(
            0,
            0,
            arrowLength + arrowheadLength
        ),
        color: blue,
        quadUV: new Vector2(0, 0),
        pickingInteractionId: zMovePickId,
    },

    secondVertex: {
        position: new Vector3(
            arrowheadWidthHalf,
            arrowheadWidthHalf,
            arrowLength
        ),
        color: blue,
        quadUV: new Vector2(0, 0),
        pickingInteractionId: zMovePickId,
    },

    thirdVertex: {
        position: new Vector3(
            -arrowheadWidthHalf,
            arrowheadWidthHalf,
            arrowLength
        ),
        color: blue,
        quadUV: new Vector2(0, 0),
        pickingInteractionId: zMovePickId,
    }
};

builder.addTriangle(zArrowheadBottomTriangle);

    const cubeMesh = builder.build();
    return cubeMesh        

}

export function generateAxisBorderMesh(
    axis: "X" | "Y" | "Z",
    cellSize: number = 200,
    gridCellCount: number = 50
): Mesh {
    const meshBuilder: MeshBuilder = new MeshBuilder({
        topology: "triangle-list",
        frontFace: "cw",
        cullMode: "none",
        attributes: [
            "position",
            "color",
            "quadUV",
        ]
    });

    const color = new Vector4(128, 128, 128, 255);

    const gridSize = cellSize * gridCellCount;
    const halfGridSize = gridSize / 2;

    const addCell = (i: number, j: number) => {
        const u = -halfGridSize + i * cellSize;
        const v = -halfGridSize + j * cellSize;

        let leftTopPosition: Vector3;
        let rightTopPosition: Vector3;
        let rightBottomPosition: Vector3;
        let leftBottomPosition: Vector3;

        if (axis === "X") {
            leftTopPosition = new Vector3(u, 0, v);
            rightTopPosition = new Vector3(u + cellSize, 0, v);
            rightBottomPosition = new Vector3(u + cellSize, 0, v + cellSize);
            leftBottomPosition = new Vector3(u, 0, v + cellSize);
        }
        else if (axis === "Y") {
            leftTopPosition = new Vector3(u, v, 0);
            rightTopPosition = new Vector3(u + cellSize, v, 0);
            rightBottomPosition = new Vector3(u + cellSize, v + cellSize, 0);
            leftBottomPosition = new Vector3(u, v + cellSize, 0);
        }
        else {
            // Odwrócony winding: +Y x +Z = +X
            leftTopPosition = new Vector3(0, v, u);
            rightTopPosition = new Vector3(0, v + cellSize, u);
            rightBottomPosition = new Vector3(0, v + cellSize, u + cellSize);
            leftBottomPosition = new Vector3(0, v, u + cellSize);
        }

        meshBuilder.addQuad({
            leftTop: {
                position: leftTopPosition,
                quadUV: new Vector2(0, 0),
                color,
            },
            rightTop: {
                position: rightTopPosition,
                quadUV: new Vector2(1, 0),
                color,
            },
            rightBottom: {
                position: rightBottomPosition,
                quadUV: new Vector2(1, 1),
                color,
            },
            leftBottom: {
                position: leftBottomPosition,
                quadUV: new Vector2(0, 1),
                color,
            }
        });
    };

    for (let i = 0; i < gridCellCount; i++) {
        for (let j = 0; j < gridCellCount; j++) {
            addCell(i, j);
        }
    }

    return meshBuilder.build();
}

