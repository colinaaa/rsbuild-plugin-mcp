# rsbuild-plugin-mcp

Rsbuild plugin that enables a MCP server for your Rsbuild app to provide information about your setup and modules graphs.

<p>
  <a href="https://npmjs.com/package/rsbuild-plugin-mcp">
   <img src="https://img.shields.io/npm/v/rsbuild-plugin-mcp?style=flat-square&colorA=564341&colorB=EDED91" alt="npm version" />
  </a>
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="license" />
  <a href="https://npmcharts.com/compare/rsbuild-plugin-mcp?minimal=true"><img src="https://img.shields.io/npm/dm/rsbuild-plugin-mcp.svg?style=flat-square&colorA=564341&colorB=EDED91" alt="downloads" /></a>
</p>

## Usage

Install:

```bash
npm add rsbuild-plugin-mcp -D
```

Add plugin to your `rsbuild.config.ts`:

```ts
import { defineConfig } from '@rsbuild/core';
import { pluginMcp } from 'rsbuild-plugin-mcp';

export default defineConfig({
  plugins: [pluginMcp()],
});
```

## Options

### `mcpRouteRoot`

- Type: `string | undefined`
- Default: `/__mcp`

Customize the routes of the MCP server.

- Example:

```ts
import { defineConfig } from '@rsbuild/core';
import { pluginMcp } from 'rsbuild-plugin-mcp';

export default defineConfig({
  plugins: [
    pluginMcp({
      mcpRouteRoot: '/api/__mcp',
    }),
  ],
});
```

## Customize the MCP server

The MCP server can be extended with the following ways:

### With plugin options

Use the `mcpServerSetup` to customize the MCP server.

```ts
import { defineConfig } from '@rsbuild/core';
import { pluginMcp } from 'rsbuild-plugin-mcp';

export default defineConfig({
  plugins: [
    pluginMcp({
      mcpServerSetup(mcpServer) {
        // Register tools, resources and prompts
        mcpServer.tool(); /** args */
        mcpServer.resource(); /** args */
        mcpServer.prompt(); /** args */
      },
    }),
  ],
});
```

You may also return a new `McpServer` instance to replace the default one:

```js
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { defineConfig } from '@rsbuild/core';
import { pluginMcp } from 'rsbuild-plugin-mcp';

export default defineConfig({
  plugins: [
    pluginMcp({
      mcpServerSetup() {
        // Create a new `McpServer` and return
        const mcpServer = new McpServer();
        // Register tools, resources and prompts
        mcpServer.tool();
        return mcpServer;
      },
    }),
  ],
});
```

### With other plugins

This plugin exposes the `McpServer` instance using [`api.expose`](https://rsbuild.rs/plugins/dev/core#apiexpose).

You may use [`api.useExposed`](https://rsbuild.rs/plugins/dev/core#apiuseexposed) to get the instance and make customization:

```ts
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { RsbuildPlugin } from '@rsbuild/core'

export function pluginFoo(): RsbuildPlugin {
  return {
    name: 'plugin-foo',
    pre: ['plugin-mcp'],
    setup(api) {
      if (api.isPluginExists('plugin-mcp')) {
        const mcpServer = api.useExposed<McpServer>('rsbuild-plugin-mcp:mcpServer')!
        // Register tools, resources and prompts
        mcpServer.tool(/** args */)
        mcpServer.resource(/** args */)
        mcpServer.prompt(/** args */)
      }
    },
  },
}
```

## Credits

This plugin is inspired by [vite-plugin-mcp](https://github.com/antfu/nuxt-mcp/tree/main/packages/vite-plugin-mcp). Both the implementation and documentation have been adapted and referenced from the original Vite plugin.

## License

[MIT](./LICENSE).
