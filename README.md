# iris-egg

iriscv egg framework

## QuickStart

```bash
$ npm install iris-egg
```

change app's dependencies:

```js
// {app_root}/index.js
require('iris-egg').startCluster({
  baseDir: __dirname,
  // port: 7001, // default to 7001
});

```

## Envirorment config
```
IRIS_EGG_GRAPHQL: open graphql
IRIS_EGG_APP: open app mode (authenticate by jwt token)
IRIS_EGG_GATEWAY: open gateway mode (authenticate by bearer token)
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

