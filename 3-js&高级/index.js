/********
作用域
变量声明
变量提升
数据类型
原型/原型链
面向对象
构造函数（persom.__proto__===Person.prototype(__proto__不是w2c标准，但是浏览器基本上都提供)）
new
继承（原型继承，构造函数继承，组合继承）
this
call，apply，bind
高阶函数（柯里化）
闭包
设计模式
面经
********/

// 作用域
/*
作用域：代码区块中(变量、函数或者对象的)可访问区域
1. ES6之前：js存在全局作用域(函数之外)和函数作用域（函数以内）
1.1 函数作用域的缺陷：粒度过大，在使用闭包或者其他特性时导致异常的变量传递
2. ES6之后：新增块级作用域
2.1 类似于 if、switch 条件选择或者 for、while 这样的循环体，以及除对象之外的{}
2.2 在ES6之前，实现块级作用域：需要在原来的函数作用域上包裹一层，即在需要限制变量提升的地方手动设置一个变量来替代原来的全局变量
2.3 案例解释
3. 计算机安全中一条基本原则即是用户只应该访问他们需要的资源，而作用域就是在编程中遵循该原则来保证代码的安全性。
4. 意义：保证代码安全；提升代码性能；追踪错误并且修复
5. 词法作用域： 编程时的上下文（Write-Time），词法作用域关注的是函数在何处被定义，js闭包特性的重要保证
5.1 动态作用域：运行时上下文（Run-Time），关注的是函数在何处被调用
5.2 案例解释
*/
function scope () {
  var fns = []
  // 函数作用域缺陷（异常的变量传递）（导致原因：函数作用域内变量i为全局变量）
  for (var i = 0; i < 5; i++) {
    fns[i] = function () {
      console.log(i)
    }
  }
  fns.forEach(fn => fn()) // 5 5 5 5 5
  // es6之前，实现块级作用域(自执行函数)，可以将全局变量j作为形参变量传递给函数作用域内使用
  for (var j = 0; j < 5; j++) {
    (function (j) {
      fns[j] = function () {
        console.log(j)
      }
    })(j)
  }
  fns.forEach(fn => fn()) // 0 1 2 3 4
  // es6之后，for代码块产生块级作用域，let申明的变量k在块级作用域内使用
  for (let k = 0; k < 5; k++) {
    fns[k] = function () {
      console.log(k)
    }
  }
  fns.forEach(fn => fn()) // 0 1 2 3 4
}
// scope()
function lexicalScope () {
  function foo () {
    console.log(a); // 2 in Lexical Scope ，But 3 in Dynamic Scope // 打印 2
  }
  function bar () {
    var a = 3;
    foo();
  }
  var a = 2;
  bar();
}
// lexicalScope()

// 变量声明
/*
在控制流到达它们出现的作用域（执行上下文）时被初始化
执行上下文（内存分配与执行 2个阶段）
1. 内存分配阶段：进行变量创建，即开始进入了变量的生命周期(声明，初始化，赋值)
2. 执行：代码执行
*/

// 变量提升（都是提升到当前作用域下）
/*
var 申明和初始化提升，赋值不提升；在申明初始化或者赋值之前有初始化值（undefined）也可以使用
function 申明初始化以及赋值都提升；在申明初始化或者赋值之前就有值可以使用（注意：与用var申明的函数区分）
let/const 只有申明提升，初始化和赋值不提升；在申明初始化或者赋值之前没有值不可使用（申明到赋值到区域 --> 暂时死域 --> 能够避免传统的提升引发的潜在问题）
案例解释
*/
function hoisting () {
  // var 声明初始化提升,赋值不提升 打印undefined
  // console.log(a)
  // var a = 'a'
  // function 声明初始化以及赋值提升 打印函数体function b(){}
  // console.log(b)
  // function b(){}
  // let 只有声明提升 没有初始化值访问不到，报错 Cannot access 'c' before initialization // 初始化前无法访问“c”
  // console.log(c)
  // let c = 'c'
}
// console.log(a) // a is not defined
// hoisting()

// 数据类型
/*
基础类型undefined，null，boolean，string，number，symbol（用来表示唯一值）
引用类型object，array，function

类型比较
1. 基本类型==基本类型
1.1 同类型直接比较
1.2 不同类型
1.2.1 undefined==null（only）
1.2.2 转为Number
1.2.3 含有!,会先进行Boolean(!优先级大于==,同理算数运算符（+-）)，例：![]==[] --> !Boolean([]) == !true == false <==> '' == [].valueOf().toString() == []
2. 基本类型==引用类型
2.1 引用类型转原始值类型 ==> 引用类型.valueOf()?.toString()（是基本类型就直接返回不进行后续） ==> 下方案例验证执行顺序（先valueOf后toString） ==> 发现toString不可重写（曲线救国：定义构造函数原型重写toString）
2.2 valueOf 返回它相应的原始值
2.3 toString 返回一个反映这个对象的字符串
2.4 Date对象，先比较toString并返回
2.5 案例解释
3. 引用类型==引用类型
3.1 引用比较引用地址（{}=={}//false let a = b = {};a==b;//true）

类型转换：原理同上

类型检测
1. typeof
判断数据类型，不能区分object和array
2. instanceof 检测对象，右侧参数必须可调用（构造函数）
判断一个构造函数的prototype属性所指向的对象是否存在另外一个要检测对象的原型链上
2.1 function Foo(){};let foo = new Foo();foo.__proto__===Foo.prototype;foo.__proto__.constructor===Foo
2.2 Object.getPrototypeOf(object) 返回指定对象的原型（内部[[Prototype]]属性的值）
2.2.1 Object.getPrototypeOf({a:1})===Object.getPrototypeOf({})===({}).__proto__===Object.prototype
2.3 Object.create(proto，[propertiesObject]) 创建一个新对象，使用现有的对象来提供新创建的对象的__proto__
2.3.1 let obj = {};let otherObj = Object.create(obj);Object.getPrototypeOf(otherObj)===obj
3. Object.prototype.toString.call 返回一个表示该对象的字符串
*/
function dataType () {
  let valueOf = Object.prototype.valueOf
  let toString = Object.prototype.toString
  Object.prototype.valueOf = function () {
    console.log('valueOf')
    return valueOf.call(this)
  }
  Object.prototype.toString = function () {
    console.log('toString') // toString打印不出来，说明不能重写
    return toString.call(this)
  }
  function Foo () { }
  Foo.prototype.toString = function () {
    console.log('toString Foo')
  }
  let foo = new Foo()
  console.log(foo == 1) // 曲线救国：先打印valueOf后打印toString Foo，最后打印返回 false
  console.log(!new Date() == 1) // 只打印false，说明只执行toString并返回
}
// dataType()
function detecteTypeOf (val) {
  return typeof val
}
// console.log(detecteTypeOf('1')) // string
// console.log(detecteTypeOf(String(1))) // string
// console.log(detecteTypeOf(new String(1))) // object
function detecteInstanceOf (obj, origin) {
  return obj instanceof origin
  // return Object.getPrototypeOf(obj) === origin.prototype
  // return obj.__proto__ === origin.prototype
}
function Foo () { }; let foo = new Foo();
// console.log(detecteInstanceOf(foo, Foo)) // 右侧必须是可调函数
// console.log(detecteInstanceOf(foo, {a:1})) // Right-hand side of 'instanceof' is not callable “instanceof”的右侧不可调用
function toStringCall (val) {
  return Object.prototype.toString.call(val)
}
console.log(toStringCall(1))

// 原型/原型链
/*
prototype
- js中，每个函数都有一个prototype属性，指向该函数的原型对象prototype
constructor
- 每个原型都有一个constructor属性，指向该关联的构造函数
__proto__
- 每个对象(除null外)都会有的属性，指向该对象的原型
原型链
- 在JavaScript 中，每个对象都有一个指向它的原型（prototype）对象的内部链接。这个原型对象又有自己的原型，直到某个对象的原型为 null 为止，这样形成的一个原型指向的链条
- 意义：为了实现面对对象编程的一种设计。基于原型链，可以让JavaScript对象拥有封装、继承和多态等众多面对对象特性
*/

// 面向对象
/*

*/

// 面经
/*
typeof null?null instanceof Object?
typeof可以判断哪些类型？instanceof做了什么？
实现一个bind函数
*/