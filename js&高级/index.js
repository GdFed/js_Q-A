/*
面向对象
原型/原型链
new
构造函数（persom.__proto__===Person.prototype(__proto__不是w2c标准，但是浏览器基本上都提供)）
继承（原型继承，构造函数继承，组合继承）
this
call，apply，bind
作用域
高阶函数（柯里化）
闭包
数据类型（基础/引用，==，判断类型（全部是基本类型（同类型直接比较，不同类型转为number）；含有基本类型（引用类型.valueOf()?.toString()）；不含基本类型都不==（引用指向不同的地址）））
*/

// 数据类型
/*
基础类型undefined，null，boolean，string，number，symbol（用来表示唯一值）
引用类型Object，Array，function
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
3. 引用类型==引用类型
3.1 引用比较引用地址（{}=={}//false let a = b = {};a==b;//true）
类型转换
*/
let valueOf = Object.prototype.valueOf
let toString = Object.prototype.toString
Object.prototype.valueOf = function(){
    console.log('valueOf')
    return valueOf.call(this)
}
Object.prototype.toString = function(){
    console.log('toString') // toString打印不出来，说明不能重写
    return toString.call(this)
}
function Foo () {}
Foo.prototype.toString = function () {
    console.log('toString Foo')
}
let foo = new Foo()
console.log(foo==1) // 曲线救国：先打印valueOf后打印toString Foo，最后打印返回 false
console.log(!new Date()==1) // 只打印false，说明只执行toString并返回