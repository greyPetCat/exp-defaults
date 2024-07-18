## 说明

将一个 js 文件中所有导出组件，在另一个文件夹中统一使用默认导出的方式分别独立导出。

## 安装方法

```javascript
npm i exp-defaults
```

## 使用方法

```javascript
exp-defaults [targetDir] [rootDir] [mainExportFile]
```

### 传参说明

| 参数           | 说明                                         | 必填 | 默认     |
| -------------- | -------------------------------------------- | ---- | -------- |
| rootDir        | 根目录                                       | 否   | "./src/" |
| targetDir      | 统一默认导出組件的目标文件夹(相对于 rootDir) | 否   | "/libs"  |
| mainExportFile | 含导出组件信息的文件路径                     | 否   | index.js |

## 使用场景

经常我们写一个组件库，开始考虑不周在组件库中通常会 export {Component1, Component2, Component3...}导出所有组件，但是当我们需要按需引入优化、懒加载等场景时，又需要将各组件以默认导出的方式剥离出来，这时要么手动重新依次写导出文件，要么就需要修改原来组件的导出形式。
exp-defaults 工具将自动读取指定 js 文件中所有导出组件信息，在另一个文件夹中统一使用默认导出的方式分别独立导出。

如有以下文件结构：

```javascript
project-name/
│
├── src/
│  ├── index.js
│  └── components/
│    ├── Component1/
│    ├── Component2/
│    ├── Component3/
│    └── ......
└── ......
```

其中，src/index.js 中导出组件：

```javascript
import Component1 from './components/Component1'
import { Component2, Component3 } from './components/Component1'
export { Component1, Component2, Component3 }
```

如使用本工具:

```javascript
exp-defaults libs ./src index.js
```

则，在./src 下生成 libs 文件夹，并自动生成所有的导出组件文件：

```javascript
project-name/
│
├── src/
│  ├── index.js
│  └── components/
│    ├── Component1/
│    ├── Component2/
│    ├── Component3/
│    └── ......
│──── libs/
│    ├── Component1/
│    │  └── index.js
│    ├── Component2/
│    │  └── index.js
│    ├── Component3/
│    │  └── index.js
│    └── ......
└── ......
```

其中，src/libs/Component1/index.js 中导出组件：

```javascript
import Component1 from '../../components/Component1'
export default Component1
```

其中，src/libs/Component2/index.js 中导出组件：

```javascript
import { Component2 } from '../../components/Component2'
export default Component2
```

其中，src/libs/Component3/index.js 中导出组件：

```javascript
import { Component3 } from '../../components/Component3'
export default Component3
```

至此可以直接使用/src/libs 文件夹中的组件

在构建工具中按需引用时，可以使用以下配置，以 rspack 为例,webpack 配置也差不多：

```javascript

......

const files = fs.readdirSync(path.resolve(__dirname, '/src/libs/'))
let entry = {}
for (const item of files) {
    entry[item] = path.resolve(__dirname, `/src/libs/${item}/`, 'index.js')
}

module.exports = {
    mode: 'production',
    entry,
    output: {
        clean: true,
        path: path.resolve(__dirname, './', 'lib'),
        filename: '[name]/index.js',
        library: {
            name: 'Component_Library_Name',
            type: 'umd',
            export: 'default',
            umdNamedDefine: true,
        },
    },
    ......
}

```
