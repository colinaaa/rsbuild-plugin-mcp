import { defineConfig } from '@rsbuild/core';
import { pluginMcp } from '../src';

export default defineConfig({
  plugins: [pluginMcp()],
});
