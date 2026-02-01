import type { OpenClawRuntime } from "openclaw/plugin-sdk";

let runtime: OpenClawRuntime | null = null;

export function setKerneliusRuntime(rt: OpenClawRuntime): void {
  runtime = rt;
}

export function getKerneliusRuntime(): OpenClawRuntime {
  if (!runtime) {
    throw new Error("Kernelius runtime not initialized");
  }
  return runtime;
}
