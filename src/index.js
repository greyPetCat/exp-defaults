#!/usr/bin/env node

const os = require('os')
const fs = require('fs')
const path = require('path')
const acorn = require('acorn')
const walk = require('acorn-walk')
const chalk = require('chalk')
const package = require('../package.json')
const WORK_DIR = process.cwd()
// 获取命令行参数
const [, , targetDir = '/libs', rootDir = './src/', mainExportFileName = 'index.jsx', ...restArgs] = process.argv
// 获取导出的所有组件信息
const findComponents = (jsFilePath) => {
    const code = fs.readFileSync(jsFilePath, 'utf-8') // 读取源码
    const ast = acorn.parse(code, {
        sourceType: 'module', // 如果你的代码是 ES 模块，使用 'module'
        ecmaVersion: 2021,
    }) // 使用 acorn 解析源代码为 AST
    const _components = []
    const imports = {}
    walk.full(ast, (node) => {
        // 命名导出的代码
        if (node.type == 'ExportNamedDeclaration') {
            for (let index = 0; index < node.specifiers.length; index++) {
                const specifier = node.specifiers[index]
                const componentName = specifier.exported.name
                _components.push(componentName)
            }
        }
        // 默认导出的代码
        if (node.type == 'ExportDefaultDeclaration') {
            const componentName = node.declaration.name
            _components.push(componentName)
        }
        // 导入的代码
        if (node.type == 'ImportDeclaration') {
            const sourcePath = node?.source?.value
            for (let index = 0; index < node.specifiers.length; index++) {
                const specifier = node.specifiers[index]
                const componentName = specifier.local.name
                imports[componentName] = { path: sourcePath, type: specifier.type }
            }
        }
    })
    // 去重
    const components = _components.filter((item, index, _components) => _components.indexOf(item) === index)
    let result = {}
    for (let index = 0; index < components.length; index++) {
        const component = components[index]
        result[component] = imports[component]
    }
    return result
}
// 创建文件
const createFileContent = (filePath, content) => {
    try {
        fs.writeFileSync(filePath, content)
    } catch (error) {
        console.log(chalk.white.bgRed('  文件写入失败:' + filePath + '  '))
    }
}
// 创建文件夹
const createFolder = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true }, (err) => {
            if (err) {
                console.log(chalk.white.bgRed('  创建文件夹时出错:' + folderPath + '  '))
                return
            }
        })
    } else {
        // console.log(chalk.white.bgGreen(`文件夹已存在: ${folderPath}`))
    }
}
// 创建组件
const createComponent = (libsPath, componentName, componentPath, isDefault) => {
    try {
        // 计算正确的导入路径
        const currentPath = path.resolve(WORK_DIR, './')
        const importPath = path.join(path.relative(libsPath, currentPath), componentPath).replace(/\\/g, '/')
        if (componentName?.length > 0) {
            const contentToWrite = isDefault
                ? `import ${componentName} from '${importPath}'${os.EOL}export default ${componentName}`
                : `import { ${componentName} } from '${importPath}'${os.EOL}export default ${componentName}` // 写入内容的字符串
            const newFolderPath = path.join(libsPath, componentName)
            const newFilePath = path.join(newFolderPath, 'index.js')
            createFolder(newFolderPath) // 创建文件夹
            createFileContent(newFilePath, contentToWrite) //  创建文件并写入内容
            return 1
        } else {
            return 0
        }
    } catch (error) {
        console.error('创建组件失败:', error)
        return 0
    }
}
const version = () => {
    console.log(chalk.green(package.version))
}
const start = (rootDir, mainExportFileName, targetDir, restArgs) => {
    if (process.argv.includes('-v') || process.argv.includes('-V') || process.argv.includes('-version')) {
        version()
    } else {
        // 路径配置
        const jsFilePath = path.join(path.join(WORK_DIR, rootDir), mainExportFileName)
        // 获取所有组件信息
        const componentsInfo = findComponents(jsFilePath)
        // 先创建组件统一导出文件夹
        const libsPath = path.join(path.join(WORK_DIR, rootDir), targetDir)
        createFolder(libsPath)
        console.log('目标目录:' + chalk.green(libsPath) + '  ')
        // 遍历组件，创建组件文件夹和导出文件
        let count = 0
        for (const componentName in componentsInfo) {
            if (Object.hasOwnProperty.call(componentsInfo, componentName)) {
                const info = componentsInfo[componentName]
                const isDefault = info.type === 'ImportDefaultSpecifier'
                count = count + createComponent(libsPath, componentName, info.path, isDefault)
            }
        }
        console.log('独立生成:' + chalk.green(count + '个导出  '))
    }
}

start(rootDir, mainExportFileName, targetDir)
