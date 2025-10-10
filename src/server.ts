import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { RsbuildPluginAPI } from '@rsbuild/core';

import pkg from '../package.json' with { type: 'json' };

export function createMcpServer(api: RsbuildPluginAPI) {
  const server = new McpServer({
    name: 'rsbuild',
    version: pkg.version,
  });

  server.tool(
    'get-rsbuild-config',
    'Get the fully resolved Rsbuild config',
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(api.getRsbuildConfig()),
          },
        ],
      };
    },
  );

  return server;
}
