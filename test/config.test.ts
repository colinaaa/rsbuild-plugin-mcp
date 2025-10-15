import { createRsbuild } from '@rsbuild/core';
import { assert, describe, expect, rstest, test } from '@rstest/core';

describe('Config', () => {
  test('should not apply plugin when build', async () => {
    const { pluginMCP } = await import('../src/index.js');
    const rsbuild = await createRsbuild({
      rsbuildConfig: {
        plugins: [pluginMCP()],
      },
    });

    await rsbuild.initConfigs({ action: 'build' });

    expect(rsbuild.getRsbuildConfig().server?.printUrls).toBe(true);
  });

  describe('printUrls', () => {
    test('should respect server.printUrls = false', async () => {
      const { pluginMCP } = await import('../src/index.js');
      const rsbuild = await createRsbuild({
        rsbuildConfig: {
          server: {
            printUrls: false,
          },
          plugins: [pluginMCP()],
        },
      });

      await rsbuild.initConfigs({ action: 'dev' });

      expect(rsbuild.getRsbuildConfig().server?.printUrls).toBe(false);
    });

    test('should append MCP url to printed urls', async () => {
      const { pluginMCP } = await import('../src/index.js');
      const rsbuild = await createRsbuild({
        rsbuildConfig: {
          plugins: [pluginMCP()],
        },
      });

      await rsbuild.initConfigs({ action: 'dev' });

      const printUrls = rsbuild.getRsbuildConfig().server?.printUrls;

      assert.instanceOf(printUrls, Function);

      expect(
        printUrls({ protocol: 'http', port: 3001, routes: [], urls: [] }),
      ).toEqual([
        {
          label: 'MCP:',
          url: 'http://localhost:3001/__mcp/sse',
        },
      ]);
    });

    test('should append MCP url to custom printUrls', async () => {
      const fn = rstest
        .fn()
        .mockReturnValue(['http://localhost:3000', 'https://example.com']);

      const { pluginMCP } = await import('../src/index.js');
      const rsbuild = await createRsbuild({
        rsbuildConfig: {
          plugins: [pluginMCP()],
          server: {
            printUrls: fn,
          },
        },
      });

      await rsbuild.initConfigs({ action: 'dev' });

      const printUrls = rsbuild.getRsbuildConfig().server?.printUrls;

      assert.instanceOf(printUrls, Function);

      expect(
        printUrls({ protocol: 'http', port: 3002, routes: [], urls: [] }),
      ).toEqual([
        'http://localhost:3000',
        'https://example.com',
        {
          label: 'MCP:',
          url: 'http://localhost:3002/__mcp/sse',
        },
      ]);
    });
  });

  describe('Server', () => {
    test('should have middleware routes registered', async () => {
      const { pluginMCP } = await import('../src/index.js');
      const rsbuild = await createRsbuild({
        rsbuildConfig: {
          plugins: [pluginMCP()],
        },
      });
      const rawRsbuild = await createRsbuild();

      const server = await rsbuild.createDevServer({
        runCompile: false,
      });
      const rawServer = await rawRsbuild.createDevServer({
        runCompile: false,
      });

      expect(server.middlewares.stack).toHaveLength(
        rawServer.middlewares.stack.length + 2,
      );
      expect(server.middlewares.stack).toContainEqual({
        route: '/__mcp/sse',
        handle: expect.any(Function),
      });
      expect(server.middlewares.stack).toContainEqual({
        route: '/__mcp/messages',
        handle: expect.any(Function),
      });
    });

    test('mcpRouteRoot', async () => {
      const { pluginMCP } = await import('../src/index.js');
      const rsbuild = await createRsbuild({
        rsbuildConfig: {
          plugins: [pluginMCP({ mcpRouteRoot: '/foo' })],
        },
      });

      const server = await rsbuild.createDevServer({
        runCompile: false,
      });
      expect(server.middlewares.stack).toContainEqual({
        route: '/foo/sse',
        handle: expect.any(Function),
      });
      expect(server.middlewares.stack).toContainEqual({
        route: '/foo/messages',
        handle: expect.any(Function),
      });
    });
  });
});
