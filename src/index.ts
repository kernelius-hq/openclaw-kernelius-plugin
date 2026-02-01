import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { kerneliusPlugin } from "./channel.js";
import { setKerneliusRuntime } from "./runtime.js";

const plugin = {
  id: "kernelius",
  name: "Kernelius Forge",
  description: "Connect to Kernelius Forge repositories, issues, and pull requests",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    setKerneliusRuntime(api.runtime);
    api.registerChannel({ plugin: kerneliusPlugin });
  },
};

export default plugin;
