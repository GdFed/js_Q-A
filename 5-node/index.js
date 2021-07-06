/********
 三大特性
event loop
模块化
优先处理错误
egg（koa，express）
持久化（redis）
puppeteer
错误处理最佳实践
面经
********/
// 三大特性
/*
单线程（v8引擎）
非阻塞I/O（eventloop）
事件驱动（eventEmitter）
*/

// event loop
/*
计算机系统的一种运行机制,JavaScript语言就采用这种机制，来解决单线程运行带来的一些问题
*/

// 模块化
/*
node采用了commonjs模式，对每一个模块进行首尾封装
exports（moudle.exports） 导出 require 导入

分类：
核心模块
自定义模块
第三方模块（npm机制）

模块加载机制：
路径解析（Resolution）：根据模块标识找出对应模块（入口）文件的绝对路径
加载（Loading）：如果是 JSON 或 JS 文件，就把文件内容读入内存。如果是内置的原生模块，将其共享库动态链接到当前 Node.js 进程
包装（Wrapping）：将文件内容（JS 代码）包进一个函数，建立模块作用域，exports, require, module等作为参数注入
执行（Evaluation）：传入参数，执行包装得到的函数
缓存（Caching）：函数执行完毕后，将module缓存起来，并把module.exports作为require()的返回值返回
*/

// 优先处理错误
/*
node对于事件执行中出现的错误会优先处理，或者说是必须处理
原因：
单线程本身就是脆弱的，出现的错误随时会阻断进程
错误堆积也会造成内存溢出
*/

// 错误处理最佳实践
/*
- （没有办法）处理程序员的失误
- 出现错误的处理方式
  直接处理
  把出错扩散到客户端
  重试操作
  直接崩溃
  记录错误，其他什么都不做
- 函数错误处理
  同步（用throw方式）
  异步（用callback或者EventEmitter的error）
*/

// 面经
/*
puppeteer可以用来做什么？
*/