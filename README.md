## Typescript 模块化项目配置

背景：适用于公司内部的组件开发，模块代码不会经过webpack/babel/rollup等工具的编译，而是直接export源码，在引用这些组件或者库的页面进行页面级的编译打包输出，有利于做Tree-Shaking以及debug

## `package.json` 中的 `main` 和 `module` 字段
首先看`package.json`里面的两个字段

```json
{
  "main": "lib/index.js",
  "module": "es/index.js"
}
```
`main`声明了npm包的入口文件，使用了commonjs语法规范

`module`声明了ES module规范的入口文件，其实`package.json`官方并没有这个字段，`module`来源于rollup，最主要的作用是Tree Shaking，ES Module 与 CommonJS 规范最大的区别在 ES6 中的 import 和 export 都是静态的，模块最终要使用的所有方法在编译阶段就已经确定了，好处是打包工具在打包阶段就可以分析出来，没用到的方法就可以被踢出最终的bundle文件，让打包出来的JS尽可能的小

## 为何 CommonJS 规范的包无法做Tree Shaking ?
因为 CommonJS 规范的模块只能通过 `exports` 对象向外暴露属性，所有需要暴露的方法和变量都只能作为 `exports` 对象的属性出现，而打包工具根本无从知道引用该模块的页面代码最终会用到哪些属性，那么只好把整个模块的代码都打进最后的bundle中，这从本质上决定了无法做 Tree Shaking

## 为何不直接把包的主入口 `main` 指向 ES Module 源码?
这样做会带来两个问题

1、现在红遍天的webpack/babel等打包工具在编译代码时，为了提高编译性能，几乎都会屏蔽 `mode_modules` 目录，因为现在默认npm包的代码就是基于ES5的，如果把 `main` 指向ES6代码，那么用户自己就得配置编译白名单，这对写业务型代码不接触代码构建工作的同学会非常痛苦

2、如果用户是在Node环境使用我们的包，有可能不经过打包这一步，如果刚好Node的版本不支持ES6模块规范，那就GG了，代码直接报错

## 如果才能发布一个支持 Tree Shaking 的 npm包
根据以上分析，现有字段是搞不定了，那就引入新字段吧，刚好rollup有这方面的`module`字段，抄一波？
目前虽然npm官方还不支持（但官方已经采纳了），而webpack等打包又极其识时务，二话不说就支持了

1、如果碰到`module`字段，优先使用ES6模块规范的代码，启用 Tree Shaking 机制

2、如果打包工具不识别 `module`字段，还是直接找向`main`入口，使用CommonJS规范的代码，对打包无碍


## Typescript支持同时编译 CommonJS 和 ES Module 吗？
都写到这了，还敢说不支持嘛，TS配置这两个简直超🐔简单，先写一波默认的配置
```json
{
  "compilerOptions": {
    "module": "commonjs",
    // 指定生成哪个模块系统代码： "None"， "CommonJS"， "AMD"， "System"， "UMD"， "ES6"或 "ES2015"
    "moduleResolution": "node",
    // 决定如何处理模块
    "target": "es5",
    // 指定ECMAScript目标版本
    "outDir": "lib",
    // 重定向输出目录
    "lib": [
      "dom",
      "es2015",
      "es2017.object"
    ],
    // 编译过程中需要引入的库文件的列表
    "declaration": true
    // 生成相应的 .d.ts文件
  },
  "include": [
    "src"
  ]
}
```
然后在`package.json`的`scripts`里面通过TSC的命令行参数配置一发, 下面是核心配置
```json
{
  "main": "lib/index.js",
  "module": "es/index.js",
  "types": "lib/index.d.ts",
  "files": ["es", "lib"],
  "scripts": {
    "build:lib": "tsc --outDir lib --module commonjs",
    "build:es": "tsc --outDir es --module es6",
    "build": "run-p build:*",
    "clean": "rm -rf lib es;",
    "prepare": "run-s clean build"
  }
}
```

