## 说明

将一个js文件中所有导出组件，在另一个文件夹中统一使用默认导出的方式分别独立导出。

## 使用方法

```javascript
node ./exp-defaults 统一导出的文件夹 [根文件夹(默认值：./src)] [导出文件名(默认值：index.js)]
```

## 使用场景

经常我们会写一个组件库，在组件库中，我们通常会export {Component1, Component2, Component3...}导出所有的组件，但是当我们需要按需引入优化时，又需要将各组件以默认导出的方式剥离出来。这时要么手动重新写导出文件，要么就需要修改原来组件的导出形式。
现在 exp-defaults 工具，将自动读取指定 js 文件中所有导出组件，在另一个文件夹中统一使用默认导出的方式分别独立导出。

如有以下文件结构：
project-name/
│
├── src/
│ ├── index.js
│ └── components/
│ ├── Component1/
│ ├── Component2/
│ ├── Component3/
│ └── ......
└── ......
其中，src/index.js 中导出组件：

```javascript
import Component1 from './components/Component1'
import { Component2, Component3 } from './components/Component1'
export { Component1, Component2, Component3 }
```

如使用本工具:

```javascript
node ./exp-defaults libs ./src index.js
```

则，libs 文件夹中生成所有的导出组件文件：
project-name/
│
├── src/
│ ├── index.js
│ └── components/
│ ├── Component1/
│ ├── Component2/
│ ├── Component3/
│ └── ......
│──── libs/
│ ├── Component1/
│ │ └── index.js
│ ├── Component2/
│ │ └── index.js
│ ├── Component3/
│ │ └── index.js
│ └── ......
└── ......
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

在构建工具中需要按需引用时，可以使用以下配置，以 rspack 为例,webpack 配置也差不多：

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
