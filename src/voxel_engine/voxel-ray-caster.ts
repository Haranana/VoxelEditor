
import type { Matrix4 } from "../math/matrix4.type";
import { Vector2 } from "../math/vector2.type";
import { Vector3 } from "../math/vector3.type";
import { Vector4 } from "../math/vector4.type";
import type { Camera } from "./scene-objects/camera/camera";
import { faceDirectionToVector, type FaceDirection, type VoxelObject } from "./scene-objects/voxel/voxel-object";
import { Ray } from "../math/geometry/ray";
import { Plane } from "../math/geometry/plane";
import { planeAABBIntersection } from "./intersection_tests/voxel-tests";

/*
casts ray from given coordinates (in Model space) onto given voxel object and returns id of first-non empty voxel
and direction of the hit

if lastEmpty argument is true function returns last empty voxel before hit, otherwise it returns first non-empty voxel

if hitOnExit argument is true upon exiting bounding box without hitting any voxel the function will return last empty voxel hit,
otherwise it will return null
*/
export function getVoxelFromObject(_: Camera, 
                            pointSs: Vector2, 
                            obj: VoxelObject,
                            canvasSize: Vector2,
                            objectTransformMatrix: Matrix4,  
                            ndcProjectionMatrix: Matrix4, 
                            cameraViewMatrix: Matrix4,
                            lastEmpty: boolean = true,
                            hitOnExit: boolean = true,
                            )
    : {voxelCoords: Vector3, hitDirection: FaceDirection} | null {
    
    const mvp = ndcProjectionMatrix.multMatrix(cameraViewMatrix).multMatrix(objectTransformMatrix)
    const mvpInversion = mvp.getInversion();
    const EPS = 1e-6;

    const xNdc = (2 * pointSs.x) / canvasSize.x - 1;
    const yNdc = 1 - (2 * pointSs.y) / canvasSize.y;

    const pointNearMs : Vector4 = mvpInversion.multVector(new Vector4(xNdc, yNdc, 0, 1));
    const pointFarMs: Vector4 = mvpInversion.multVector(new Vector4(xNdc, yNdc, 1, 1));

    const pointNearMsPersp : Vector3 = new Vector3(pointNearMs.x/pointNearMs.w, pointNearMs.y/pointNearMs.w, pointNearMs.z/pointNearMs.w);
    const pointFarMsPersp : Vector3 = new Vector3(pointFarMs.x/pointFarMs.w, pointFarMs.y/pointFarMs.w, pointFarMs.z/pointFarMs.w);

    const rayDirection: Vector3 = pointFarMsPersp.subVector(pointNearMsPersp).normalize();
    const rayOrigin: Vector3 = pointNearMsPersp;
    const voxelSize: number = obj.getVoxelSize(); 
    const ray: Ray = new Ray(rayOrigin, rayDirection);

    /*
    console.log(`
        Origin: ${ray.origin.toString()} |
        Direction: ${ray.direction.toString()} |
        Point pos (model space) : ${pointFarMsPersp.toString()} |
    `)  ;*/
    
    let currentRayT: number = 0;
    if(obj.getVoxelFromModelSpacePoint(ray.get(currentRayT))){
        return {voxelCoords: obj.pointCoordinatesToVoxelId(ray.get(currentRayT)) , hitDirection: "PosX"};
    }

    const xSign : number = ray.direction.x == 0? 0 : ray.direction.x < 0? -1 : 1;
    const ySign : number = ray.direction.y == 0? 0 : ray.direction.y < 0? -1 : 1;
    const zSign : number = ray.direction.z == 0? 0 : ray.direction.z < 0? -1 : 1;

    const sign : Vector3 = new Vector3(
        xSign, ySign, zSign
    );

    //returns values of the first x,y,z of the next cell
    //assumes that voxelSize > 1 distance unit
    //returns null if sign for this dimension is 0
    const getNextVoxelX = (curX: number, xSign: number) : number | null =>{
        /*
        return xSign == 0? null : xSign==1? Math.ceil(curX/voxelSize)*voxelSize+voxelSize : Math.floor(curX/voxelSize)*voxelSize-1;
        */
       if(xSign==0) return null;
       const cell = Math.floor(curX/voxelSize);
       const nextBoundary = xSign > 0? (cell+1)*voxelSize : cell*voxelSize;
       return nextBoundary;
    }

    const getNextVoxelY = (curY: number, ySign: number) : number | null =>{
        /*
        return ySign == 0? null : ySign==1? Math.ceil(curY/voxelSize)*voxelSize+voxelSize : Math.floor(curY/voxelSize)*voxelSize-1;
        */
        if(ySign==0) return null;
        const cell = Math.floor(curY/voxelSize);
        const nextBoundary = ySign > 0? (cell+1)*voxelSize : cell*voxelSize;
        return nextBoundary;
    }

    const getNextVoxelZ = (curZ: number, zSign: number) : number | null=>{
        /*
        return zSign == 0? null : zSign==1? Math.ceil(curZ/voxelSize)*voxelSize+voxelSize : Math.floor(curZ/voxelSize)*voxelSize-1;
        */
               if(zSign==0) return null;
        const cell = Math.floor(curZ/voxelSize);
        const nextBoundary = zSign > 0? (cell+1)*voxelSize : cell*voxelSize;
        return nextBoundary;
    }

    //returns t for the next instance when ray reaches new cell
    const getNextT = (ray: Ray, t: number, sign : Vector3) : {minDelta: number, dir: FaceDirection}=>{
        const curRayValue = ray.get(t)
        const nextVoxelX : number | null = getNextVoxelX(curRayValue.x , sign.x);
        const nextVoxelY : number | null = getNextVoxelY(curRayValue.y, sign.y);
        const nextVoxelZ: number | null = getNextVoxelZ(curRayValue.z , sign.z);

            
        //const deltasT : number[] = [];
        let smallestDelta: number | null = null;
        let hitDimension : "X" | "Y" | "Z"  = "X";
        if(nextVoxelX!=null){
            const diff = nextVoxelX - curRayValue.x;
            const deltaT = diff/rayDirection.x;
            if(smallestDelta == null || smallestDelta > deltaT){
                smallestDelta = deltaT;
                hitDimension = "X";
            }                        
        }
        if(nextVoxelY!=null){
            const diff = nextVoxelY - curRayValue.y;
            const deltaT = diff/rayDirection.y;
            if(smallestDelta == null || smallestDelta > deltaT) {
                smallestDelta = deltaT;
                hitDimension = "Y";
            }            
        }
        if(nextVoxelZ!=null){
            const diff = nextVoxelZ - curRayValue.z;
            const deltaT = diff/rayDirection.z;
            if(smallestDelta == null || smallestDelta > deltaT){
                smallestDelta = deltaT;                
                hitDimension = "Z";
            } 
        }        
        
        let dir : FaceDirection;
        if(hitDimension === "X"){
            if(sign.x > 0){
                dir = "NegX";
            }else{
                dir = "PosX";
            }
        }else if(hitDimension === "Y"){
            if(sign.y > 0){
                dir = "NegY";
            }else{
                dir = "PosY";
            }
        }else{
            if(sign.z > 0){
                dir = "NegZ";
            }else{
                dir = "PosZ";
            }
        }
        
        //there shouldn't be any possible way for all signs to be 0 so it's assumed that tForNextVoxels is never empty at this point
        //const minT = Math.min(...deltasT);

        /*
        console.log(`[getNextT] finding delta beetwen 2 arguments of ray
            position before = ${curRayValue.toString()} |
            sign = ${sign} |
            voxelSize = ${voxelSize} |
            next (x,y,z) = (${nextVoxelX},${nextVoxelY},${nextVoxelZ})
            diffs (x,y,z) = (${nextVoxelX as number - curRayValue.x},${nextVoxelY as number - curRayValue.y},${nextVoxelZ as number - curRayValue.z})
            deltaT = (${minT})
            `);
        */
        return {minDelta: smallestDelta!, dir};
    }
    

    //later it will be modified to calculate only in bounding box
    //loop condition is temporary as safety
    //let enteredBoundingBox = false;
    let LastEmptyVoxel : Vector3 | null = null; 
    while( Math.abs(ray.get(currentRayT).z) < 10000){
        const nextVoxelBoundary  = getNextT(ray, currentRayT, sign);
        currentRayT += (nextVoxelBoundary.minDelta + EPS);

        const rayValue = ray.get(currentRayT)
        const voxelId = obj.pointCoordinatesToVoxelId(rayValue);
        if(obj.voxelExists(voxelId) && obj.isVoxelNonEmpty(voxelId)){ //is in bb and hit non-empty voxel
            
            let result : {voxelCoords: Vector3, hitDirection: FaceDirection} | null = {voxelCoords: voxelId, hitDirection: nextVoxelBoundary.dir};
            if(lastEmpty) result.voxelCoords=result.voxelCoords.addVector(faceDirectionToVector(nextVoxelBoundary.dir));
            if(!obj.voxelExists(result.voxelCoords)) result = null
            return result;
            //const returnId = lastEmpty? obj.voxelExists(voxelId.addVector(faceDirectionToVector(nextVoxelBoundary.dir)))? 
            //voxelId.addVector(faceDirectionToVector(nextVoxelBoundary.dir)) : null : voxelId
            //return returnId==null? null : {voxelCoords: returnId!, hitDirection:  nextVoxelBoundary.dir};
        }else if(obj.voxelExists(voxelId)){ //is in bb and hit empty voxel
            LastEmptyVoxel = voxelId.copy();
            continue;
        }else if(LastEmptyVoxel!=null){ //was in boundingBox but exited it
            return hitOnExit? {voxelCoords: voxelId.addVector( (faceDirectionToVector(nextVoxelBoundary.dir))), hitDirection: nextVoxelBoundary.dir} : null;
        }else{ //yet to enter bb
            continue;
        }
    }

    return null;
}

/*
    todo: near and far planes in PlaneAABB intersection tests should be voxel object border
    instead of actual near nad far planes of the scene
*/

export function marqueeSelectRectangle(
                            rectStart: Vector2,
                            rectEnd: Vector2, 
                            obj: VoxelObject,
                            canvasSize: Vector2,
                            mvp: Matrix4)
    : Vector3[]{
    const out: Vector3[] = [];

    console.log(`[marquee] arguments: rectStart[${rectStart}] | rectEnd[${rectEnd}] | obj.name[${obj.name}] | canvasSize[${canvasSize}] | mvp[${mvp}]`)
    
    const leftBottomSs = new Vector2( Math.min(rectStart.x, rectEnd.x) , Math.max(rectStart.y, rectEnd.y) );
    const rightBottomSs = new Vector2( Math.max(rectStart.x, rectEnd.x) , Math.max(rectStart.y, rectEnd.y) );
    const rightTopSs = new Vector2( Math.max(rectStart.x, rectEnd.x) , Math.min(rectStart.y, rectEnd.y) );
    const leftTopSs = new Vector2( Math.min(rectStart.x, rectEnd.x) , Math.min(rectStart.y, rectEnd.y) );
    
    const screenSpaceToNdc = (p: Vector2, z: number, canvasSize: Vector2 ) => {
        return new Vector4( (2*p.x)/canvasSize.x-1 , 1-(2*p.y)/canvasSize.y,z, 1);
    }

    const leftBottomNearNdc = screenSpaceToNdc(leftBottomSs, 0, canvasSize);
    const rightBottomNearNdc = screenSpaceToNdc(rightBottomSs, 0, canvasSize);
    const rightTopNearNdc = screenSpaceToNdc(rightTopSs, 0,canvasSize);
    const leftTopNearNdc = screenSpaceToNdc(leftTopSs, 0,canvasSize);

    const leftBottomFarNdc = screenSpaceToNdc(leftBottomSs, 1, canvasSize);
    const rightBottomFarNdc = screenSpaceToNdc(rightBottomSs, 1, canvasSize);
    const rightTopFarNdc = screenSpaceToNdc(rightTopSs, 1,canvasSize);
    const leftTopFarNdc = screenSpaceToNdc(leftTopSs, 1,canvasSize);

    const mvpInversion = mvp.getInversion();

    const leftBottomNearMs = mvpInversion.multVector(leftBottomNearNdc).homogeneousDivide();
    const rightBottomNearMs = mvpInversion.multVector(rightBottomNearNdc).homogeneousDivide();
    const rightTopNearMs = mvpInversion.multVector(rightTopNearNdc).homogeneousDivide();
    const leftTopNearMs = mvpInversion.multVector(leftTopNearNdc).homogeneousDivide();

    const leftBottomFarMs = mvpInversion.multVector(leftBottomFarNdc).homogeneousDivide();
    const rightBottomFarMs = mvpInversion.multVector(rightBottomFarNdc).homogeneousDivide();
    const rightTopFarMs = mvpInversion.multVector(rightTopFarNdc).homogeneousDivide();
    const leftTopFarMs = mvpInversion.multVector(leftTopFarNdc).homogeneousDivide();    

    console.log(`[marquee] model space frustrum vertices: 
        leftBottomNearMs[${leftBottomNearMs}] | rightBottomNearMs[${rightBottomNearMs}]
        rightTopNearMs[${rightTopNearMs}] | leftTopNearMs[${leftTopNearMs}]
        leftBottomFarMs[${leftBottomFarMs}] | rightBottomFarMs[${rightBottomFarMs}]
        rightTopFarMs[${rightTopFarMs}] | leftTopFarMs[${leftTopFarMs}]`)
    //creating frustum planes

    const frustumMiddle: Vector3 = leftBottomNearMs.addVector(rightTopFarMs).multByScalar(0.5);
    
    //near
    const rightBottomToRightTopNear = rightTopNearMs.subVector(rightBottomNearMs);
    const rightBottomToLeftBottomNear: Vector3 = leftBottomNearMs.subVector(rightBottomNearMs);
    const nearPlaneNormal = rightBottomToRightTopNear.crossProduct(rightBottomToLeftBottomNear).normalize();
    const nearPlane = new Plane(nearPlaneNormal, rightBottomNearMs);
    const middleToNearPlane = nearPlane.distanceTo(frustumMiddle);
    if(middleToNearPlane>0){
        console.log(`[marquee] middleToNearPlane >0 => inversing normal!`); 
        console.log(`[marquee] before[${nearPlane.getNormal()}]`)
            nearPlane.inverseNormal();
        console.log(`[marquee] after[${nearPlane.getNormal()}]`)                    
    }

    //far
    const rightBottomToRightTopFar = rightTopFarMs.subVector(rightBottomFarMs);
    const rightBottomToLeftBottomFar: Vector3 = leftBottomFarMs.subVector(rightBottomFarMs);
    const farPlaneNormal = rightBottomToRightTopFar.crossProduct(rightBottomToLeftBottomFar).normalize();
    const farPlane = new Plane(farPlaneNormal, rightBottomFarMs);
    const middleToFarPlane = farPlane.distanceTo(frustumMiddle);
    if(middleToFarPlane>0){
        farPlane.inverseNormal();
    }    

    //right
    const rightBottomFarToNear = rightBottomNearMs.subVector(rightBottomFarMs);
    const rightPlaneNormal = rightBottomToRightTopFar.crossProduct(rightBottomFarToNear).normalize();  
    const rightPlane = new Plane(rightPlaneNormal, rightBottomFarMs);
    const middleToRightPlane = rightPlane.distanceTo(frustumMiddle);
    if(middleToRightPlane>0){
        rightPlane.inverseNormal();
    }

    //left
    const leftBottomFarToNear = leftBottomNearMs.subVector(leftBottomFarMs);
    const leftBottomToLeftTopFar = leftTopFarMs.subVector(leftBottomFarMs);
    const leftPlaneNormal = leftBottomFarToNear.crossProduct(leftBottomToLeftTopFar).normalize();
    const leftPlane = new Plane(leftPlaneNormal, leftBottomFarMs);
    const middleToLeftPlane = leftPlane.distanceTo(frustumMiddle);
    if(middleToLeftPlane>0){
        leftPlane.inverseNormal();
    }

    //top
    const leftTopNearToFar = leftTopFarMs.subVector(leftTopNearMs);
    const leftTopToRightTopNear = rightTopNearMs.subVector(leftTopNearMs);
    const topPlaneNormal = leftTopNearToFar.crossProduct(leftTopToRightTopNear).normalize();
    const topPlane = new Plane(topPlaneNormal, leftTopNearMs);
    const middleToTopPlane = topPlane.distanceTo(frustumMiddle);
    if(middleToTopPlane>0){
        topPlane.inverseNormal();
    }

    //bottom
    const leftBottomNearToFar = leftBottomFarMs.subVector(leftBottomNearMs);
    const leftBottomToRightBottomNear = rightBottomNearMs.subVector(leftBottomNearMs);
    const bottomPlaneNormal = leftBottomNearToFar.crossProduct(leftBottomToRightBottomNear).normalize();
    const bottomPlane = new Plane(bottomPlaneNormal, leftBottomNearMs);
    const middleToBottomPlane = bottomPlane.distanceTo(frustumMiddle);
    if(middleToBottomPlane>0){
        bottomPlane.inverseNormal();
    }

        console.log(`[marquee] planes data: 
    farPlane[n: ${farPlane.getNormal()} | p: [${farPlane.getPoint()}] | 
    nearPlane[n: ${nearPlane.getNormal()} | p: [${nearPlane.getPoint()}] | 
    bottomPlane[n: ${bottomPlane.getNormal()} | p: [${bottomPlane.getPoint()}] | 
    topPlane[n: ${topPlane.getNormal()} | p: [${topPlane.getPoint()}] | `)

    //returns true if voxel intersects or is in frustum, false if it's outside
    const isInFrustum = (v: Vector3)=>{

        const voxelSize = obj.getVoxelSize();
        const voxelMin = new Vector3(
            (v.x - obj.size.x / 2) * voxelSize,
            (v.y - obj.size.y / 2) * voxelSize,
            (v.z - obj.size.z / 2) * voxelSize
        );

        const voxelMax = voxelMin.addScalar(voxelSize);
        
        if(v.equals(new Vector3(10,10,10))){
        console.log(`[marquee] sample vortex data (pos: (10,10,10)): 
        voxelSize[${voxelSize}] | voxelMin[${voxelMin}]
        voxelMax[${voxelMax}] `)}
        
        if(planeAABBIntersection(voxelMin, voxelMax, leftPlane) === "outside"){
            return false;
        }
        if(planeAABBIntersection(voxelMin, voxelMax, rightPlane) === "outside"){
            return false;
        }
        if(planeAABBIntersection(voxelMin, voxelMax, topPlane) === "outside"){
            return false;
        }
        if(planeAABBIntersection(voxelMin, voxelMax, bottomPlane) === "outside"){
            return false;
        }
        if(planeAABBIntersection(voxelMin, voxelMax, farPlane) === "outside" ){
            return false;
        }
        if(planeAABBIntersection(voxelMin, voxelMax, nearPlane) === "outside"){
            return false;
        }                                        
        return true;
    }


    for(let x = 0; x < obj.size.x; x++){
        for(let y = 0; y < obj.size.y; y++){
            for(let z = 0; z < obj.size.z; z++){
                const v = new Vector3(x,y,z);
                if(obj.voxelExists(v) && isInFrustum(v)){
                    out.push(v);
                }
            }        
        }        
    }

    console.log(`[marquee] voxels found in frustrum: ${out.length}  `)
    return out;
}