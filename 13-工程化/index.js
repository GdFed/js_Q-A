/********
ci
自动化测试
git（hooks）
部署（docker）
代码检查（prettier，eslint，postcss，posthtml）
babel
shell
面经
********/

// 面经
/*
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
*/