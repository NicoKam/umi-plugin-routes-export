# umi-plugin-routes-exports

[![NPM version](https://img.shields.io/npm/v/umi-plugin-routes-exports.svg?style=flat)](https://npmjs.org/package/umi-plugin-routes-exports) [![NPM downloads](http://img.shields.io/npm/dm/umi-plugin-routes-exports.svg?style=flat)](https://npmjs.org/package/umi-plugin-routes-exports)

适用于 `umijs@3` 的路由导出工具。

当你使用 `umi build` 构建项目之后，该插件会读取当前项目中的路由信息，并生成json文件导出到生成产物中。

## 更新记录

### 0.0.1

- 首个版本

## Install

```bash
# npm or yarn
$ npm install umi-plugin-routes-exports -D
```

## Usage

Configure in `.umirc.js`,

```js
export default {
  plugins: [],
};
```

## Options

Configure in `.umirc.js`,

```typescript
export default {
  routesExport: {
    filename: 'routes.json',
  },
};
```

## LICENSE

MIT
