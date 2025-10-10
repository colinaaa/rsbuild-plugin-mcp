import { defineConfig } from '@rsbuild/core';
import { pluginMCP } from '../src';

export default defineConfig({
  plugins: [pluginMCP()],
});
