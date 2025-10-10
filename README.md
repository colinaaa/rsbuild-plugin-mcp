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
// rsbuild.config.ts
import { pluginMCP } from "rsbuild-plugin-mcp";

export default {
  plugins: [pluginMCP()],
};
```

## License

[MIT](./LICENSE).
