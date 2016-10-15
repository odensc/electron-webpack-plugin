# electron-webpack-plugin

![NPM Badge](https://img.shields.io/npm/v/electron-webpack-plugin.png)

Webpack plugin to restart Electron.

Requires a peer dependency of `electron`.

## API

### new ElectronPlugin(options: object)

#### options
```js
new ElectronPlugin({
    // if a file in this path is modified/emitted, electron will be restarted
    // *required*
    relaunchPathMatch: "./src/scripts/main",
    // the path to launch electron with
    // *required*
    path: "./output",
    // the command line arguments to launch electron with
    // optional
    args: ["--enable-logging"],
    // the options to pass to child_process.spawn
    // see: https://nodejs.org/api/child_process.html#child_process_child_process_spawnsync_command_args_options
    // optional
    options: {
        env: {NODE_ENV: "development"}
    }
})
```

## Example
```js
const ElectronPlugin = require("electron-webpack-plugin");

module.exports = {
    entry: {
        "main/index": "./src/scripts/main/index.js",
        "renderer/index": "./src/scripts/renderer/index.js",
    },
    output: {
        path: "./output",
        filename: "scripts/[name].js"
    },
    plugins: [
        new ElectronPlugin({
            relaunchPathMatch: "./src/scripts/main",
            path: "output"
        })
    ],
    target: "electron"
};
```

## With webpack-dev-server
You will need to use [write-file-webpack-plugin](https://npm.im/write-file-webpack-plugin),
to allow Electron to access the output path.

You will also need to add the following options:
```js
devServer: {
    // electron will break if client is inlined in main process
    inline: false,
    // required for write-file
    outputPath: "./output"
}
```
