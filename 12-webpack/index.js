/********
简述
编译过程
编译生命周期钩子
hooks设计原理：tapable
loader
常见loader
plugin
常见plugin
loader与plugin区别
ast
vue-cli
webpack的热更新是如何做到的
如何利用webpack来优化前端性能
如何提高webpack的构建速度
怎么配置单页应用？怎么配置多页应用？
hash、chunkhash、contenthash三者的区别？
webpack与grunt、gulp的不同？
********/
// 简述
/*
1.1 webpack是一种前端资源构建工具，一个静态模块打包器
1.2 在webpack看来，前端资源文件会作为模块处理，将根据模块依赖关系进行静态分析，打包生成对应的静态资源
1.3 webpack作用：
- 模块打包
- 编译兼容
- 能力扩展
*/

// 编译过程
/*
1. 初始化: 启动构建，读取合并配置参数（webpack.config.js,cli命令,内联import中），加载plugin（执行apply函数），实例化compiler；
2. 编译：从entry入口文件出发，针对每个module串行调用对应的loader翻译文件内容，再找到该module依赖的module，递归地进行编译处理；
3. 输出：将编译后的module组合成chunk，将chunk转换成文件，根据output路径输出到文件系统中
*/

// 生命周期钩子
/*
hooks设计原理：tapable（https://github.com/webpack/tapable#tapable）
const {
	SyncHook,
	SyncBailHook,
	AsyncParallelHook,
	AsyncSeriesHook
} = require("tapable");

compiler钩子：https://webpack.docschina.org/api/compiler-hooks/
compilation钩子：https://webpack.docschina.org/api/compilation-hooks/
主要的钩子：
entry-option：初始化 option。
run: 执行。
compile：真正开始的编译，在创建 compilation 对象之前。
compilation：生成好了 compilation 对象。
make: 从 entry 开始递归分析依赖，准备对每个模块进行 build。
after-compile：编译 build 过程结束。
emit：在将内存中 assets 内容写到磁盘文件夹之前。
after-emit：在将内存中 assets 内容写到磁盘文件夹之后。
done：完成所有的编译过程。
failed：编译失败的时候。

this.hooks = Object.freeze({
			initialize: new SyncHook([]),
			shouldEmit: new SyncBailHook(["compilation"]),
			done: new AsyncSeriesHook(["stats"]),
            ...
		});

创建两个核心对象:
- compiler：包含了 webpack 环境的所有的配置信息，包括 options，loader 和 plugin，和 webpack 整个生命周期相关的钩子
compiler 模块是 webpack 的主要引擎，它通过 CLI 传递的所有选项， 或者 Node API，创建出一个 compilation 实例
用来注册和调用插件
compiler 支持可以监控文件系统的 监听(watching) 机制，并且在文件修改时重新编译
当处于监听模式(watch mode)时， compiler 会触发诸如 watchRun, watchClose 和 invalid 等额外的事件
- compilation：作为 plugin 内置事件回调函数的参数，包含了当前的模块资源、编译生成资源、变化的文件以及被跟踪依赖的状态信息。当检测到一个文件变化，一次新的 Compilation 将被创建。
compilation 模块会被 compiler 用来创建新的 compilation 对象（或新的 build 对象）
compilation 实例能够访问所有的模块和它们的依赖（大部分是循环依赖）
它会对应用程序的依赖图中所有模块， 进行字面上的编译(literal compilation)
在编译阶段，模块会被加载(load)、封存(seal)、优化(optimize)、 分块(chunk)、哈希(hash)和重新创建(restore)
*/

// hooks设计原理：tapable
/*
- 类似于 Node.js 中的 EventEmitter的库，但更专注于自定义事件的触发和处理
- webpack 通过 tapable 将实现与流程解耦，所有具体实现通过插件的形式存在
1.1 基本使用
- 提供同步(Sync)和异步(Async)钩子类。而异步又分为异步串行、异步并行钩子类。
1.1.1 同步钩子
- SyncHook: 通过 SyncHook 创建同步钩子，使用 tap 注册回调，再调用 call 来触发
1.1.1.1 案例分析
- SyncBailHook：类似于 SyncHook，执行过程中注册的回调返回非 undefined 时就停止不在执行。
- SyncWaterfallHook：接受至少一个参数，上一个注册的回调返回值会作为下一个注册的回调的参数。
- SyncLoopHook：有点类似 SyncBailHook，但是是在执行过程中回调返回非 undefined 时继续再次执行当前的回调。
1.1.2 异步钩子
1.1.2.1 异步钩子能够通过 tapAsync 或者 tapPromise 来注册回调，
前者以 callback 的方式执行，而后者则通过 Promise 的方式来执行。
异步钩子没有 call 方法，执行注册的回调通过 callAsync 与 promise 方法进行触发
- AsyncParallelHook：并行执行的异步钩子，当注册的所有异步回调都并行执行完毕之后再执行 callAsync 或者 promise 中的函数
- AsyncSeriesHook: 顺序的执行异步函数
1.1.2.2 案例分析
1.1.2.3 其他的异步钩子都是在这两个钩子的基础上添加了一些流程控制，类似于 SyncBailHook 之于 SyncHook 的关系
- AsyncParallelBailHook：执行过程中注册的回调返回非 undefined 时就会直接执行 callAsync 或者 promise 中的函数（由于并行执行的原因，注册的其他回调依然会执行）。
- AsyncSeriesBailHook：执行过程中注册的回调返回非 undefined 时就会直接执行 callAsync 或者 promise 中的函数，并且注册的后续回调都不会执行。
- AsyncSeriesWaterfallHook：与 SyncWaterfallHook 类似，上一个注册的异步回调执行之后的返回值会传递给下一个注册的回调。
*/
const {SyncHook, AsyncParallelHook, AsyncSeriesHook} = require('tapable');
// (function () {
//     const hook = new SyncHook(['name', 'age'])
//     hook.tap('hello', (name, age)=>{
//         console.log(`hello ${name}${age}`)
//     })
//     hook.tap('hello', (name)=>{
//         console.log(`hello again ${name}`)
//     })
//     hook.tap('hello again', (name, age)=>{
//         console.log(`hello again ${name}${age}`)
//     })
//     hook.call('xzl', 18) // hello xzl   hello again xzl
// })();
(function () {
    const hook = new AsyncParallelHook(['name']) // 异步并行
    console.time('cost');
    // hook.tapAsync('hello', (name, cb)=>{
    //     setTimeout(()=>{
    //         console.log(`hello ${name}`)
    //         cb()
    //     }, 1000)
    // })
    hook.tapPromise('hello again', (name)=>{
        return new Promise((resolve)=>{
            setTimeout(()=>{
                console.log(`hello again ${name}`)
                resolve()
            }, 2000)
        })
    })
    hook.callAsync('xzl', ()=>{
        console.log('done')
        console.timeEnd('cost');
    }) // hello again xzl   hello xzl   done   cost: 2005.700ms
    // 或者通过hook.promise()调用
    // hook.promise('xzl111').then(()=>{
    //     console.log('done')
    //     console.timeEnd('cost');
    // })
})();
// (function () {
//     const hook = new AsyncSeriesHook(['name']) // 异步串行
//     console.time('cost');
//     hook.tapAsync('hello', (name, cb)=>{
//         setTimeout(()=>{
//             console.log(`hello ${name}`)
//             cb()
//         }, 2000)
//     })
//     hook.tapPromise('hello again', (name)=>{
//         return new Promise((resolve)=>{
//             console.log(`hello again ${name}`)
//             resolve()
//         })
//     })
//     hook.callAsync('xzl', ()=>{
//         console.log('done')
//         console.timeEnd('cost');
//     }) // hello xzl   hello again xzl   done   cost: 2018.008ms
// })();


// loader
/*
1.1 webpack只能理解 JavaScript 和 JSON 文件（自带能力），在打包过程中，会默认把所有遇到的文件都当作 JavaScript代码进行解析，loader 让 webpack 能够去处理其他类型的文件，并将它们转换为有效模块
1.1.1 loader 本质上是导出为函数的 JavaScript 模块（函数中的 this 作为上下文会被 webpack 填充，因此我们不能将 loader设为一个箭头函数）
1.1.2 用于对模块的源代码进行转换
1.2 支持以数组的形式配置多个的
1.3 当Webpack在转换该文件类型的时候，会按顺序链式调用每一个loader，前一个loader返回的内容会作为下一个loader的入参
1.4 loder的分类
- 后置post，普通normal，行内inline，前置pre
- 对于post，normal，pre，主要取决于在配置里Rule.enforce的取值：pre || post，若无设置，则为normal
1.4.1 loder的优先级
- 四种 loader 调用先后顺序为：pre > normal > inline > post 。
- 在相同种类 loader 的情况下，调用的优先级为，自下而上，自右向左。
1.4.2 loder的调用链
每个 loader 都有自己的 normal 函数和 pitch 函数，
而调用过程则是先根据从低到高的优先级顺序，
调用 loader 各自的 pitch 函数，再由高到低调用各自的 normal 函数，
其过程，更像是一个洋葱模型。
1.5 loader的配置方式
- 配置方式（推荐）：在 webpack.config.js文件中指定 loader。
- 内联方式：在每个 import 语句中显式指定 loader。
- CLI 方式：在 shell 命令中指定它们。
1.6 实现loader，需要遵循一定的规范：
1.6.1 保持功能单一，避免做多种功能
1.7 案例解释
*/
// 1. 导出一个函数，source为webpack传递给loader的文件源内容（函数中的 this 作为上下文会被 webpack 填充，因此我们不能将 loader设为一个箭头函数）
module.exports = function(source){
    const content = doSomeThing2JsString(source)
    // 2. 如果loader配置了options对象，那么this.query将指向options
    const options = this.query
    // 3. 可以用作解析其他模块路径的上下文
    console.log('this.context')
    /*
    this.callback参数：
    error：Error|null 当loader出错时向外抛出一个error
    content：String|Buffer 经过loader编译后需要导出的内容
    sourceMap：为方便调试生成的编译后内容的source map
    ast：本次编译生成的AST抽象语法树，之后执行的loader可以直接使用这个AST，进而省去重复生成AST的过程
    */
   
   this.callback(null, content) // 异步
   return content // 同步
}
// 常见loader
/*
style-loader: 将css添加到DOM的内联样式标签style里
css-loader :允许将css文件通过require的方式引入，并返回css代码
less-loader: 处理less
sass-loader: 处理sass
postcss-loader: 用postcss来处理CSS
autoprefixer-loader: 处理CSS3属性前缀，已被弃用，建议直接使用postcss
file-loader: 分发文件到output目录并返回相对路径
url-loader: 和file-loader类似，但是当文件小于设定的limit时可以返回一个Data Url
html-minify-loader: 压缩HTML
babel-loader :用babel来转换ES6文件到ES
*/

// plugin
/*
1.1 webpack基于发布订阅模式，在运行的生命周期中会广播出许多事件，plugin插件通过监听这些事件，就可以在特定的阶段执行自己的插件任务，从而实现自己想要的功能
1.2 实现plugin，需要遵循一定的规范：
1.2.1 插件必须是一个函数或者是一个包含 apply 方法的对象，这样才能访问compiler实例
1.2.2 传给每个插件的 compiler 和 compilation 对象都是同一个引用，因此不建议修改
1.2.3 异步的事件需要在插件处理完任务时调用回调函数通知 Webpack 进入下一个流程，不然会卡住
1.2.4 案例解释
*/
// 1.plugin名称
const MY_PLUGIN_NAME = 'MyBasicPlugin'
class MyBasicPlugin {
    // 2.在构建函数中获取插件配置项
    constructor(option){
        this.option = option
    }
    // 3.在原型对象上定义一个apply函数供webpack调用
    apply(compiler){
        // 4.注册webpack事件监听函数compiler.hooks.[hook].[tapPromise|tapAsync|tap]
        compiler.hooks.emit.tapAsync(MY_PLUGIN_NAME, (compilation, asyncCallback)=>{
            // 5.操作or改变compilation内部数据
            console.log(compilation)
            console.log('当前阶段===>编译完成，即将输出到output目录')
            // 6.如果是异步钩子，结束后需要执行异步回调
            typeof asyncCallback === 'function' && asyncCallback()
        })
    }
}
// 7.模块导出
module.exports = MyBasicPlugin
// 8.plugin执行
// const MyBasicPlugin = require('MyBasicPlugin')
// {
//     plugins:[
//         new MyBasicPlugin()
//     ]
// }
// 常见plugin
/*
HotModuleReplacementPlugin
- 模块热更新插件
- 依赖于 webpack-dev-server，后者是在打包文件改变时更新打包文件或者 reload 刷新整个页面，HMR 是只更新修改的部分
html-webapck-plugin
- 为html文件中引入的外部资源如script、link动态添加每次compile后的hash，防止引用缓存的外部文件问题
- 可以生成创建html入口文件，比如单页面可以生成一个html文件入口，配置N个html-webpack-plugin可以生成N个页面入口
clean-webpack-plugin
- 用于在打包前清理上一次项目生成的 bundle 文件，它会根据output.path 自动清理文件夹
extract-text-webpack-plugin
- 将 css 生成文件，而非内联
- 为了抽离 css 样式,防止将样式打包在 js 中引起页面样式加载错乱的现象
mini-css-extract-plugin
- 提取 css 成单独文件,对每个包含 css 的 js 文件都会创建一个 CSS 文件，支持按需加载 css和 sourceMap
- 这个插件应该只用在生产环境配置
*/

// loader与plugin区别
/*
时机：
- loader 运行在打包文件之前
- plugins 在整个编译周期都起作用
*/

// ast
/*
*/