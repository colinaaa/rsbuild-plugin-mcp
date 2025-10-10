import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import type { RsbuildPluginAPI } from '@rsbuild/core';

export function setupRoutes(
  api: RsbuildPluginAPI,
  base: string,
  mcpServer: McpServer,
): void {
  const transports = new Map<string, SSEServerTransport>();

  api.onBeforeStartDevServer(({ server }) => {
    server.middlewares.use(`${base}/sse`, async (_, res) => {
      const transport = new SSEServerTransport(`${base}/messages`, res);
      transports.set(transport.sessionId, transport);
      api.logger.debug('SSE Connected %s', transport.sessionId);
      res.on('close', () => {
        transports.delete(transport.sessionId);
      });
      await mcpServer.connect(transport);
    });

    server.middlewares.use(`${base}/messages`, async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method Not Allowed');
        return;
      }

      const query = new URLSearchParams(req.url?.split('?').pop() || '');
      const clientId = query.get('sessionId');

      if (!clientId || typeof clientId !== 'string') {
        res.statusCode = 400;
        res.end('Bad Request');
        return;
      }

      const transport = transports.get(clientId);
      if (!transport) {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }

      api.logger.debug('Message from %s', clientId);
      await transport.handlePostMessage(req, res);
    });
  });
}
