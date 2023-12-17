import { useEffect, useState } from "react";

export function useWebGPUChecker() {
  const [isWebGPUSupported, setIsWebGPUSupported] = useState(false);
  const [gpuAdapter, setGPUAdapter] = useState<GPUAdapter | null>(null);
  const [gpuDevice, setGPUDevice] = useState<GPUDevice | null>(null);

  useEffect(() => {
    async function checkWebGPUEnvironment() {
      try {
        const adapter = await navigator.gpu?.requestAdapter();
        if (adapter) {
          setGPUAdapter(adapter);
          const device = await adapter?.requestDevice();
          if (device) {
            setGPUDevice(device);
            setIsWebGPUSupported(true);
            return;
          }
        }
      } catch (error) {
        console.log("Error initializing WebGPU:", error);
      }
      setIsWebGPUSupported(false);
    }

    checkWebGPUEnvironment();
  }, []);

  return { isWebGPUSupported, gpuAdapter, gpuDevice };
}
