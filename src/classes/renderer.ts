import { makeShaderDataDefinitions, makeStructuredView, type StructuredView } from "webgpu-utils";
import { filledObjectShader, gizmoShader, gridShader, outlineShader, wireframeShader} from "../shaders/baseRenderableObjectShaders";
import { Gizmos, type RenderGizmosOptions, type RenderSceneOptions, type Scene } from "./scene";
import { Matrices4 } from "../math/matrices";
import { RenderTechniqueType, type Mesh, type RenderableObject } from "./renderableObject";
import { VoxelObject } from "./voxelObject";
import { Vector2 } from "../math/vector2.type";
import type { SceneObject } from "./sceneObject";

export type RenderTechniqueResources = {
    renderPipeline: GPURenderPipeline,
    bindGroup: GPUBindGroup,
    uniformBuffer: GPUBuffer,
    uniformBufferView: StructuredView,
    shader: GPUShaderModule,
}

export type MeshGPUResources = {
    indexBuffer: GPUBuffer,
    vertexBuffer: GPUBuffer,
}

class GPUMeshCache{
    cache: Map<Mesh, MeshGPUResources> = new Map();
    get(m: Mesh) : MeshGPUResources | undefined{
        return this.cache.get(m);
    }
    set(m: Mesh, res: MeshGPUResources){
        this.cache.set(m,res);
    }
    delete(m: Mesh){
        const obj = this.cache.get(m);
        if(!obj) return;
        obj.vertexBuffer.destroy();
        obj.indexBuffer.destroy();
        this.cache.delete(m);
    }
}

//returns array of RenderableObjects to render in each frame based on scene and render options
class SceneRenderCollector{
    public static collect(scene: Scene, renderGizmoOptions: RenderGizmosOptions, renderSceneOptions: RenderSceneOptions): RenderableObject[]{
        const out: RenderableObject[] = [];
        
        const isSelectedVoxelObject = (obj: SceneObject) =>{
            if(!(obj instanceof VoxelObject)) return false;
            if(!scene.getSelectedVoxelObject()) return false;
            if(scene.getSelectedVoxelObject()!.sceneId!=obj.sceneId) return false;
            return true;
        }

        scene.getObjectsOfType(VoxelObject).forEach((obj)=>{
            if(renderSceneOptions.voxelObject && isSelectedVoxelObject(obj)) return;
            out.push(obj.getRenderableObject());
        });
        const selectedVoxelObject = scene.getSelectedVoxelObject();
        if(selectedVoxelObject){
            if(renderSceneOptions.voxelObjectWireframe){
                const newRenderableObject = selectedVoxelObject.getObjectGrid();
                out.push(newRenderableObject);
            }
            if(renderSceneOptions.borderGrid){
                const newRenderableObject = selectedVoxelObject.getBorderGrid();
                out.push(newRenderableObject);
            }
            if(renderSceneOptions.borderOutline){
                const newRenderableObject = selectedVoxelObject.getBorderWire();
                out.push(newRenderableObject);
            }
            const selectedObjectSelectedArea = selectedVoxelObject.getSelectedArea();
            out.push(selectedObjectSelectedArea);

            if(renderGizmoOptions.cameraControllGizmo){
                const newRenderableObject = Gizmos.getCameraControllGizmo();
                out.push(newRenderableObject);
            }
            if(renderGizmoOptions.objectMoveGizmo){
                const newRenderableObject = Gizmos.getObjectMoveGizmo();
                out.push(newRenderableObject);
            }
            if(renderGizmoOptions.objectResizeGizmo){
                const newRenderableObject = Gizmos.getObjectResizeGizmo();
                out.push(newRenderableObject);
            }
            if(renderGizmoOptions.objectRotateGizmo){
                const newRenderableObject = Gizmos.getObjectRotateGizmo();
                out.push(newRenderableObject);
            }
        }
                
        return out;
    }
}

export class Renderer{

    #renderTechniques : Map<RenderTechniqueType, RenderTechniqueResources> = new Map();

    //because of this cache, meshes need to be treated as effectively immutable, 
    //also any method which deletes mesh should probably also delete it from this map
    #meshCache: GPUMeshCache = new GPUMeshCache();

    #device: GPUDevice | null  = null
    #canvas: HTMLCanvasElement | null = null
    #context: GPUCanvasContext | null = null
    #presentationFormat: GPUTextureFormat | null = null
    #depthTexture: GPUTexture | null = null
    #renderPassDescriptor: GPURenderPassDescriptor | null = null
    initialized: boolean = false;
    initializing: boolean = false;

    constructor(){}

    async init(canvas: HTMLCanvasElement): Promise<boolean>{
        if(this.initialized || this.initializing) return false;
        this.initializing = true;
        const adapter = await navigator.gpu?.requestAdapter();
        if(!adapter) {
            return false;
        }

        console.log("gimmie this device");
        const device = await adapter.requestDevice();
        if (!device) {
            return false;
        }

        const context = canvas.getContext('webgpu');
        if(!context){
            return false;
        }

        this.#device = device;
        this.#canvas =canvas;
        this.#context = context;
        this.#presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        
        context.configure({
            device,
            format: this.#presentationFormat,
            alphaMode: 'premultiplied'
        });
        const canvasTexture = this.#context.getCurrentTexture();
        this.#depthTexture = this.#device.createTexture({
            size: [canvasTexture.width, canvasTexture.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.#renderPassDescriptor = {
        label: `basic canvas renderPass`,
        colorAttachments: [
            {
                view: canvasTexture.createView(),
                loadOp: 'clear',
                storeOp: 'store',                    
            },
        ],
            depthStencilAttachment: {
            view: this.#depthTexture.createView(),
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
            },
        };

        this.#loadRenderTechniques();
        
        this.initialized = true;
        this.initializing = false;
        return true
    }

    updateDepthTexture(){
        if(!this.initialized) false;
        const context = this.#context!;
        const device = this.#device!;

        const canvasTexture = context.getCurrentTexture();
        this.#depthTexture = device.createTexture({
            size: [canvasTexture.width, canvasTexture.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        this.#renderPassDescriptor = {
        label: `basic canvas renderPass`,
        colorAttachments: [
            {
                view: canvasTexture.createView(),
                loadOp: 'clear',
                storeOp: 'store',                    
            },
        ],
            depthStencilAttachment: {
            view: this.#depthTexture.createView(),
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
            },
        };
    }

    #loadRenderTechniques(): void{
        this.#loadGizmoRenderTechnique();
        this.#loadFilledRenderTechnique();
        this.#loadWireframeRenderTechnique();
        this.#loadGridRenderTechnique();
        this.#loadOutlineRenderTechnique();
    }

    #loadGizmoRenderTechnique(): void{        
        const device = this.#device;
        if(!device) return;

        const shaderCode = gizmoShader();
        const shaderModule = device.createShaderModule({
            label: 'camera controlls gizmo shader module',
            code: shaderCode,
        });

        const bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: { type: "uniform" },
            },
        ],
        });

        const uniformBufferView = makeStructuredView(makeShaderDataDefinitions(shaderCode).uniforms.uniformData);
        const uniformBuffer = device.createBuffer({
            label: 'uniform buffer',
            size: uniformBufferView.arrayBuffer.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
        });

        const renderPipeline = device.createRenderPipeline({
            label: 'Selected object mesh pipeline',
            layout: pipelineLayout,
            vertex: {
                entryPoint: `vertexShader`,
                module: shaderModule,
                buffers:[
                    {
                        arrayStride: 4*4,
                        attributes:[
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x3',
                            },
                            {
                                shaderLocation: 1,
                                offset: 12,
                                format: 'unorm8x4',
                            },
                        ]
                    }
                ]
            },
            fragment: {
                entryPoint: `fragmentShader`,
                module: shaderModule,
                targets: [{format: this.#presentationFormat!}],
            },
            primitive: {
                topology: "triangle-list",
                cullMode: 'none',
            },
            depthStencil: {
                depthWriteEnabled: false,
                depthCompare: 'always',
                format: 'depth24plus',
            },
        });

        const bindGroup = device.createBindGroup({
            label: 'bind group for uniform data',
            layout: bindGroupLayout,
            entries:[{
                binding: 0,
                resource: {buffer: uniformBuffer},
            }]
        })

        this.#renderTechniques.set(RenderTechniqueType.GIZMO, {
                renderPipeline,
                bindGroup,
                uniformBuffer,
                uniformBufferView,
                shader: shaderModule,
        })
    }

    #loadFilledRenderTechnique(): void{
        const device = this.#device;
        if(!device) return;

        const shaderCode = filledObjectShader();
        const shaderModule = device.createShaderModule({
            label: 'voxel object shader module',
            code: shaderCode,
        });

        const bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: { type: "uniform" },
            },
        ],
        });

        const uniformBufferView = makeStructuredView(makeShaderDataDefinitions(shaderCode).uniforms.uniformData);
        const uniformBuffer = device.createBuffer({
            label: 'uniform buffer',
            size: uniformBufferView.arrayBuffer.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
        });

        const renderPipeline = device.createRenderPipeline({
            label: 'Selected object mesh pipeline',
            layout: pipelineLayout,
            vertex: {
                entryPoint: `vertexShader`,
                module: shaderModule,
                buffers:[
                    {
                        arrayStride: 6*4,
                        attributes:[
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x3',
                            },
                            {
                                shaderLocation: 1,
                                offset: 12,
                                format: 'unorm8x4',
                            },
                            {
                                shaderLocation: 2,
                                offset: 16,
                                format: 'float32x2',
                            },
                        ]
                    }
                ]
            },
            fragment: {
                entryPoint: `fragmentShader`,
                module: shaderModule,
                targets: [{
                    format: this.#presentationFormat!,
                    blend: {
                        color: {
                            srcFactor: "src-alpha",
                            dstFactor: "one-minus-src-alpha",
                            operation: "add",
                        },
                        alpha: {
                            srcFactor: "one",
                            dstFactor: "one-minus-src-alpha",
                            operation: "add",
                        },
                    },
                }],
            },
            primitive: {
                topology: "triangle-list",
                cullMode: 'front',
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            },
        });

        const bindGroup = device.createBindGroup({
            label: 'bind group for uniform data',
            layout: bindGroupLayout,
            entries:[{
                binding: 0,
                resource: {buffer: uniformBuffer!},
            }]
        })

        
        this.#renderTechniques.set(RenderTechniqueType.FILLED, {
                renderPipeline,
                bindGroup,
                uniformBuffer,
                uniformBufferView,
                shader: shaderModule,
        })
    }

    #loadGridRenderTechnique(): void{
        const device = this.#device!;
        if(!device) return;
        
        const shaderCode = gridShader();
        const shaderModule = device.createShaderModule({
            label: 'voxel object shader module',
            code: shaderCode,
        });

        const bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: { type: "uniform" },
            },
        ],
        });

        const uniformBufferView = makeStructuredView(makeShaderDataDefinitions(shaderCode).uniforms.uniformData);
        const uniformBuffer = device.createBuffer({
            label: 'uniform buffer',
            size: uniformBufferView.arrayBuffer.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
        });

        const renderPipeline = device.createRenderPipeline({
            label: 'Selected object mesh pipeline',
            layout: pipelineLayout,
            vertex: {
                entryPoint: `vertexShader`,
                module: shaderModule,
                buffers:[
                    {
                        arrayStride: 6*4,
                        attributes:[
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x3',
                            },
                            {
                                shaderLocation: 1,
                                offset: 12,
                                format: 'unorm8x4',
                            },
                            {
                                shaderLocation: 2,
                                offset: 16,
                                format: 'float32x2',
                            },
                        ]
                    }
                ]
            },
            fragment: {
                entryPoint: `fragmentShader`,
                module: shaderModule,
                targets: [{
                    format: this.#presentationFormat!,
                    blend: {
                        color: {
                            srcFactor: 'src-alpha',
                            dstFactor: 'one-minus-src-alpha',
                            operation: 'add',
                        },
                        alpha: {
                            srcFactor: 'one',
                            dstFactor: 'one-minus-src-alpha',
                            operation: 'add',
                        },
                    },
                }],
            },
            primitive: {
                topology: "triangle-list",
                cullMode: 'back',
            },
            depthStencil: {
                depthCompare: 'less',
                depthWriteEnabled: false,
                format: 'depth24plus',
            },
        });

        const bindGroup = device.createBindGroup({
            label: 'bind group for uniform data',
            layout: bindGroupLayout,
            entries:[{
                binding: 0,
                resource: {buffer: uniformBuffer!},
            }]
        })

        this.#renderTechniques.set(RenderTechniqueType.GRID, {
            renderPipeline,
            bindGroup,
            uniformBuffer,
            uniformBufferView,
            shader: shaderModule,
        })
    }

    #loadWireframeRenderTechnique(): void{
        const device = this.#device!;
        if(!device) return;

        const shaderCode = wireframeShader();
        const shaderModule = device.createShaderModule({
            label: 'voxel object shader module',
            code: shaderCode,
        });

        const bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: { type: "uniform" },
            },
        ],
        });

        const uniformBufferView = makeStructuredView(makeShaderDataDefinitions(shaderCode).uniforms.uniformData);
        const uniformBuffer = device.createBuffer({
            label: 'uniform buffer',
            size: uniformBufferView.arrayBuffer.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
        });

        const renderPipeline = device.createRenderPipeline({
            label: 'Selected object mesh pipeline',
            layout: pipelineLayout,
            vertex: {
                entryPoint: `vertexShader`,
                module: shaderModule,
                buffers:[
                    {
                        arrayStride: 6*4,
                        attributes:[
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x3',
                            },
                            {
                                shaderLocation: 1,
                                offset: 12,
                                format: 'unorm8x4',
                            },
                            {
                                shaderLocation: 2,
                                offset: 16,
                                format: 'float32x2',
                            },
                        ]
                    }
                ]
            },
            fragment: {
                entryPoint: `fragmentShader`,
                module: shaderModule,
                targets: [{format: this.#presentationFormat!}],
            },
            primitive: {
                topology: "triangle-list",
                cullMode: 'front',
            },
            depthStencil: {
                depthWriteEnabled: false,
                depthCompare: 'less-equal',
                format: 'depth24plus',

                depthBias: -1,
                depthBiasSlopeScale: -1,
                depthBiasClamp: 0,
            },
        });

        const bindGroup = device.createBindGroup({
            label: 'bind group for uniform data',
            layout: bindGroupLayout,
            entries:[{
                binding: 0,
                resource: {buffer: uniformBuffer!},
            }]
        })

        
        this.#renderTechniques.set(RenderTechniqueType.WIREFRAME, {
                renderPipeline,
                bindGroup,
                uniformBuffer,
                uniformBufferView,
                shader: shaderModule,
        })        
    }

    #loadOutlineRenderTechnique(): void{
        const device = this.#device!;
        if(!device) return;

        const shaderCode = outlineShader();
        const shaderModule = device.createShaderModule({
            label: 'voxel object shader module',
            code: shaderCode,
        });

        const bindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: { type: "uniform" },
            },
        ],
        });

        const uniformBufferView = makeStructuredView(makeShaderDataDefinitions(shaderCode).uniforms.uniformData);
        const uniformBuffer = device.createBuffer({
            label: 'uniform buffer',
            size: uniformBufferView.arrayBuffer.byteLength,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
        });

        const renderPipeline = device.createRenderPipeline({
            label: 'Selected object mesh pipeline',
            layout: pipelineLayout,
            vertex: {
                entryPoint: `vertexShader`,
                module: shaderModule,
                buffers:[
                    {
                        arrayStride: 6*4,
                        attributes:[
                            {
                                shaderLocation: 0,
                                offset: 0,
                                format: 'float32x3',
                            },
                            {
                                shaderLocation: 1,
                                offset: 12,
                                format: 'unorm8x4',
                            },
                            {
                                shaderLocation: 2,
                                offset: 16,
                                format: 'float32x2',
                            },
                        ]
                    }
                ]
            },
            fragment: {
                entryPoint: `fragmentShader`,
                module: shaderModule,
                targets: [{format: this.#presentationFormat!}],
            },
            primitive: {
                topology: "triangle-list",
                cullMode: 'back',
            },
            depthStencil: {
                depthCompare: 'less-equal',
                depthWriteEnabled: true,
                format: 'depth24plus',
            },
        });

        const bindGroup = device.createBindGroup({
            label: 'bind group for uniform data',
            layout: bindGroupLayout,
            entries:[{
                binding: 0,
                resource: {buffer: uniformBuffer!},
            }]
        })

        this.#renderTechniques.set(RenderTechniqueType.OUTLINE, {
            renderPipeline,
            bindGroup,
            uniformBuffer,
            uniformBufferView,
            shader: shaderModule,
        })
    }

    renderScene(scene: Scene, renderGizmoOptions: RenderGizmosOptions, renderSceneOptions: RenderSceneOptions){
        if(!this.initialized) return false;

        const device = this.#device!;
        const context = this.#context!;
        const canvas = this.#canvas!
        this.resizeCanvas();
        const canvasTexture = context.getCurrentTexture();

        if (this.#depthTexture!.width !== canvasTexture.width ||
            this.#depthTexture!.height !== canvasTexture.height) {

            this.#depthTexture!.destroy();
            this.updateDepthTexture();
        };

        const camera = scene.getActiveCamera();
        if(!camera) return;

        const encoder : GPUCommandEncoder = device.createCommandEncoder({
            label: 'GPU command encoder'
        });

        this.#renderPassDescriptor = {
        label: `basic canvas renderPass`,
        colorAttachments: [
            {
                view: canvasTexture.createView(),
                loadOp: 'clear',
                storeOp: 'store',                    
            },
        ],
            depthStencilAttachment: {
            view: this.#depthTexture!.createView(),
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
            },
        };
        const pass : GPURenderPassEncoder = encoder.beginRenderPass(this.#renderPassDescriptor!);
        
        //update uniform buffers on each render technique
        //as for now each technique shares the same uniform buffer, so it's all the same
        const ndcProjection = camera.getProjectionMatrix(new Vector2(canvas.width, canvas.height));
        const shadersUniformsValuesResolution = [canvas.width, canvas.height];

        this.#renderTechniques.forEach((v)=>{
            v.uniformBufferView!.set({
                resolution: shadersUniformsValuesResolution,
                objectTransform: Matrices4.identity().toArrays(), //remnant of the prevoius architecture, will be deleted in the future
                ndcProjection: ndcProjection.toArrays(),
                viewMatrix: camera.getCameraView().toArrays(),
            });
            device.queue.writeBuffer(v.uniformBuffer!, 0, v.uniformBufferView!.arrayBuffer);
        });
        
        
        //render each object
        const objectsToRender: RenderableObject[] = SceneRenderCollector.collect(scene, renderGizmoOptions, renderSceneOptions);
        objectsToRender.forEach((obj)=>{
            if(!obj.mesh || !obj.material) return;
            const renderTechnique: RenderTechniqueResources | undefined = this.#renderTechniques.get(obj.material.renderTechnique)
            if(!renderTechnique) return;

            const meshResources = this.#meshCache.get(obj.mesh); 
            let vertexBuffer;
            let indexBuffer;
            if(meshResources){
                vertexBuffer = meshResources.vertexBuffer;
                indexBuffer = meshResources.indexBuffer;
            }else{    
                vertexBuffer = device.createBuffer({
                    label: 'vertex data buffer',
                    size: obj.mesh.vertices.byteLength,
                    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
                });
                device.queue.writeBuffer(vertexBuffer , 0 , obj.mesh.vertices);

                indexBuffer = device.createBuffer({
                    label: 'index data buffer',
                    size: obj.mesh.indices.byteLength,
                    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
                });
                device.queue.writeBuffer(indexBuffer, 0 , obj.mesh.indices);     
                this.#meshCache.set(obj.mesh, {
                    vertexBuffer,
                    indexBuffer,
                });                 
            }
            pass.setPipeline(renderTechnique.renderPipeline);
            pass.setVertexBuffer(0 , vertexBuffer);
            pass.setIndexBuffer(indexBuffer, "uint32");
            pass.setBindGroup(0, renderTechnique.bindGroup);
            pass.drawIndexed(obj.mesh.indices.length);
        });

        pass.end();
        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
    }

    resizeCanvas() {
        if(!this.initialized) return;
        const canvas = this.#canvas!;
        const dpr = window.devicePixelRatio || 1;
        const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
        const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
    };
}