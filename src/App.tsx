import { useEffect, useRef } from "react";
import "./App.css";
import { useWebGPUChecker } from "./hooks";

function WebGPUApp({ device }: { device: GPUDevice }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("webgpu");
    if (ctx) {
      // Draw a red rectangle
      const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
      ctx.configure({
        device,
        format: presentationFormat
      });
      const module = device.createShaderModule({
        label: "our hardcoded red triangle shaders",
        code: `
      @vertex fn vs(
        @builtin(vertex_index) vertexIndex : u32
      ) -> @builtin(position) vec4f {
        let pos = array(
          vec2f( 0.0,  0.5),  // top center
          vec2f(-0.5, -0.5),  // bottom left
          vec2f( 0.5, -0.5)   // bottom right
        );
 
        return vec4f(pos[vertexIndex], 0.0, 1.0);
      }
 
      @fragment fn fs() -> @location(0) vec4f {
        return vec4f(1.0, 0.0, 0.0, 1.0);
      }
    `
      });
      const pipeline = device.createRenderPipeline({
        label: "our hardcoded red triangle pipeline",
        layout: "auto",
        vertex: {
          module,
          entryPoint: "vs"
        },
        fragment: {
          module,
          entryPoint: "fs",
          targets: [{ format: presentationFormat }]
        }
      });
      const renderPassDescriptor: GPURenderPassDescriptor = {
        label: "our basic canvas renderPass",
        colorAttachments: [
          {
            // view: <- to be filled out when we render
            clearValue: [0.3, 0.3, 0.3, 1],
            loadOp: "clear",
            storeOp: "store",
            view: ctx.getCurrentTexture().createView()
          }
        ]
      };
      const renderCanvas = () => {
        // Get the current texture from the canvas context and
        // set it as the texture to render to.
        // renderPassDescriptor.colorAttachments[0].view = ctx
        //   .getCurrentTexture()
        //   .createView();

        // make a command encoder to start encoding commands
        const encoder = device.createCommandEncoder({ label: "our encoder" });

        // make a render pass encoder to encode render specific commands
        const pass = encoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(pipeline);
        pass.draw(3); // call our vertex shader 3 times
        pass.end();

        const commandBuffer = encoder.finish();
        device.queue.submit([commandBuffer]);
      };
      renderCanvas();
    }
  }, [device]);

  return (
    <>
      <canvas ref={canvasRef} width="400" height="400"></canvas>
    </>
  );
}

function App() {
  const { isWebGPUSupported, gpuAdapter, gpuDevice } = useWebGPUChecker();
  if (!isWebGPUSupported) {
    // TODO
    return <></>;
  } else {
    console.log("WebGPUAdapter:", gpuAdapter);
    console.log("WebGPUDevice:", gpuDevice);
  }

  return (
    <>
      <WebGPUApp device={gpuDevice!} />
    </>
  );
}

export default App;
