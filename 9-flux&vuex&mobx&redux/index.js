/********
vuex源码分析
flux
状态管理机制（mobx, redux, vuex）
********/

// flux
/*
Flux 是一种架构思想，类似于 MVC 、MVVM 等
组成:
  View: 视图层。
  Action: 动作，即数据改变的消息对象（可通过事件触发、测试用例触发等）。
          Store 的改变只能通过 Action。
          具体 Action 的处理逻辑一般放在 Store 里。
          Action 对象包含 type （类型）与 payload （传递参数）。
  Dispatcher: 派发器，接收 Actions ，发给所有的 Store。
  Store: 数据层，存放应用状态与更新状态的方法，一旦发生变动，就提醒 Views 更新页面。
特点:
  单向数据流 视图事件或者外部测试用例发出 Action ，经由 Dispatcher 派发给 Store ，Store 会触发相应的方法更新数据、更新视图。
  Store 可以有多个。
  Store 不仅存放数据，还封装了处理数据的方法。
*/

// 总结
/*
Flux 、Redux 、Vuex 均为单向数据流。
Redux 和 Vuex 是基于 Flux 的，Redux 较为泛用，Vuex 只能用于 vue。
Flux 与 MobX 可以有多个 Store ，Redux 、Vuex 全局仅有一个 Store（单状态树）。
Redux 、Vuex 适用于大型项目的状态管理，MobX 在大型项目中应用会使代码可维护性变差。
Redux 中引入了中间件，主要解决异步带来的副作用，可通过约定完成许多复杂工作。
MobX 是状态管理库中代码侵入性最小的之一，具有细粒度控制、简单可扩展等优势，但是没有时间回溯能力，一般适合应用于中小型项目中。
*/