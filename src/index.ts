import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RsbuildPlugin } from '@rsbuild/core';

type MaybePromise<T> = T | Promise<T>;

export interface PluginMcpOptions {
  /**
   * The root route to the MCP server. Defaults to `/__mcp`.
   */
  mcpRouteRoot?: string | undefined;

  /**
   * Setup the MCP server, this is called when the MCP server is created.
   *
   * @example
   *
   * Extend the MCP server:
   *
   * ```js
   * import { defineConfig } from '@rsbuild/core'
   * import { pluginMcp } from 'rsbuild-plugin-mcp'
   *
   * export default defineConfig({
   *   plugins: [
   *     pluginMcp({
   *       mcpServerSetup(mcpServer) {
   *         // Register tools, resources and prompts
   *         mcpServer.tool()
   *         mcpServer.resource()
   *         mcpServer.prompt()
   *       },
   *     }),
   *   ],
   * })
   * ```
   *
   * @example
   *
   * Override the MCP server:
   *
   * ```js
   * import { defineConfig } from '@rsbuild/core'
   * import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
   * import { pluginMcp } from 'rsbuild-plugin-mcp'
   *
   * export default defineConfig({
   *   plugins: [
   *     pluginMcp({
   *       mcpServerSetup() {
   *         // Create a new `McpServer` and return
   *         const mcpServer = new McpServer()
   *         // Register tools, resources and prompts
   *         mcpServer.tool()
   *         return mcpServer
   *       },
   *     }),
   *   ],
   * })
   * ```
   *
   * @param mcpServer - The default MCP server.
   * Use `mcpServer.tool`, `mcpServer.resource` or `mcpServer.prompt` to extend the server.
   *
   * @returns If a new MCP server is returned, it will replace the default one.
   */
  mcpServerSetup?: (
    mcpServer: McpServer,
  ) => MaybePromise<void> | MaybePromise<McpServer>;
}

export const pluginMcp = (options?: PluginMcpOptions): RsbuildPlugin => ({
  name: 'plugin-mcp',

  apply: 'serve',

  async setup(api) {
    let mcpServer = await import('./server.js').then(({ createMcpServer }) => createMcpServer(api));

    mcpServer = (await options?.mcpServerSetup?.(mcpServer)) ?? mcpServer;
    api.expose('rsbuild-plugin-mcp:mcpServer', mcpServer);

    const base = options?.mcpRouteRoot ?? '/__mcp';

    const { setupRoutes } = await import('./connect.js');
    setupRoutes(api, base, mcpServer);

    api.modifyRsbuildConfig((config, { mergeRsbuildConfig }) => {
      if (config.server?.printUrls === false) {
        return;
      }

      return mergeRsbuildConfig(config, {
        server: {
          printUrls(params) {
            if (typeof config.server?.printUrls === 'function') {
              const urls = config.server.printUrls(params);
              if (Array.isArray(urls)) {
                params.urls = urls;
              }
            }

            const { port, protocol, urls } = params;

            return urls.concat(`${protocol}://localhost:${port}${base}/sse`);
          },
        },
      });
    });
  },
});

/**
 * @deprecated - Use {@link pluginMcp} instead.
 */
export const pluginMCP = pluginMcp;
