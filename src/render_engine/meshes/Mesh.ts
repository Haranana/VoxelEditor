export type Mesh = {
    vertices: Float32Array,
    primitiveState: GPUPrimitiveState,
    depthStencilState: GPUDepthStencilState,
    indices: Uint32Array,
    layout: VertexLayout,
}

export type VertexLayout = {
    stride: number,
    attributes: GPUVertexAttribute[]
}