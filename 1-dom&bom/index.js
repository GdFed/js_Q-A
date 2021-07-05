/********
事件模型
事件流（捕获/冒泡/事件代理/事件委托）
html5新标签及新特性
兼容性
ajax(axios)
跨域（jsonp，postmessage，ajax）
svg/canvas/webGL
PWA
********/
// 事件模型
/*
原生事件模型（DOM0）
  on[event]
  删除 DOM0 级事件处理程序只要将对应事件属性置为null即可
  特性：
    绑定速度快
    只支持冒泡，不支持捕获
    同一个类型的事件只能绑定一次（后绑定的事件会覆盖之前的事件）
标准事件模型（DOM2）
  addEventListener(eventType, handler, useCapture)
  removeEventListener(eventType, handler, useCapture)
  默认：
    useCapture：是否在捕获阶段进行处理，一般设置为false与IE浏览器保持一致
  过程:
    事件捕获阶段：事件从document一直向下传播到目标元素, 依次检查经过的节点是否绑定了事件监听函数，如果有则执行
    事件处理阶段：事件到达目标元素, 触发目标元素的监听函数
    事件冒泡阶段：事件从目标元素冒泡到document, 依次检查经过的节点是否绑定了事件监听函数，如果有则执行
IE事件模型
  attachEvent(eventType, handler)
  detachEvent(eventType, handler)
  过程:
    事件处理阶段：事件到达目标元素, 触发目标元素的监听函数。
    事件冒泡阶段：事件从目标元素冒泡到document, 依次检查经过的节点是否绑定了事件监听函数，如果有则执行
*/

// 事件流（捕获/冒泡/事件代理/事件委托）
/*
事件流：
  事件捕获阶段
  处于目标阶段
  事件冒泡阶段
事件代理：也叫事件委托
事件代理的原理是DOM元素的事件冒泡
  
*/

// html5新标签及新特性
/*
requestAnimationFrame && requestIdelCallback
  requestIdleCallback(myNonEssentialWork, { timeout: 2000 });
  function myNonEssentialWork (deadline) {
    // deadline.timeRemaining()可以获取到当前帧剩余时间
    while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && tasks.length > 0) {
      doWorkIfNeeded();
    }
    if (tasks.length > 0){
      requestIdleCallback(myNonEssentialWork);
    }
  }
  requestAnimationFrame的回调会在每一帧确定执行，属于高优先级任务，而requestIdleCallback的回调则不一定，属于低优先级任务

IntersectionObserver 
  应该配合requestIdleCallback()，即只有线程空闲下来，才会执行观察器
  可以自动"观察"元素是否可见
  var io = new IntersectionObserver(entries => {
    console.log(entries);
  }, {threshold: [0, 0.25, 0.5, 0.75, 1], root, rootMargin }); 
  // threshold默认为[0]
  // root属性指定目标元素所在的容器节点（即根元素）。注意，容器元素必须是目标元素的祖先节点。
  // rootMargin用来扩展或缩小rootBounds这个矩形的大小，从而影响intersectionRect交叉区域的大小
  // 开始观察（可观察多个节点）
  io.observe(document.getElementById('example'));
  // 停止观察
  io.unobserve(element);
  // 关闭观察器
  io.disconnect();
  实例：
    惰性加载（lazy load）
      function query(selector) {
        return Array.from(document.querySelectorAll(selector));
      }
      var observer = new IntersectionObserver(
        function(changes) {
          changes.forEach(function(change) {
            var container = change.target;
            var content = container.querySelector('template').content;
            container.appendChild(content);
            observer.unobserve(container);
          });
        }
      );
      query('.lazy-loaded').forEach(function (item) {
        observer.observe(item);
      });
    无限滚动
      var intersectionObserver = new IntersectionObserver(
      function (entries) {
        // 如果不可见，就返回
        if (entries[0].intersectionRatio <= 0) return;
        loadItems(10);
        console.log('Loaded new items');
      });
      // 开始观察
      intersectionObserver.observe(
        document.querySelector('.scrollerFooter')
      );

getBoundingClientRect
  用于获得页面中某个元素的左，上，右和下分别相对浏览器视窗的位置
  return {top, left, bottom, right, width, height}

*/

// ajax
const ajax = require('./ajax')
ajax()

// PWA
/*
- 渐进式网络应用
核心技术
    Web App Manifest
    Service Worker
    离线通知
    离线与缓存
    Web Push
    App shell 和 骨架屏（skeleton）
基础技术
    Promise/Async函数
    Fetch API
    Cache API
    IndexedDB
*/
