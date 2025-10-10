import type { RsbuildPlugin } from '@rsbuild/core';

export const pluginMCP = (): RsbuildPlugin => ({
  name: 'plugin-mcp',

  apply: 'serve',

  async setup(api) {
    const mcpServer = await import('./server.js').then(({ createMcpServer }) =>
      createMcpServer(api),
    );

    // TODO: make this configurable
    const base = '/__mcp';

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
