# @ryaninvents/plugin-bundle-zip-node

> Plugin for [@pika/pack](https://github.com/pikapkg/pack) to zip built files for Node.js

[![CircleCI build status](https://img.shields.io/circleci/project/github/ryaninvents/plugin-bundle-zip/develop.svg?logo=circleci&style=flat)](https://circleci.com/gh/ryaninvents/plugin-bundle-zip)
[![View on npm](https://img.shields.io/npm/v/@ryaninvents/plugin-bundle-zip-node.svg?style=flat)](https://www.npmjs.com/package/@ryaninvents/plugin-bundle-zip-node)
[![GitHub repository](https://img.shields.io/github/stars/ryaninvents/plugin-bundle-zip.svg?style=social)](https://github.com/ryaninvents/plugin-bundle-zip)
[![License](https://img.shields.io/npm/l/@ryaninvents/plugin-bundle-zip-node.svg?style=flat)](https://www.npmjs.com/package/@ryaninvents/plugin-bundle-zip-node)

## Why would I want this?

This package creates a zip file containing your compiled source code. After the build step runs, the zip file will be available in `./pkg/dist-node.zip`.

I built this package because I wanted to build an AWS Lambda function source zip using Pika Pack.

## Installation

Use the package manager [npm](https://docs.npmjs.com/about-npm/) to install `@ryaninvents/plugin-bundle-zip-node`.

```bash
npm install --save-dev @ryaninvents/plugin-bundle-zip-node
```

Then, modify your `@pika/pack` configuration in your `package.json` to enable:

```json
{
  "@pika/pack": {
    "pipeline": [
      ["@pika/plugin-standard-pkg"],
      ["@pika/plugin-build-node"],
      ["@ryaninvents/plugin-bundle-zip-node"]
    ]
  }
}
```

For more details on setting up Pack, refer to the [@pika/pack repository](https://github.com/pikapkg/pack). For details on configuring `plugin-bundle-zip-node`, keep reading.

## Options

### `preserve`

> Default value: `false`

Preserve the package root -- that is, the zip file will contain everything in the Pika `pkg` directory. **Note:** By default, this will not include the `package.json`.

```json
{
  "@pika/pack": {
    "pipeline": [
      ["@pika/plugin-standard-pkg"],
      ["@pika/plugin-build-node"],
      ["@ryaninvents/plugin-bundle-zip-node", {
        "preserve": true
      }]
    ]
  }
}
```

### `bundleName`

> Default value: `"node"`

Specify a name for the bundle. The bundle will be stored as `dist-${bundleName}.zip`.

```json
{
  "@pika/pack": {
    "pipeline": [
      ["@pika/plugin-standard-pkg"],
      ["@pika/plugin-build-node"],
      ["@ryaninvents/plugin-bundle-zip-node", {
        "bundleName": "javascript"
      }]
    ]
  }
}
```

### `directory`

> Default value: `"dist-node"`

Choose a different directory to bundle. Note that this will have no effect on bundle name. Also if you have set `preserve: true`, then this option will have no effect.

```json
{
  "@pika/pack": {
    "pipeline": [
      ["@pika/plugin-standard-pkg"],
      ["@pika/plugin-build-node"],
      ["@ryaninvents/plugin-bundle-zip-node", {
        "directory": "dist-web",
        "bundleName": "web"
      }]
    ]
  }
}
```

### `manifest`

> Default value: `true` when `"preserve": true`; `false` otherwise

Include the `package.json` in the bundle. Note that this will be the `package.json` as modified by any preceding Pika pipeline steps.

If you set `"manifest": true` while `"preserve": false`, you may end up with unexpected results. Proceed with caution.

```json
{
  "@pika/pack": {
    "pipeline": [
      ["@pika/plugin-standard-pkg"],
      ["@pika/plugin-build-node"],
      ["@ryaninvents/plugin-bundle-zip-node", {
        "preserve": true,
        "manifest": true
      }]
    ]
  }
}
```

### `sources`

> Default value: `["**"]`

Power-user option. Directly specify a set of files to use. Use negation to exclude files; for example, exclude test files using `"!*.test.js"`.

```json
{
  "@pika/pack": {
    "pipeline": [
      ["@pika/plugin-standard-pkg"],
      ["@pika/plugin-build-node"],
      ["@ryaninvents/plugin-bundle-zip-node", {
        "sources": [
          "*.js",
          "!*.test.js"
        ]
      }]
    ]
  }
}
```

### `epoch`

> Default value: `true`

When `true`, the zip file will always be created with the same timestamp. Set to `false` to generate correct timestamps.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)