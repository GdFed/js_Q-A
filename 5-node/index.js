/********
event loop
模块
egg（koa，express）
持久化（redis）
puppeteer
错误处理最佳实践
面经
********/

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