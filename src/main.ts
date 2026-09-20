import {
    InitGPU
    , CreateGPUBuffer
    , CreateTransforms
    , CreateViewProjection
    , CreateAnimation
} from './helper';
import{vec3, mat4} from 'gl-matrix';
import{CubeData} from './vertex-data';
import shader from './shader.wgsl'
import $ from 'jquery';
import "./site.css";

const createCamera = require('3d-view-controls');

const Create3DObject = async (isAnimation = true) => {
    const gpu = await InitGPU();
    const device = gpu.device;

    // Vertex buffers
    const cubeData = CubeData();
    const numberOfVertices = cubeData.positions.length / 3;
    const vertexBuffer = CreateGPUBuffer(device, cubeData.positions);
    const colorBuffer = CreateGPUBuffer(device, cubeData.colors);

    const pipeline = device.createRenderPipeline({
        layout: "auto"
        , vertex: {
            module: device.createShaderModule({
                code: shader
            })
            , entryPoint: "vs_main"
            , buffers: [
                {
                    arrayStride: 12
                    , attributes: [{
                        shaderLocation: 0
                        , format: "float32x3"
                        , offset: 0
                    }]
                }
                , {
                    arrayStride: 12
                    , attributes: [{
                        shaderLocation: 1
                        , format: "float32x3"
                        , offset: 0
                    }]
                }
            ]
        }
        , fragment: {
            module: device.createShaderModule({
                code: shader
            })
            , entryPoint: "fs_main"
            , targets: [
                {
                    format: gpu.format as GPUTextureFormat
                }
            ]
        }
        , primitive: {
            topology: "triangle-list"
        }
        , depthStencil: {
            format: "depth24plus"
            , depthWriteEnabled: true
            , depthCompare: "less"
        }
    });

    // Uniform data
    const modelMatrix = mat4.create();
    const mvpMatrix = mat4.create();
    let vMatrix = mat4.create();
    let vpMatrix = mat4.create();

    const vp = CreateViewProjection(
        gpu.canvas.width / gpu.canvas.height
    );

    vpMatrix = vp.viewProjectionMatrix;

    // Rotation and camera
    let rotation = vec3.fromValues(0, 0, 0);
    var camera = createCamera(gpu.canvas, vp.cameraOption);

    // Uniform buffer and layout
    const uniformBuffer = device.createBuffer({
        size: 64
        , usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });

    const uniformBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0)
        , entries: [{
            binding: 0
            , resource: {
                buffer: uniformBuffer
                , offset: 0
                , size: 64
            }
        }]
    });

    let textureView = gpu.context.getCurrentTexture().createView();

    const depthTexture = device.createTexture({
        size: [gpu.canvas.width, gpu.canvas.height, 1]
        , format: "depth24plus"
        , usage: GPUTextureUsage.RENDER_ATTACHMENT
    });

    const renderPassDescription = {
        colorAttachments: [{
            view: textureView
            , clearValue: {r: 0.2, g: 0.247, b: 0.314, a: 1.0}
            , loadOp: 'clear'
            , storeOp: 'store'
        }]
        , depthStencilAttachment: {
            view: depthTexture.createView()
            , depthClearValue: 1.0
            , depthStoreOp: "store"
            , depthLoadOp: 'clear'
            , stencilClearValue: 0
        }
    };

    function draw() {
        if(!isAnimation) {
            if(camera.tick()) {
                const pMatrix = vp.projectionMatrix;

                vMatrix = camera.matrix;

                mat4.multiply(vpMatrix, pMatrix, vMatrix);
            }
        }

        CreateTransforms(modelMatrix, [0, 0, 0], rotation);
        mat4.multiply(mvpMatrix, vpMatrix, modelMatrix);

        device.queue.writeBuffer(
            uniformBuffer
            , 0
            , mvpMatrix as unknown as ArrayBuffer
        );

        textureView = gpu.context.getCurrentTexture().createView();
        renderPassDescription.colorAttachments[0].view = textureView;

        const commandEncoder = device.createCommandEncoder();

        const renderPass = commandEncoder.beginRenderPass(
            renderPassDescription as GPURenderPassDescriptor
        );

        renderPass.setPipeline(pipeline);
        renderPass.setVertexBuffer(0, vertexBuffer);
        renderPass.setVertexBuffer(1, colorBuffer);
        renderPass.setBindGroup(0, uniformBindGroup);
        renderPass.draw(numberOfVertices);
        renderPass.end();

        device.queue.submit([commandEncoder.finish()]);
    }

    CreateAnimation(draw, rotation, isAnimation);
}

let is_animation = true;

Create3DObject(is_animation);

$('#id-radio input:radio').on('click', function() {
    let val = $('input[name="options"]:checked').val();

    is_animation = val === 'animation' ? true : false;

    Create3DObject(is_animation);
});

window.addEventListener('resize', function() {
    Create3DObject(is_animation);
})