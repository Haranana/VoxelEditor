import { RenderableObject } from "./classes/renderableObject";
import { VoxelObject } from "./classes/voxelObject";
import { Vector3 } from "./math/vector3.type";
import { Vector4 } from "./math/vector4.type";

export const defaultColor: Vector4 = new Vector4(101, 204, 224,255);
export const debugPaintColor: Vector4 = new Vector4(190,90,90,255); 
export function getBasicSampleVoxelObject(){
    const out: VoxelObject = new VoxelObject(new Vector3(16,16,16));
    out.baseVoxelSize = 40;

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

export function getCameraControllsGizmo(): RenderableObject{
    const out: RenderableObject = new RenderableObject();
    const axisHeadSideLength = 5;
    const axisLineWidth = 2;
    const axisLineLength = 40
    const xAxisColor = new Vector4(255,32,32,255);
    const yAxisColor = new Vector4(32,255,32,255);
    const zAxisColor = new Vector4(32,32,255,255);

    
    const vertices : Map<string, Vector3> = new Map();
    const startPos : Vector3 = new Vector3(0,0,0);
    
    //xAxis
    const lineWidthHalf = axisLineWidth/2;
    const lineLengthHalf = axisLineLength/2
    const headSideHalf = axisHeadSideLength/2;
    vertices.set("xStemBegA" , startPos.addVector(new Vector3(-lineLengthHalf,-lineWidthHalf,lineWidthHalf)));
    vertices.set( "xStemBegB" , startPos.addVector(new Vector3(lineLengthHalf,-lineWidthHalf,lineWidthHalf)));
    vertices.set( "xStemBegC" , startPos.addVector(new Vector3(lineLengthHalf,lineWidthHalf,lineWidthHalf)));
    vertices.set( "xStemBegD" , startPos.addVector(new Vector3(-lineLengthHalf,lineWidthHalf,lineWidthHalf)));
    vertices.set( "xStemEndE" , startPos.addVector(new Vector3(-lineLengthHalf,-lineWidthHalf,-lineWidthHalf)));
    vertices.set( "xStemEndF" , startPos.addVector(new Vector3(lineLengthHalf,-lineWidthHalf,-lineWidthHalf)));
    vertices.set( "xStemEndG" , startPos.addVector(new Vector3(lineLengthHalf,lineWidthHalf,-lineWidthHalf)));
    vertices.set( "xStemEndH" , startPos.addVector(new Vector3(-lineLengthHalf,lineWidthHalf,-lineWidthHalf)));
    
    const negativeXStartPos = startPos.addVector(new Vector3(-headSideHalf-lineLengthHalf ,0,0));
    vertices.set("xNegHeadA" , negativeXStartPos.addVector(new Vector3(-headSideHalf,-headSideHalf,+headSideHalf)));
    vertices.set( "xNegHeadB" , negativeXStartPos.addVector(new Vector3(headSideHalf,-headSideHalf,headSideHalf)));
    vertices.set( "xNegHeadC" , negativeXStartPos.addVector(new Vector3(headSideHalf,headSideHalf,headSideHalf)));
    vertices.set( "xNegHeadD" , negativeXStartPos.addVector(new Vector3(-headSideHalf,headSideHalf,headSideHalf)));
    vertices.set( "xNegHeadE" , negativeXStartPos.addVector(new Vector3(-headSideHalf,-headSideHalf,-headSideHalf)));
    vertices.set( "xNegHeadF" , negativeXStartPos.addVector(new Vector3(headSideHalf,-headSideHalf,-headSideHalf)));
    vertices.set( "xNegHeadG" , negativeXStartPos.addVector(new Vector3(headSideHalf,headSideHalf,-headSideHalf)));
    vertices.set( "xNegHeadH" , negativeXStartPos.addVector(new Vector3(-headSideHalf,headSideHalf,-headSideHalf)));

    const positiveXStartPos = startPos.addVector(new Vector3(headSideHalf+lineLengthHalf ,0,0));
    vertices.set("xPosHeadA" , positiveXStartPos.addVector(new Vector3(-headSideHalf,-headSideHalf,headSideHalf)));
    vertices.set( "xPosHeadB" , positiveXStartPos.addVector(new Vector3(headSideHalf,-headSideHalf,headSideHalf)));
    vertices.set( "xPosHeadC" , positiveXStartPos.addVector(new Vector3(headSideHalf,headSideHalf,headSideHalf)));
    vertices.set( "xPosHeadD" , positiveXStartPos.addVector(new Vector3(-headSideHalf,headSideHalf,headSideHalf)));
    vertices.set( "xPosHeadE" , positiveXStartPos.addVector(new Vector3(-headSideHalf,-headSideHalf,-headSideHalf)));
    vertices.set( "xPosHeadF" , positiveXStartPos.addVector(new Vector3(headSideHalf,-headSideHalf,-headSideHalf)));
    vertices.set( "xPosHeadG" , positiveXStartPos.addVector(new Vector3(headSideHalf,headSideHalf,-headSideHalf)));
    vertices.set( "xPosHeadH" , positiveXStartPos.addVector(new Vector3(-headSideHalf,headSideHalf,-headSideHalf)));

    out.addBox(vertices.get("xStemBegA")! , vertices.get("xStemBegB")!, vertices.get("xStemBegC")!, vertices.get("xStemBegD")!,
    vertices.get("xStemEndE")!, vertices.get("xStemEndF")!,vertices.get("xStemEndG")!,vertices.get("xStemEndH")!,xAxisColor);

        out.addBox(vertices.get("xNegHeadA")! , vertices.get("xNegHeadB")!, vertices.get("xNegHeadC")!, vertices.get("xNegHeadD")!,
    vertices.get("xNegHeadE")!, vertices.get("xNegHeadF")!,vertices.get("xNegHeadG")!,vertices.get("xNegHeadH")!,xAxisColor);

            out.addBox(vertices.get("xPosHeadA")! , vertices.get("xPosHeadB")!, vertices.get("xPosHeadC")!, vertices.get("xPosHeadD")!,
    vertices.get("xPosHeadE")!, vertices.get("xPosHeadF")!,vertices.get("xPosHeadG")!,vertices.get("xPosHeadH")!,xAxisColor);


    vertices.set("yStemBegA" , startPos.addVector(new Vector3(-lineWidthHalf,-lineLengthHalf,lineWidthHalf)));
    vertices.set("yStemBegB" , startPos.addVector(new Vector3(lineWidthHalf,-lineLengthHalf,lineWidthHalf)));
    vertices.set("yStemBegC" , startPos.addVector(new Vector3(lineWidthHalf,lineLengthHalf,lineWidthHalf)));
    vertices.set("yStemBegD" , startPos.addVector(new Vector3(-lineWidthHalf,lineLengthHalf,lineWidthHalf)));
    vertices.set("yStemEndE" , startPos.addVector(new Vector3(-lineWidthHalf,-lineLengthHalf,-lineWidthHalf)));
    vertices.set("yStemEndF" , startPos.addVector(new Vector3(lineWidthHalf,-lineLengthHalf,-lineWidthHalf)));
    vertices.set("yStemEndG" , startPos.addVector(new Vector3(lineWidthHalf,lineLengthHalf,-lineWidthHalf)));
    vertices.set("yStemEndH" , startPos.addVector(new Vector3(-lineWidthHalf,lineLengthHalf,-lineWidthHalf)));

    const negativeYStartPos = startPos.addVector(new Vector3(0,-headSideHalf-lineLengthHalf,0));

    vertices.set("yNegHeadA" , negativeYStartPos.addVector(new Vector3(-headSideHalf,-headSideHalf,+headSideHalf)));
    vertices.set("yNegHeadB" , negativeYStartPos.addVector(new Vector3(headSideHalf,-headSideHalf,headSideHalf)));
    vertices.set("yNegHeadC" , negativeYStartPos.addVector(new Vector3(headSideHalf,headSideHalf,headSideHalf)));
    vertices.set("yNegHeadD" , negativeYStartPos.addVector(new Vector3(-headSideHalf,headSideHalf,headSideHalf)));
    vertices.set("yNegHeadE" , negativeYStartPos.addVector(new Vector3(-headSideHalf,-headSideHalf,-headSideHalf)));
    vertices.set("yNegHeadF" , negativeYStartPos.addVector(new Vector3(headSideHalf,-headSideHalf,-headSideHalf)));
    vertices.set("yNegHeadG" , negativeYStartPos.addVector(new Vector3(headSideHalf,headSideHalf,-headSideHalf)));
    vertices.set("yNegHeadH" , negativeYStartPos.addVector(new Vector3(-headSideHalf,headSideHalf,-headSideHalf)));

    const positiveYStartPos = startPos.addVector(new Vector3(0,headSideHalf+lineLengthHalf,0));

    vertices.set("yPosHeadA" , positiveYStartPos.addVector(new Vector3(-headSideHalf,-headSideHalf,headSideHalf)));
    vertices.set("yPosHeadB" , positiveYStartPos.addVector(new Vector3(headSideHalf,-headSideHalf,headSideHalf)));
    vertices.set("yPosHeadC" , positiveYStartPos.addVector(new Vector3(headSideHalf,headSideHalf,headSideHalf)));
    vertices.set("yPosHeadD" , positiveYStartPos.addVector(new Vector3(-headSideHalf,headSideHalf,headSideHalf)));
    vertices.set("yPosHeadE" , positiveYStartPos.addVector(new Vector3(-headSideHalf,-headSideHalf,-headSideHalf)));
    vertices.set("yPosHeadF" , positiveYStartPos.addVector(new Vector3(headSideHalf,-headSideHalf,-headSideHalf)));
    vertices.set("yPosHeadG" , positiveYStartPos.addVector(new Vector3(headSideHalf,headSideHalf,-headSideHalf)));
    vertices.set("yPosHeadH" , positiveYStartPos.addVector(new Vector3(-headSideHalf,headSideHalf,-headSideHalf)));

    out.addBox(
        vertices.get("yStemBegA")!,
        vertices.get("yStemBegB")!,
        vertices.get("yStemBegC")!,
        vertices.get("yStemBegD")!,
        vertices.get("yStemEndE")!,
        vertices.get("yStemEndF")!,
        vertices.get("yStemEndG")!,
        vertices.get("yStemEndH")!,
        yAxisColor
    );

    out.addBox(
        vertices.get("yNegHeadA")!,
        vertices.get("yNegHeadB")!,
        vertices.get("yNegHeadC")!,
        vertices.get("yNegHeadD")!,
        vertices.get("yNegHeadE")!,
        vertices.get("yNegHeadF")!,
        vertices.get("yNegHeadG")!,
        vertices.get("yNegHeadH")!,
        yAxisColor
    );

    out.addBox(
        vertices.get("yPosHeadA")!,
        vertices.get("yPosHeadB")!,
        vertices.get("yPosHeadC")!,
        vertices.get("yPosHeadD")!,
        vertices.get("yPosHeadE")!,
        vertices.get("yPosHeadF")!,
        vertices.get("yPosHeadG")!,
        vertices.get("yPosHeadH")!,
        yAxisColor
    );

    vertices.set("zStemBegA" , startPos.addVector(new Vector3(-lineWidthHalf,-lineWidthHalf,lineLengthHalf)));
    vertices.set("zStemBegB" , startPos.addVector(new Vector3(lineWidthHalf,-lineWidthHalf,lineLengthHalf)));
    vertices.set("zStemBegC" , startPos.addVector(new Vector3(lineWidthHalf,lineWidthHalf,lineLengthHalf)));
    vertices.set("zStemBegD" , startPos.addVector(new Vector3(-lineWidthHalf,lineWidthHalf,lineLengthHalf)));
    vertices.set("zStemEndE" , startPos.addVector(new Vector3(-lineWidthHalf,-lineWidthHalf,-lineLengthHalf)));
    vertices.set("zStemEndF" , startPos.addVector(new Vector3(lineWidthHalf,-lineWidthHalf,-lineLengthHalf)));
    vertices.set("zStemEndG" , startPos.addVector(new Vector3(lineWidthHalf,lineWidthHalf,-lineLengthHalf)));
    vertices.set("zStemEndH" , startPos.addVector(new Vector3(-lineWidthHalf,lineWidthHalf,-lineLengthHalf)));

    const negativeZStartPos = startPos.addVector(new Vector3(0,0,-headSideHalf-lineLengthHalf));

    vertices.set("zNegHeadA" , negativeZStartPos.addVector(new Vector3(-headSideHalf,-headSideHalf,+headSideHalf)));
    vertices.set("zNegHeadB" , negativeZStartPos.addVector(new Vector3(headSideHalf,-headSideHalf,headSideHalf)));
    vertices.set("zNegHeadC" , negativeZStartPos.addVector(new Vector3(headSideHalf,headSideHalf,headSideHalf)));
    vertices.set("zNegHeadD" , negativeZStartPos.addVector(new Vector3(-headSideHalf,headSideHalf,headSideHalf)));
    vertices.set("zNegHeadE" , negativeZStartPos.addVector(new Vector3(-headSideHalf,-headSideHalf,-headSideHalf)));
    vertices.set("zNegHeadF" , negativeZStartPos.addVector(new Vector3(headSideHalf,-headSideHalf,-headSideHalf)));
    vertices.set("zNegHeadG" , negativeZStartPos.addVector(new Vector3(headSideHalf,headSideHalf,-headSideHalf)));
    vertices.set("zNegHeadH" , negativeZStartPos.addVector(new Vector3(-headSideHalf,headSideHalf,-headSideHalf)));

    const positiveZStartPos = startPos.addVector(new Vector3(0,0,headSideHalf+lineLengthHalf));

    vertices.set("zPosHeadA" , positiveZStartPos.addVector(new Vector3(-headSideHalf,-headSideHalf,headSideHalf)));
    vertices.set("zPosHeadB" , positiveZStartPos.addVector(new Vector3(headSideHalf,-headSideHalf,headSideHalf)));
    vertices.set("zPosHeadC" , positiveZStartPos.addVector(new Vector3(headSideHalf,headSideHalf,headSideHalf)));
    vertices.set("zPosHeadD" , positiveZStartPos.addVector(new Vector3(-headSideHalf,headSideHalf,headSideHalf)));
    vertices.set("zPosHeadE" , positiveZStartPos.addVector(new Vector3(-headSideHalf,-headSideHalf,-headSideHalf)));
    vertices.set("zPosHeadF" , positiveZStartPos.addVector(new Vector3(headSideHalf,-headSideHalf,-headSideHalf)));
    vertices.set("zPosHeadG" , positiveZStartPos.addVector(new Vector3(headSideHalf,headSideHalf,-headSideHalf)));
    vertices.set("zPosHeadH" , positiveZStartPos.addVector(new Vector3(-headSideHalf,headSideHalf,-headSideHalf)));

    out.addBox(
        vertices.get("zStemBegA")!,
        vertices.get("zStemBegB")!,
        vertices.get("zStemBegC")!,
        vertices.get("zStemBegD")!,
        vertices.get("zStemEndE")!,
        vertices.get("zStemEndF")!,
        vertices.get("zStemEndG")!,
        vertices.get("zStemEndH")!,
        zAxisColor
    );

    out.addBox(
        vertices.get("zNegHeadA")!,
        vertices.get("zNegHeadB")!,
        vertices.get("zNegHeadC")!,
        vertices.get("zNegHeadD")!,
        vertices.get("zNegHeadE")!,
        vertices.get("zNegHeadF")!,
        vertices.get("zNegHeadG")!,
        vertices.get("zNegHeadH")!,
        zAxisColor
    );

    out.addBox(
        vertices.get("zPosHeadA")!,
        vertices.get("zPosHeadB")!,
        vertices.get("zPosHeadC")!,
        vertices.get("zPosHeadD")!,
        vertices.get("zPosHeadE")!,
        vertices.get("zPosHeadF")!,
        vertices.get("zPosHeadG")!,
        vertices.get("zPosHeadH")!,
        zAxisColor
    );

    return out;
}