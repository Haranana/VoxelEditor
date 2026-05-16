import { Vector2 } from "../math/vector2.type";
import { Vector3 } from "../math/vector3.type";
import type { Vector4 } from "../math/vector4.type";
import type { ObjectProperties } from "../RenderableObjectTypes";

export type Vertex ={
    position: Vector3,
    quadUV: Vector2,
    color: Vector4,
}

export class RenderableObject{
    
    transform: ObjectProperties = {
        translation: new Vector3(0,0,0),
        scale: new Vector3(1,1,1),
        rotation: new Vector3(0,0,0), //in degrees
    };
    trianglesIndices: number[] = [];
    linesIndices: number[] = [];
    quadsIndices: number[] = [];
    vertices: Vertex[] = [];

    //returns data of all verticex in 32 bit (4 byte) array:
    //4 bytes for x
    //4 bytes for y
    //4 bytes for z
    //1 byte for color r
    //1 byte for color g
    //1 byte for color b
    //1 byte for color a
    //4 bytes for quad u
    //4 bytes for quad v
    getVerticesData(){
        const vertexDataElements : number = 6;
    
        const numVertices : number = this.vertices.length;
        const vertexData = new Float32Array(numVertices * vertexDataElements); 
        const colorData = new Uint8Array(vertexData.buffer);

        for(let i = 0; i<numVertices; i++){
            vertexData.set([this.vertices[i].position.x , this.vertices[i].position.y, this.vertices[i].position.z]  , i*vertexDataElements);
            vertexData.set([this.vertices[i].quadUV.x , this.vertices[i].quadUV.y], i * vertexDataElements + 4);
            const color = this.vertices[i].color;
            colorData.set([color.x, color.y, color.z, color.w], i * vertexDataElements * 4 + 12);      
        }
        
        return {
            vertexData,
            linesIndices: new Uint32Array(this.linesIndices),
            trianglesIndices: new Uint32Array(this.trianglesIndices),
            quadsIndices: new Uint32Array(this.quadsIndices),
            numVertices: numVertices,
        };
    }

    getVerticesDataWithoutUV(){
        const vertexDataElements : number = 4;
    
        const numVertices : number = this.vertices.length;
        const vertexData = new Float32Array(numVertices * vertexDataElements); 
        const colorData = new Uint8Array(vertexData.buffer);

        for(let i = 0; i<numVertices; i++){
            vertexData.set([this.vertices[i].position.x , this.vertices[i].position.y, this.vertices[i].position.z]  , i*vertexDataElements);
            const color = this.vertices[i].color;
            colorData.set([color.x, color.y, color.z, color.w], i * vertexDataElements * 4 + 12);      
        }
        
        return {
            vertexData,
            linesIndices: new Uint32Array(this.linesIndices),
            trianglesIndices: new Uint32Array(this.trianglesIndices),
            numVertices: numVertices,
        };
    }

    addBox(negXnegYPosZ: Vector3, posXnegYposZ: Vector3, posXposYposZ: Vector3, negXPosYPosZ: Vector3,
        negXnegYNegZ: Vector3, posXnegYNegZ: Vector3, posXposYNegZ: Vector3, negXPosYNegZ: Vector3, color: Vector4
    ){
      
        const voxelVertices : Map<string, Vector3> = new Map();
        voxelVertices.set("A" , negXnegYPosZ);
        voxelVertices.set( "B" , posXnegYposZ);
        voxelVertices.set( "C" , posXposYposZ);
        voxelVertices.set( "D" , negXPosYPosZ);
        voxelVertices.set( "E" ,negXnegYNegZ);
        voxelVertices.set( "F" , posXnegYNegZ);
        voxelVertices.set( "G" , posXposYNegZ);
        voxelVertices.set( "H" , negXPosYNegZ);
        
        //front 
        let currentVoxelId : number = this.vertices.length 
        this.vertices.push({
            position: voxelVertices.get("A")!,
            quadUV: new Vector2(0,0), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("B")!,
            quadUV: new Vector2(1,0), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("C")!,
            quadUV: new Vector2(1,1), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("D")!,
            quadUV: new Vector2(0,1), 
            color,
        })
        this.trianglesIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId+3, currentVoxelId);
        this.linesIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId, currentVoxelId+2, currentVoxelId+3,currentVoxelId+3, currentVoxelId );
        this.quadsIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId+3, currentVoxelId+3, currentVoxelId);
        
        //back 
        currentVoxelId = this.vertices.length
        this.vertices.push({
            position: voxelVertices.get("F")!,
            quadUV: new Vector2(0,0), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("E")!,
            quadUV: new Vector2(1,0), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("H")!,
            quadUV: new Vector2(1,1), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("G")!,
            quadUV: new Vector2(0,1), 
            color,
        })
        this.trianglesIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId+3, currentVoxelId);
        this.linesIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId, currentVoxelId+2, currentVoxelId+3,currentVoxelId+3, currentVoxelId );
        this.quadsIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId+3, currentVoxelId+3, currentVoxelId);
        
        //top 
        currentVoxelId = this.vertices.length
        this.vertices.push({
            position: voxelVertices.get("E")!,
            quadUV: new Vector2(0,0), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("F")!,
            quadUV: new Vector2(1,0), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("B")!,
            quadUV: new Vector2(1,1), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("A")!,
            quadUV: new Vector2(0,1), 
            color,
        })
        this.trianglesIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId+3, currentVoxelId);
        this.linesIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId, currentVoxelId+2, currentVoxelId+3,currentVoxelId+3, currentVoxelId );
        this.quadsIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId+3, currentVoxelId+3, currentVoxelId);
        
        //bottom 
        currentVoxelId = this.vertices.length
        this.vertices.push({
            position: voxelVertices.get("D")!,
            quadUV: new Vector2(0,0), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("C")!,
            quadUV: new Vector2(1,0), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("G")!,
            quadUV: new Vector2(1,1), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("H")!,
            quadUV: new Vector2(0,1), 
            color,
        })
        this.trianglesIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId+3, currentVoxelId);
        this.linesIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId, currentVoxelId+2, currentVoxelId+3,currentVoxelId+3, currentVoxelId );
        this.quadsIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId+3, currentVoxelId+3, currentVoxelId);
        
        //left 
        currentVoxelId = this.vertices.length
        this.vertices.push({
            position: voxelVertices.get("E")!,
            quadUV: new Vector2(0,0), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("A")!,
            quadUV: new Vector2(1,0), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("D")!,
            quadUV: new Vector2(1,1), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("H")!,
            quadUV: new Vector2(0,1), 
            color,
        })
        this.trianglesIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId+3, currentVoxelId);
        this.linesIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId, currentVoxelId+2, currentVoxelId+3,currentVoxelId+3, currentVoxelId );
        this.quadsIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId+3, currentVoxelId+3, currentVoxelId);
        
        //right 
        currentVoxelId = this.vertices.length
        this.vertices.push({
            position: voxelVertices.get("B")!,
            quadUV: new Vector2(0,0), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("F")!,
            quadUV: new Vector2(1,0), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("G")!,
            quadUV: new Vector2(1,1), 
            color,
        })
        this.vertices.push({
            position: voxelVertices.get("C")!,
            quadUV: new Vector2(0,1), 
            color,
        })
        this.trianglesIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId+3, currentVoxelId);
        this.linesIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId, currentVoxelId+2, currentVoxelId+3,currentVoxelId+3, currentVoxelId );
        this.quadsIndices.push(currentVoxelId, currentVoxelId+1, currentVoxelId+1, currentVoxelId+2, currentVoxelId+2, currentVoxelId+3, currentVoxelId+3, currentVoxelId);
    }
}