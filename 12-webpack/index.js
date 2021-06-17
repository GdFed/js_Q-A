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
webpack-dev-middleware
webpack-hot-middleware
ast
vue-cli
面经
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
1.1.1.1 案例分析(见17-解决方案 tapable.js)
- SyncBailHook：类似于 SyncHook，执行过程中注册的回调返回非 undefined 时就停止不在执行。
- SyncWaterfallHook：接受至少一个参数，上一个注册的回调返回值会作为下一个注册的回调的参数。
- SyncLoopHook：有点类似 SyncBailHook，但是是在执行过程中回调返回非 undefined 时继续再次执行当前的回调。
1.1.2 异步钩子
1.1.2.1 异步钩子能够通过 tapAsync 或者 tapPromise 来注册回调，
前者以 callback 的方式执行，而后者则通过 Promise 的方式来执行。
异步钩子没有 call 方法，执行注册的回调通过 callAsync 与 promise 方法进行触发
- AsyncParallelHook：并行执行的异步钩子，当注册的所有异步回调都并行执行完毕之后再执行 callAsync 或者 promise 中的函数
- AsyncSeriesHook: 顺序的执行异步函数
1.1.2.2 案例分析(见17-解决方案 tapable.js)
1.1.2.3 其他的异步钩子都是在这两个钩子的基础上添加了一些流程控制，类似于 SyncBailHook 之于 SyncHook 的关系
- AsyncParallelBailHook：执行过程中注册的回调返回非 undefined 时就会直接执行 callAsync 或者 promise 中的函数（由于并行执行的原因，注册的其他回调依然会执行）。
- AsyncSeriesBailHook：执行过程中注册的回调返回非 undefined 时就会直接执行 callAsync 或者 promise 中的函数，并且注册的后续回调都不会执行。
- AsyncSeriesWaterfallHook：与 SyncWaterfallHook 类似，上一个注册的异步回调执行之后的返回值会传递给下一个注册的回调。
*/

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
happypack
- 实现多线程加速编译
terser-webpack-plugin
- 通过TerserPlugin压缩ES6代码
optimize-css-assets-webpack-plugin
- 压缩css
uglifyjs-webpack-plugin
- 压缩js
commons-chunk-plugin
- 提取公共代码
*/

// loader与plugin区别
/*
时机：
- loader 运行在打包文件之前
- plugins 在整个编译周期都起作用
*/

// webpack-dev-middleware
/*
webpack-dev-middleware 是一个容器(wrapper)，它可以把 webpack 处理后的文件传递给一个服务器(server)
在内部使用Express搭建搭建了一个小型Node服务来接收处理后的文件
*/
// webpack-hot-middleware
/*

*/

// ast
/*
acorn
*/

// vue-cli
/*

*/

// 面经
/*
前端为什么要进行打包和构建？
【
代码层面：
体积更小（Tree-shaking、压缩、合并），加载更快
编译高级语言和语法（TS、ES6、模块化、scss）
兼容性和错误检查（polyfill,postcss,eslint）
研发流程层面：
统一、高效的开发环境
统一的构建流程和产出标准
集成公司构建规范（提测、上线）
】

webpack是什么？
【
一种前端资源构建工具，一个静态模块打包器（module bundle）
前端所有资源文件（js/json/css/img…）都会作为模块处理
webpack将根据模块的依赖关系进行静态分析，打包(通过loader转换文件，通过plugin注入钩子)生成对应的静态资源（bundle）
webpack专注构建模块化项目
】

webpack的优缺点？
【
优点：
专注于处理模块化的项目，能做到开箱即用，一步到位
可通过plugin扩展，完整好用又不失灵活
使用场景不局限于web开发
社区庞大活跃，经常引入紧跟时代发展的新特性，能为大多数场景找到已有的开源扩展
缺点：
只能用于采用模块化开发的项目
配置过于复杂
源码比较复杂，遇到问题看源码，要花很长时间
】

Webpack 五个核心概念分别是什么？
【
Entry
入口（Entry）指示 Webpack 以哪个文件为入口起点开始打包，分析内部构件依赖图
Output
输出（Output）指示 Webpack 打包后的资源 bundles 输出到哪里去，以及如何命名
Loader
Loader 能让 Webpack 处理非 JavaScript/json 文件（Webpack 自身只能处理 JavaScript/json ）
Plugins
插件（Plugins）可以用于执行范围更广的任务，包括从打包优化和压缩到重新定义环境中的变量
Mode
模式(Mode)指示 Webpack 使用相应模式的配置，只有development（开发环境）和production（生产环境）两种模式
】

与webpack类似的工具还有哪些？谈谈你为什么最终选择（或放弃）使用webpack？
【
同样是基于入口的打包工具还有以下几个主流的：
webpack
rollup
parcel
从应用场景上来看：
webpack适用于大型复杂的前端站点构建
rollup适用于基础库的打包，如vue、react
parcel适用于简单的实验性项目，他可以满足低门槛的快速看到效果
由于parcel在打包过程中给出的调试信息十分有限，所以一旦打包出错难以调试，所以不建议复杂的项目使用parcel
】
webpack与grunt、gulp的不同？
【
三者都是前端构建工具，grunt和gulp在早期比较流行，现在webpack相对来说比较主流，不过一些轻量化的任务还是会用gulp来处理，比如单独打包CSS文件等。
grunt和gulp是基于任务和流（Task、Stream）的。类似jQuery，找到一个（或一类）文件，对其做一系列链式操作，更新流上的数据， 整条链式操作构成了一个任务，多个任务就构成了整个web的构建流程。
webpack是基于入口的。webpack会自动地递归解析入口所需要加载的所有资源文件，然后用不同的Loader来处理不同的文件，用Plugin来扩展webpack功能。
所以总结一下：
从构建思路来说
gulp和grunt需要开发者将整个前端构建过程拆分成多个`Task`，并合理控制所有`Task`的调用关系
webpack需要开发者找到入口，并需要清楚对于不同的资源应该使用什么Loader做何种解析和加工
对于知识背景来说
gulp更像后端开发者的思路，需要对于整个流程了如指掌 webpack更倾向于前端开发者的思路
】

有没有做过优化相关的？webpack做了哪些优化？
如何利用webpack来优化前端性能？
【
用webpack优化前端性能是指优化webpack的输出结果，让打包的最终结果在浏览器运行快速高效：
- 压缩代码。删除多余的代码、注释、简化代码的写法等等方式。
  可以利用webpack的UglifyJsPlugin和ParallelUglifyPlugin来压缩JS文件， 利用cssnano（css-loader?minimize）来压缩css
- 利用CDN加速。在构建过程中，将引用的静态资源路径修改为CDN上对应的路径。
  可以利用webpack对于output参数和各loader的publicPath参数来修改资源路径
- 删除死代码（Tree Shaking）。将代码中永远不会走到的片段删除掉。
  可以通过在启动webpack时追加参数--optimize-minimize来实现
- 提取公共代码。
】
【
开发环境下：
开启HMR功能，优化打包构建速度
配置 devtool: ‘source-map’，优化代码运行的性能
生产环境下：
oneOf 优化
默认情况下，假设设置了7、8个loader，每一个文件都得通过这7、8个loader处理（过一遍），浪费性能，使用 oneOf 找到了就能直接用，提升性能
开启 babel 缓存
当一个 js 文件发生变化时，其它 js 资源不用变
code split 分割
将js文件打包分割成多个bundle，避免体积过大
懒加载和预加载
PWA 网站离线访问
多进程打包
开启多进程打包，主要处理js文件（babel-loader干的活久），进程启动大概为600ms，只有工作消耗时间比较长，才需要多进程打包，提升打包速度
dll 打包第三方库
code split将第三方库都打包成一个bundle，这样体积过大，会造成打包速度慢
dll 是将第三方库打包成多个bundle，从而进行速度优化
】
如何提高webpack的构建速度？
【
- 通过externals配置来提取常用库
- 利用DllPlugin和DllReferencePlugin预编译资源模块 通过DllPlugin来对那些我们引用但是绝对不会修改的npm包来进行预编译，再通过DllReferencePlugin将预编译的模块加载进来。
- 使用Happypack 实现多线程加速编译
- 使用Tree-shaking和Scope Hoisting来剔除多余代码
- 使用fast-sass-loader代替sass-loader
- babel-loader开启缓存
babel-loader在执行的时候，可能会产生一些运行期间重复的公共文件，造成代码体积大冗余，同时也会减慢编译效率
可以加上cacheDirectory参数或使用 transform-runtime 插件试试
- 不需要打包编译的插件库换成全局"script"标签引入的方式
比如jQuery插件，react, react-dom等，代码量是很多的，打包起来可能会很耗时
可以直接用标签引入，然后在webpack配置里使用 expose-loader  或 externals 或 ProvidePlugin  提供给模块内部使用相应的变量
- 优化构建时的搜索路径
在webpack打包时，会有各种各样的路径要去查询搜索，我们可以加上一些配置，让它搜索地更快
比如说，方便改成绝对路径的模块路径就改一下，以纯模块名来引入的可以加上一些目录路径
还可以善于用下resolve alias别名 这个字段来配置
还有exclude等的配置，避免多余查找的文件，比如使用babel别忘了剔除不需要遍历的
】
webpack优化构建速度？
【
生产环境：
babel-loader
IgnorePlugin(能够使得指定目录被忽略，从而使得打包变快，文件变小)
noParse(不去解析属性值代表的库的依赖)
happyPack
thread-loader
ParallelUglifyPlugin
不能用于生产环境：
自动刷新
热更新
DllPlugin
】
webpack优化产出代码？
【
小图片base64编码
bundle加hash
懒加载
提取公共代码
使用cdn加速
IgnorePlugin
使用production
Scope Hosting
(场景、效果、原理)
exclude/include（通过 exclude、include 配置来确保转译尽可能少的文件）
speed-measure-webpack-plugin（测量各个插件和loader所花费的时间）
webpack-bundle-analyzer 
】

cache-loader和hard-source-webpack-plugin的区别是什么？
【
hard-source-webpack-plugin：为模块提供中间缓存步骤（缓存默认的存放路径是: node_modules/.cache/hard-source）（首次构建时间没有太大变化，但是第二次开始，构建时间大约可以节约 80%）
cache-loader：缓存性能开销较大的loader的编译结果（磁盘），避免重新编译（配合vue-loader，babel-loader进行缓存）
】

webpack的构建流程是什么?从读取配置到输出文件这个过程尽量说全？
【
Webpack 的运行流程是一个串行的过程，从启动到结束会依次执行以下流程：
初始化参数：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数；
开始编译：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译；
确定入口：根据配置中的 entry 找出所有的入口文件；
编译模块：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理；
完成模块编译：在经过第4步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系；
输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会；
输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。
在以上过程中，Webpack 会在特定的时间点广播出特定的事件，插件在监听到感兴趣的事件后会执行特定的逻辑，并且插件可以调用 Webpack 提供的 API 改变 Webpack 的运行结果。
】

webpack的热更新是如何做到的？
【
热更新又称热替换（Hot Module Replacement），缩写为HMR，基于devServer，生产环境不需要devServer，所以生产环境不能用HMR功能
作用：
优化打包构建速度，一个模块发生变化，只会重新打包这一个模块（而不是打包所有模块），极大提升构建速度
样式文件：可以使用HMR功能，因为style-loader内部实现了
JS文件：默认没有HMR功能，需要修改js代码，添加支持HMR功能。入口文件做不了HMR功能，只能处理非入口js文件
HTML文件：默认没有HMR功能，同时会导致 html 文件不能热更新（即修改没有任何反应）
解决方案：
修改entry入口，将html文件引入
entry:['./src/js/index.js','./src/index.html']
不用做HMR功能，因为只有一个html文件
】
【
模块热更新是webpack的一个功能，他可以使得代码修改过后不用刷新浏览器就可以更新，是高级版的自动刷新浏览器。
devServer中通过hot属性可以控制模块的热替换
1，通过配置文件
const webpack = require('webpack');
const path = require('path');
let env = process.env.NODE_ENV == "development" ? "development" : "production";
const config = {
  mode: env,
 devServer: {
     hot:true
 }
}
  plugins: [
     new webpack.HotModuleReplacementPlugin(), //热加载插件
  ],
module.exports = config;
2，通过命令行
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "NODE_ENV=development  webpack-dev-server --config  webpack.develop.config.js --hot",
  },
】
【
webpack的热更新又称热替换（Hot Module Replacement），缩写为HMR。 这个机制可以做到不用刷新浏览器而将新变更的模块替换掉旧的模块。
原理：
首先要知道server端和client端都做了处理工作
第一步，在 webpack 的 watch 模式下，文件系统中某一个文件发生修改，webpack 监听到文件变化，根据配置文件对模块重新编译打包，并将打包后的代码通过简单的 JavaScript 对象保存在内存中。
第二步是 webpack-dev-server 和 webpack 之间的接口交互，而在这一步，主要是 dev-server 的中间件 webpack-dev-middleware 和 webpack 之间的交互，webpack-dev-middleware 调用 webpack 暴露的 API对代码变化进行监控，并且告诉 webpack，将代码打包到内存中。
第三步是 webpack-dev-server 对文件变化的一个监控，这一步不同于第一步，并不是监控代码变化重新打包。当我们在配置文件中配置了devServer.watchContentBase 为 true 的时候，Server 会监听这些配置文件夹中静态文件的变化，变化后会通知浏览器端对应用进行 live reload。注意，这儿是浏览器刷新，和 HMR 是两个概念。
第四步也是 webpack-dev-server 代码的工作，该步骤主要是通过 sockjs（webpack-dev-server 的依赖）在浏览器端和服务端之间建立一个 websocket 长连接，将 webpack 编译打包的各个阶段的状态信息告知浏览器端，同时也包括第三步中 Server 监听静态文件变化的信息。浏览器端根据这些 socket 消息进行不同的操作。当然服务端传递的最主要信息还是新模块的 hash 值，后面的步骤根据这一 hash 值来进行模块热替换。
webpack-dev-server/client 端并不能够请求更新的代码，也不会执行热更模块操作，而把这些工作又交回给了 webpack，webpack/hot/dev-server 的工作就是根据 webpack-dev-server/client 传给它的信息以及 dev-server 的配置决定是刷新浏览器呢还是进行模块热更新。当然如果仅仅是刷新浏览器，也就没有后面那些步骤了。
HotModuleReplacement.runtime 是客户端 HMR 的中枢，它接收到上一步传递给他的新模块的 hash 值，它通过 JsonpMainTemplate.runtime 向 server 端发送 Ajax 请求，服务端返回一个 json，该 json 包含了所有要更新的模块的 hash 值，获取到更新列表后，该模块再次通过 jsonp 请求，获取到最新的模块代码。这就是上图中 7、8、9 步骤。
而第 10 步是决定 HMR 成功与否的关键步骤，在该步骤中，HotModulePlugin 将会对新旧模块进行对比，决定是否更新模块，在决定更新模块后，检查模块之间的依赖关系，更新模块的同时更新模块间的依赖引用。
最后一步，当 HMR 失败后，回退到 live reload 操作，也就是进行浏览器刷新来获取最新打包代码。
】

怎么配置单页应用？怎么配置多页应用？
【
单页应用可以理解为webpack的标准模式，直接在entry中指定单页应用的入口即可，这里不再赘述
多页应用的话，可以使用webpack的 AutoWebPlugin来完成简单自动化的构建，但是前提是项目的目录结构必须遵守他预设的规范。 多页应用中要注意的是：
每个页面都有公共的代码，可以将这些代码抽离出来，避免重复的加载。比如，每个页面都引用了同一套css样式表
随着业务的不断扩展，页面可能会不断的追加，所以一定要让入口的配置足够灵活，避免每次添加新页面还需要修改构建配置
】

npm打包时需要注意哪些？如何利用webpack来更好的构建？
【
NPM模块需要注意以下问题：
要支持CommonJS模块化规范，所以要求打包后的最后结果也遵守该规则
Npm模块使用者的环境是不确定的，很有可能并不支持ES6，所以打包的最后结果应该是采用ES5编写的。并且如果ES5是经过转换的，请最好连同SourceMap一同上传
Npm包大小应该是尽量小（有些仓库会限制包大小）
发布的模块不能将依赖的模块也一同打包，应该让用户选择性的去自行安装。这样可以避免模块应用者再次打包时出现底层模块被重复打包的情况
UI组件类的模块应该将依赖的其它资源文件，例如.css文件也需要包含在发布的模块里
webpack配置做以下扩展和优化：
CommonJS模块化规范的解决方案： 设置output.libraryTarget='commonjs2’使输出的代码符合CommonJS2 模块化规范，以供给其它模块导入使用
输出ES5代码的解决方案：使用babel-loader把 ES6 代码转换成 ES5 的代码。再通过开启devtool: 'source-map’输出SourceMap以发布调试。
Npm包大小尽量小的解决方案：Babel 在把 ES6 代码转换成 ES5 代码时会注入一些辅助函数，最终导致每个输出的文件中都包含这段辅助函数的代码，造成了代码的冗余。解决方法是修改.babelrc文件，为其加入transform-runtime插件
不能将依赖模块打包到NPM模块中的解决方案：使用externals配置项来告诉webpack哪些模块不需要打包。
对于依赖的资源文件打包的解决方案：通过css-loader和extract-text-webpack-plugin来实现
】

module chunk bundle区别？
【
module - 各个源码文件，webpack中一切皆模块（从配置的entry中递归开始找出所有依赖的模块）
chunk - 多模块合并成的代码块
bundle - 最终将打包好的资源输出的文件
】

hash、chunkhash、contenthash三者的区别？
【
浏览器访问网站后会强缓存资源，第二次刷新就不会请求服务器（一般会定个时间再去请求服务器），假设有了bug改动了文件，但是浏览器又不能及时请求服务器，所以就用到了文件资源缓存（改变文件名的hash值）
- hash：不管文件变不变化，每次wepack构建时都会生成一个唯一的hash值
- chunkhash：根据chunk生成的hash值。如果打包来源于同一个chunk，那么hash值就一样
问题：js和css同属于一个chunk，修改css，js文件同样会被打包
- contenthash：根据文件的内容生成hash值。不同文件hash值一定不一样
】

如何在vue项目中实现按需加载？
【
Vue UI组件库的按需加载 
为了快速开发前端项目，经常会引入现成的UI组件库如ElementUI、iView等，但是他们的体积和他们所提供的功能一样，是很庞大的。 
而通常情况下，我们仅仅需要少量的几个组件就足够了，但是我们却将庞大的组件库打包到我们的源码中，造成了不必要的开销。
不过很多组件库已经提供了现成的解决方案，如Element出品的babel-plugin-component和AntDesign出品的babel-plugin-import 安装以上插件后，
在.babelrc配置中或babel-loader的参数中进行设置，即可实现组件按需加载了。
单页应用的按需加载
现在很多前端项目都是通过单页应用的方式开发的，但是随着业务的不断扩展，会面临一个严峻的问题——首次加载的代码量会越来越多，影响用户的体验。
通过import(*)语句来控制加载时机，webpack内置了对于import(*)的解析，会将import(*)中引入的模块作为一个新的入口在生成一个chunk。 
当代码执行到import(*)语句时，会去加载Chunk对应生成的文件。import()会返回一个Promise对象，所以为了让浏览器支持，需要事先注入Promise polyfill
】

webpack如何实现懒加载？
【
import()
结合 vue 异步组件 $nexitick
结合vue-router异步加载路由 import
】

babel和webpack的区别？
【
babel JS新语法编译工具，只关心语法，不关心模块化
webpack -打包构建工具，是多个Loader plugin的集合
】

如何产出一个lib？
【
output: {
  // lib的文件名
  filename: 'lodash.js',
  // 输出的lib都放到 dist 目录下
  path: distPath,
  // 存放lib的全局变量名称
  library: 'lodash',
},
】

babel-polyfill babel-runtime区别？
【
babel-polyfill 会污染全局
babel-runtime 不会污染全局，产出第三方lib时要用babel-runtime
】

为什么proxy不能被polyfill？
【
如 Class 可以用 function 模拟
如 Promise 可以用 callback 模拟
但是 Proxy 功能用 Object.defineProperty 无法模拟
】

什么是Tree-shaking？
【
Tree-shaking可以用来剔除javascript中不用的死代码，它依赖静态的es6模块化语法，
例如通过import 和export 导入导出，
Tree-shaking最先在rollup中出现，webpack在2.0中将其引入，
css中使用Tree-shaking需要引入Purify-CSS
】

通过webpack处理长缓存？
【
浏览器在用户访问页面的时候，为了加快加载速度，会对用户访问的静态资源进行存储，
但是每一次代码升级或是更新，都需要浏览器去下载新的代码，最方便和简单的更新方式就是引入新的文件名称。
在webpack中可以在output纵输出的文件指定chunkhash,并且分离经常更新的代码和框架代码。
通过NameModulesPlugin或是HashedModuleIdsPlugin使再次打包文件名不变。
】

是否写过Loader和Plugin？描述一下编写loader或plugin的思路？
【
Loader像一个"翻译官"把读到的源文件内容转义成新的文件内容，并且每个Loader通过链式操作，将源文件一步步翻译成想要的样子。
编写Loader时要遵循单一原则，每个Loader只做一种"转义"工作。 每个Loader的拿到的是源文件内容（source），可以通过返回值的方式将处理后的内容输出，也可以调用this.callback()方法，将内容返回给webpack。 还可以通过 this.async()生成一个callback函数，再用这个callback将处理后的内容输出出去。 此外webpack还为开发者准备了开发loader的工具函数集——loader-utils。
相对于Loader而言，Plugin的编写就灵活了许多。 webpack在运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在合适的时机通过 Webpack 提供的 API 改变输出结果。
】
【
loader：模块转换器，用于将模块的原内容按照需要转成你想要的内容
plugin：在webpack构建流程中的特定时机注入扩展逻辑，来改变构建结果，是用来自定义webpack打包过程的方式，一个插件是含有apply方法的一个对象，通过这个方法可以参与到整个webpack打包的各个流程(生命周期)。
】
【
不同的作用：
Loader直译为"加载器"。Loader的作用是让webpack拥有了加载和解析非JavaScript文件的能力。
Plugin直译为"插件"。Plugin可以扩展webpack的功能，让webpack具有更多的灵活性。 在 Webpack 运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在合适的时机通过 Webpack 提供的 API 改变输出结果。
不同的用法：
Loader在module.rules中配置，也就是说他作为模块的解析规则而存在。 类型为数组，每一项都是一个Object，里面描述了对于什么类型的文件（test），使用什么加载(loader)和使用的参数（options）
Plugin在plugins中单独配置。 类型为数组，每一项是一个plugin的实例，参数都通过构造函数传入。
】

*/