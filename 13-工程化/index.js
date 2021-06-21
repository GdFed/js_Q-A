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

// shell
/*
变量	含义
$0	当前脚本的文件名
$n	传递给脚本或函数的参数。n 是一个数字，表示第几个参数。例如，第一个参数是$1，第二个参数是$2。
$#	传递给脚本或函数的参数个数。
$*	传递给脚本或函数的所有参数。
$@	传递给脚本或函数的所有参数。被双引号(" ")包含时，与 $* 稍有不同，下面将会讲到。
$?	上个命令的退出状态，或函数的返回值。
$$	当前Shell进程ID。对于 Shell 脚本，就是这些脚本所在的进程ID。
*/