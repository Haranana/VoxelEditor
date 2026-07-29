import { ShaderResources} from "./shader-resource";

export class Shader{
    readonly code: string;
    readonly vertexEntryPoint: string;
    readonly fragmentEntryPoint: string;
    readonly resources: ShaderResources[];

    constructor(code: string, vertexEntryPoint: string, fragmentEntryPoint: string, resources: ShaderResources[]){
        this.code = code;
        this.vertexEntryPoint = vertexEntryPoint;
        this.fragmentEntryPoint = fragmentEntryPoint;
        this.resources = resources;
    }

    copy(){
        
    }
}

