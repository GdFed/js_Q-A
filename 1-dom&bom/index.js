/********
事件模型
事件流（捕获/冒泡/事件代理/事件委托）
html5新标签及新特性
兼容性
ajax(axios)
跨域（jsonp，postmessage，cors，代理服务，配合iframe实现）
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

// 兼容性
/**/

// ajax(axios)
const ajax = require('./ajax')
ajax()

// 跨域（jsonp，postmessage，cors，代理服务，配合iframe实现）
/*
1. jsonp
- 原理：利用script标签src属性跨域的特性，将动态插入script标签来加载带数据源的脚步执行链接，实现异步跨域操作
- 缺点：只支持GET请求
2. postmessage： 用于安全地实现跨源通信
- 原理：使用otherWindow.postMessage(message, targetOrigin, [transfer]);和window.addEventListener("message",fn)实现跨域数据传输
- 参数说明：
  otherWindow	其他窗口的一个引用，比如 iframe 的 contentWindow 属性、执行 window.open 返回的窗口对象、或者是命名过或数值索引的 window.frames。
  message	将要发送到其他 window的数据。
  targetOrigin	指定哪些窗口能接收到消息事件，其值可以是 *（表示无限制）或者一个 URI。
  transfer	可选，是一串和 message 同时传递的 Transferable 对象。这些对象的所有权将被转移给消息的接收方，而发送一方将不再保有所有权。
- 缺点：安全性（无法检查origin和source属性会导致跨站点脚本攻击）
3. cors(跨域资源共享)
- 原理：通过异步请求API，请求设置了支持跨域请求的服务器
- 常见请求头：
  Access-Control-Allow-Origin
  Access-Control-Request-Method
  Access-Control-Request-Headers
  Access-Control-Allow-Credentials
- 预检请求：（针对跨域请求，确认允许跨域的预检）
- 缺点：需要服务端配合
4. 代理服务
- 原理：将资源接收方和请求方代理到一致的同源
- 常见实践：node中间件代理，nginx反向代理
5. 配合iframe实现
5.1 document.domain
  - 前提：仅限主域相同，这两个域名必须属于同一个基础域名而且所用的协议，端口都要一致，否则无法利用document.domain进行跨域.
  - 原理：利用主域相同子域不同通过设置document.domain为基础主域
  - 实现：
    父窗口：(http://www.domain.com/a.html)
    <iframe id="iframe" src="http://child.domain.com/b.html"></iframe>
    <script>
        document.domain = 'domain.com';
        var user = 'admin';
    </script>
    子窗口：(http://child.domain.com/b.html)
    <script>
      document.domain = 'domain.com';
      // 获取父窗口中变量
      alert('get js data from parent ---> ' + window.parent.user);
    </script>
5.2 window.name
  - 特点：name值在不同的页面（甚至不同域名）加载后依旧存在，并且可以支持非常长的 name 值（2MB）
  - 原理：通过iframe的src属性由外域转向本地域，跨域数据即由iframe的window.name从外域传递到本地域。
  - 实现：
    var proxy = function(url, callback) {
      var state = 0;
      var iframe = document.createElement('iframe');

      // 加载跨域页面
      iframe.src = url;

      // onload事件会触发2次，第1次加载跨域页，并留存数据于window.name
      iframe.onload = function() {
          if (state === 1) {
              // 第2次onload(同域proxy页)成功后，读取同域window.name中数据
              callback(iframe.contentWindow.name);
              destoryFrame();

          } else if (state === 0) {
              // 第1次onload(跨域页)成功后，切换到同域代理页面
              iframe.contentWindow.location = 'http://www.domain1.com/proxy.html';
              state = 1;
          }
      };

      document.body.appendChild(iframe);

      // 获取数据以后销毁这个iframe，释放内存；这也保证了安全（不被其他域frame js访问）
      function destoryFrame() {
          iframe.contentWindow.document.write('');
          iframe.contentWindow.close();
          document.body.removeChild(iframe);
      }
  };
  // 请求跨域b页面数据
  proxy('http://www.domain2.com/b.html', function(data){
      alert(data);
  });
5.3 location.hash
  - 原理：a与b跨域相互通信，通过中间页c来实现。 三个页面，不同域之间利用iframe的location.hash传值，相同域之间直接js访问来通信
  - 实现：A域：a.html -> B域：b.html -> A域：c.html，a与b不同域只能通过hash值单向通信，b与c也不同域也只能单向通信，但c与a同域，所以c可通过parent.parent访问a页面所有对象。

*/

// svg/canvas/webGL
/**/

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
