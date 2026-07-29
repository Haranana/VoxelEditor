import { makeShaderDataDefinitions, makeStructuredView, type StructuredView } from "webgpu-utils"
import type { RenderableObject } from "../renderableObjects/renderableObject"
import type { RenderContext } from "../renderer"
import { Matrices4 } from "../../math/matrices"
import { degreeToRadians } from "../../math/utils"
import { Vector3 } from "../../math/vector3.type"

export type ShaderResourceContext = {
    object: RenderableObject,
    renderContext: RenderContext
}

export abstract class ShaderResources{
    readonly bindGroupNumber;
    initialized: boolean = false;
    constructor(bindGroupNumber: number){
        this.bindGroupNumber = bindGroupNumber;
    }
    abstract getBindGroup(): GPUBindGroup | null;
    abstract getBindGroupLayoutDescriptor(context: ShaderResourceContext): GPUBindGroupLayoutDescriptor;
    abstract init(context: ShaderResourceContext, layout: GPUBindGroupLayout): boolean;
    abstract update(context: ShaderResourceContext): boolean;
}

export class CameraShaderResources extends ShaderResources{

    initialized: boolean = false;
    uniformBufferView: StructuredView | null = null;
    uniformBuffer: GPUBuffer | null = null;
    bindGroup: GPUBindGroup | null = null;

    getBindGroup(): GPUBindGroup | null{
        return this.bindGroup;
    }
   
    getBindGroupLayoutDescriptor(): GPUBindGroupLayoutDescriptor{
        return {
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: "uniform" },
                },
            ],
        }
    }

    init(context: ShaderResourceContext, layout: GPUBindGroupLayout): boolean{
        const device : GPUDevice | null = context.renderContext.device;
        const queue : GPUQueue | null = context.renderContext.queue;        
        const shaderCode: string | undefined = context.object.material?.shader.code;
        if(!device || !queue || !shaderCode) return false;
        const bindGroupLayout = layout;
        this.uniformBufferView = makeStructuredView(makeShaderDataDefinitions(shaderCode).uniforms.cameraBuffer);
        this.uniformBuffer = device.createBuffer({
            label: 'uniform buffer',
            size: this.uniformBufferView.arrayBuffer.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.bindGroup = device.createBindGroup({
            label: 'bind group for uniform data',
            layout: bindGroupLayout,
            entries:[{
                binding: 0,
                resource: {buffer: this.uniformBuffer},
            }]
        })

        this.initialized = true;
        return true;
    }

    update(context: ShaderResourceContext): boolean{
        if(!this.initialized || !context.renderContext.queue || !context.renderContext.cameraContext) return false;
        this.uniformBufferView!.set({
            viewMatrix: context.renderContext.cameraContext.viewMatrix.toArrays(),
            ndcProjection: context.renderContext.cameraContext.ndcProjection.toArrays(),
        });
        context.renderContext.queue.writeBuffer(this.uniformBuffer!, 0, this.uniformBufferView!.arrayBuffer); 
        return true;
    }
}

export class WorldObjectShaderResources extends ShaderResources{

    initialized: boolean = false;
    uniformBufferView: StructuredView | null = null;
    uniformBuffer: GPUBuffer | null = null;
    bindGroup: GPUBindGroup | null = null;

    getBindGroup(): GPUBindGroup | null{
        return this.bindGroup;
    }
   
    getBindGroupLayoutDescriptor(): GPUBindGroupLayoutDescriptor{
        return {
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: "uniform" },
                },
            ],
        }
    }

    init(context: ShaderResourceContext, layout: GPUBindGroupLayout): boolean{
        const device : GPUDevice | null = context.renderContext.device;
        const queue : GPUQueue | null = context.renderContext.queue;        
        const shaderCode: string | undefined = context.object.material?.shader.code;
        if(!device || !queue || !shaderCode) return false;

        const bindGroupLayout = layout;
        this.uniformBufferView = makeStructuredView(makeShaderDataDefinitions(shaderCode).uniforms.objectBuffer);
        this.uniformBuffer = device.createBuffer({
            label: 'uniform buffer',
            size: this.uniformBufferView.arrayBuffer.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.bindGroup = device.createBindGroup({
            label: 'bind group for uniform data',
            layout: bindGroupLayout,
            entries:[{
                binding: 0,
                resource: {buffer: this.uniformBuffer},
            }]
        })

        this.initialized = true;
        return true;
    }

    update(context: ShaderResourceContext): boolean{
        const transform = context.object.worldTransform    
        if(!this.initialized || !context.renderContext.queue || !transform) return false;
        this.uniformBufferView!.set({
            translation: Matrices4.translation(transform.translation).toArrays(),
            rotation: Matrices4.rotation(degreeToRadians(transform.rotation.x), degreeToRadians(transform.rotation.y), degreeToRadians(transform.rotation.z)).toArrays(),
            scale: Matrices4.scaling(transform.scale).toArrays(),                
        });
        context.renderContext.queue.writeBuffer(this.uniformBuffer!, 0, this.uniformBufferView!.arrayBuffer);
        return true;
    }
}

export class ViewportShaderResources extends ShaderResources{

    initialized: boolean = false;
    uniformBufferView: StructuredView | null = null;
    uniformBuffer: GPUBuffer | null = null;
    bindGroup: GPUBindGroup | null = null;

    getBindGroup(): GPUBindGroup | null{
        return this.bindGroup;
    }
   
    getBindGroupLayoutDescriptor(): GPUBindGroupLayoutDescriptor{
        return {
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: "uniform" },
                },
            ],
        }
    }

    init(context: ShaderResourceContext, layout: GPUBindGroupLayout): boolean{
        const device : GPUDevice | null = context.renderContext.device;
        const queue : GPUQueue | null = context.renderContext.queue;        
        const shaderCode: string | undefined = context.object.material?.shader.code;
        if(!device || !queue || !shaderCode) return false;

        const bindGroupLayout = layout;
        this.uniformBufferView = makeStructuredView(makeShaderDataDefinitions(shaderCode).uniforms.viewportBuffer);
        this.uniformBuffer = device.createBuffer({
            label: 'uniform buffer',
            size: this.uniformBufferView.arrayBuffer.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.bindGroup = device.createBindGroup({
            label: 'bind group for uniform data',
            layout: bindGroupLayout,
            entries:[{
                binding: 0,
                resource: {buffer: this.uniformBuffer},
            }]
        })

        this.initialized = true;
        return true;
    }

    update(context: ShaderResourceContext): boolean{
        if(!this.initialized || !context.renderContext.queue || !context.renderContext.viewportContext) return false;
        this.uniformBufferView!.set({
            resolution: context.renderContext.viewportContext.resolution,   
        });
        context.renderContext.queue.writeBuffer(this.uniformBuffer!, 0, this.uniformBufferView!.arrayBuffer);
        return true;
    }
}

export class ScreenObjectShaderResources extends ShaderResources{
    initialized: boolean = false;
    uniformBufferView: StructuredView | null = null;
    uniformBuffer: GPUBuffer | null = null;
    bindGroup: GPUBindGroup | null = null;

    getBindGroup(): GPUBindGroup | null{
        return this.bindGroup;
    }
   
    getBindGroupLayoutDescriptor(): GPUBindGroupLayoutDescriptor{
        return {
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: "uniform" },
                },
            ],
        }
    }

    init(context: ShaderResourceContext, layout: GPUBindGroupLayout): boolean{
        const device : GPUDevice | null = context.renderContext.device;
        const queue : GPUQueue | null = context.renderContext.queue;        
        const shaderCode: string | undefined = context.object.material?.shader.code;
        if(!device || !queue || !shaderCode) return false;

        const bindGroupLayout = layout;
        this.uniformBufferView = makeStructuredView(makeShaderDataDefinitions(shaderCode).uniforms.uniformData);
        this.uniformBuffer = device.createBuffer({
            label: 'uniform buffer',
            size: this.uniformBufferView.arrayBuffer.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.bindGroup = device.createBindGroup({
            label: 'bind group for uniform data',
            layout: bindGroupLayout,
            entries:[{
                binding: 0,
                resource: {buffer: this.uniformBuffer},
            }]
        })

        this.initialized = true;
        return true;
    }

    update(context: ShaderResourceContext): boolean{
        const transform = context.object.screenTransform    
        if(!this.initialized || !context.renderContext.queue || !transform) return false;
        this.uniformBufferView!.set({
            anchor: Matrices4.translation(new Vector3(transform.anchor.x,transform.anchor.y, 0.0)).toArrays(),
            rotation: Matrices4.rotation(degreeToRadians(transform.rotation.x), degreeToRadians(transform.rotation.y), degreeToRadians(transform.rotation.z)).toArrays(),
            scale: Matrices4.scaling(transform.scale).toArrays(),                
        });
        context.renderContext.queue.writeBuffer(this.uniformBuffer!, 0, this.uniformBufferView!.arrayBuffer);
        return true;
    }
}