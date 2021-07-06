/********
nginx（负载均衡（ip_hash，lest_conn,backup,down,一致性hash），反向代理，动静分离）
状态码（200,204,301,302，304,401,403,404,500）
1.0/1.1/2.0
http/https（http+ssl，对称加密，非对称加密，数字证书）
TCP
UDP
http3.0(uqic)
DNS（域名解析系统）
CDN（内容分发网络）
缓存（强缓存：expries，cache-control；协商缓存：last-modified，etag）
CORS
安全（中间人攻击：伪造证书）
5层网络结构（应用层（应用层表示层会话层）（http），传输层（tcp，udp），网络层（ip），数据链路层，物理层）
websocket
keep-alive
面经
********/

// DNS
/*
预解析的实现：
  1、用meta信息来告知浏览器, 当前页面要做DNS预解析:<meta http-equiv="x-dns-prefetch-control" content="on" />
  2、在页面header中使用link标签来强制对DNS预解析: <link rel="dns-prefetch" href="http://bdimg.share.baidu.com" />
*/

// CDN
/*
CDN的加速资源是跟域名绑定的
通过域名访问资源，首先是通过DNS分查找离用户最近的CDN节点（边缘服务器）的IP
通过IP访问实际资源时，如果CDN上并没有缓存资源，则会到源站请求资源，并缓存到CDN节点上，这样，用户下一次访问时，该CDN节点就会有对应资源的缓存了。
*/

// 1.0/1.1/2.0
/*
http/1.0

http/1.1
  主流
  缺陷：
    HTTP 1.1过于庞大
    过多的可选项（HTTP管线化（HTTP Pipelining））
    未能被充分利用的TCP（更好的利用TCP来减少传输过程中的暂停，并充分挖掘利用那些本可以用于发送/接受更多数据的时间）
    传输大小和资源数量
    恼人的延迟（1.1对网络延迟非常敏感：部分原因是HTTP Pipelining还有很多问题，大部分用户默认关闭的。）
    线头阻塞（Head of line blocking）
  前端克服1.1缺陷
    Spriting
    内联（Inlining）
    拼接（Concatenation）
    分片（Sharding）
  升级HTTP
    降低协议对延迟的敏感
    修复pipelining和head of line blocking的问题
    防止主机需求更高的连接数量
    保留所有现有的接口，内容，URI格式和结构
http/2.0
  概念
    二进制协议
    多路复用的流
    优先级和依赖性
    头压缩
    重置
    服务器推送
    流量控制

*/

// https
/*
http转https
提供自动的重定向使得HTTP页面导向HTTPS版本
  server {
    listen       80;
    server_name  xxx.com www.xxx.com;
    rewrite ^(.*) https://$host$1 permanent;
  }
更佳操作：配合 HSTS（HTTP严格传输安全） 策略
HSTS
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  这是一种网站用来声明他们只能使用安全连接（HTTPS）访问的方法
  如果一个网站声明了 HSTS 策略，浏览器必须拒绝所有的 HTTP 连接并阻止用户接受不安全的 SSL 证书
  第一次访问的网站，不受 HSTS 的保护（可以使用称为 HSTS 预加载列表（HSTS preload list）的附加保护方法）
    如果你把你的网站添加到预加载列表中，浏览器会首先检查内部列表，这样你的网站就永远不会通过 HTTP 访问，甚至在第一次连接尝试时也不会。
    这个方法不是 HSTS 标准的一部分，但是它被所有主流浏览器(Chrome、 Firefox、 Safari、 Opera、 IE11 和 Edge)使用
  chrome://net-internals/#hsts，删除缓存的domain
*/

// TCP
/*
tips:
  - TCP的包是没有IP地址的，那是IP层上的事。但是有源端口和目标端口。
  - 一个TCP连接需要四个元组来表示是同一个连接（src_ip, src_port, dst_ip, dst_port）准确说是五元组，还有一个是协议。但因为这里只是说TCP协议，所以，这里我只说四元组。
  - 四个非常重要的概念
    - Sequence Number是包的序号，用来解决网络包乱序（reordering）问题。（SeqNum的增加是和传输的字节数相关的）
    - Acknowledgement Number就是ACK——用于确认收到，用来解决不丢包的问题。
    - Window又叫Advertised-Window，也就是著名的滑动窗口（Sliding Window），用于解决流控的。
    - TCP Flag ，也就是包的类型，主要是用于操控TCP的状态机的。

1. TCP的状态机
  1.1 网络上的传输是没有连接的，包括TCP也是一样的。而TCP所谓的“连接”，通讯的双方维护状态机。（见/img/TCP内部状态机.png）
  1.2 注意事项：
    - 关于建连接时SYN超时
      在Linux下，默认重试次数为5次，重试的间隔时间从1s开始每次都翻倍，5次的重试时间间隔为1s, 2s, 4s, 8s, 16s，总共31s，
      第5次发出后还要等32s都知道第5次也超时了，所以，总共需要 1s + 2s + 4s+ 8s+ 16s + 32s = 2^6 -1 = 63s，TCP才会把断开这个连接。
    - 关于SYN Flood攻击
      给服务器发了一个SYN后就下线，于是服务器需要默认等63s才会断开连接，这样攻击者就把服务器的syn连接的队列耗尽，让正常的连接请求不能处理。
      解决1：Linux下给了一个叫tcp_syncookies的参数来应对
        当SYN队列满了后，TCP会通过源地址端口、目标地址端口和时间戳打造出一个特别的Sequence Number发回去（又叫cookie）
        如果是攻击者则不会有响应，如果是正常连接，则会把这个 SYN Cookie发回来，然后服务端可以通过cookie建连接（即使你不在SYN队列中）
        请注意，请先千万别用tcp_syncookies来处理正常的大负载的连接的情况。
      解决2：调整三个TCP参数
        tcp_synack_retries 可以用他来减少重试次数
        tcp_max_syn_backlog 可以增大SYN连接数
        tcp_abort_on_overflow 处理不过来干脆就直接拒绝连接
    - 关于ISN的初始化
      ISN会和一个假的时钟绑在一起，这个时钟会在每4微秒对ISN做加一操作，直到超过2^32，又从0开始
      一个ISN的周期大约是4.55个小时
      只要MSL的值小于4.55小时，那么，我们就不会重用到ISN
    - 关于 MSL 和 TIME_WAIT
      从TIME_WAIT状态到CLOSED状态，有一个超时设置，这个超时设置是 2*MSL（RFC793定义了MSL为2分钟，Linux设置成了30s）
      TIME_WAIT存在原因：
        TIME_WAIT确保有足够的时间让对方端收到了ACK，如果被动关闭的那方没有收到Ack，就会触发被动端重发Fin，一来一去正好2个MSL
        有足够的时间让这个连接不会跟后面的连接混在一起

2. TCP重传机制
  2.1 超时重传机制
      - 仅重传timeout的包 （节省带宽，但是慢）
      - 重传timeout后所有的数据 （会快一点，但会浪费带宽，也可能会有无用功）
  2.2 快速重传机制
    引入了 Fast Retransmit 的算法
    不以时间驱动，而以数据驱动重传（如果发送方连续收到3次相同的ack，就重传）
    但是还是没有解决重传单个还是所有
  2.3 SACK 方法（Selective Acknowledgment）
    需要在TCP头里加一个SACK的东西，ACK还是Fast Retransmit的ACK，SACK则是汇报收到的数据碎版
    在 Linux下，可以通过tcp_sack参数打开这个功能（Linux 2.4后默认打开）
    发送方也不能完全依赖SACK，还是要依赖ACK，并维护Time-Out，如果后续的ACK没有增长，那么还是要把SACK的东西重传，另外，接收端这边永远不能把SACK的包标记为Ack
  2.4 D-SACK（Duplicate SACK） – 重复收到数据的问题
    使用了SACK来告诉发送方有哪些数据被重复接收了
    Linux下的tcp_dsack参数用于开启这个功能（Linux 2.4后默认打开）
    好处：
    1）可以让发送方知道，是发出去的包丢了，还是回来的ACK包丢了。
    2）是不是自己的timeout太小了，导致重传。
    3）网络上出现了先发的包后到的情况（又称reordering）
    4）网络上是不是把我的数据包给复制了。

3. TCP的流迭、拥塞处理
  3.1 TCP的RTT算法（Round Trip Time）
    - 一个数据包从发出去到回来的时间
    - 方便设置Timeout——RTO（Retransmission TimeOut），以让我们的重传机制更高效
    3.1.1 经典算法
      首先，先采样RTT，记下最近好几次的RTT值
      然后做平滑计算SRTT（ Smoothed RTT）
        SRTT = ( α * SRTT ) + ((1- α) * RTT) （其中的 α 取值在0.8 到 0.9之间）
      开始计算RTO
        RTO = min [ UBOUND,  max [ LBOUND,   (β * SRTT) ]  ]
          UBOUND是最大的timeout时间，上限值
          LBOUND是最小的timeout时间，下限值
          β 值一般在1.3到2.0之间。
    3.1.2 Karn / Partridge 算法
      忽略重传，不把重传的RTT做采样
      只要一发生重传，就对现有的RTO值翻倍（这就是所谓的 Exponential backoff）
    3.1.3 Jacobson / Karels 算法
      SRTT = SRTT + α (RTT – SRTT) —— 计算平滑RTT
      DevRTT = (1-β)DevRTT + β(|RTT-SRTT|) ——计算平滑RTT和真实的差距（加权移动平均）
      *RTO= µ * SRTT + ∂ DevRTT —— 神一样的公式
      （其中：在Linux下，α = 0.125，β = 0.25， μ = 1，∂ = 4）
    最后的这个算法在被用在今天的TCP协议中（Linux的源代码在：tcp_rtt_estimator）

  3.2 TCP滑动窗口（Sliding Window）
    TCP头里有一个字段叫Window，又叫Advertised-Window
    这个字段是接收端告诉发送端自己还有多少缓冲区可以接收数据。于是发送端就可以根据这个接收端的处理能力来发送数据，而不会导致接收端处理不过来。
    3.2.1 Zero Window
      TCP使用了Zero Window Probe技术，缩写为ZWP
      发送端在窗口变成0后，会发ZWP的包给接收方，让接收方来ack他的Window尺寸，一般这个值会设置成3次，第次大约30-60秒（不同的实现可能会不一样）。如果3次过后还是0的话，有的TCP实现就会发RST把链接断了。
    3.2.2 Silly Window Syndrome（糊涂窗口综合症）

  3.3 慢热启动算法 – Slow Start
    慢启动的意思是，刚刚加入网络的连接，一点一点地提速
    1）连接建好的开始先初始化cwnd = 1，表明可以传一个MSS大小的数据。
    2）每当收到一个ACK，cwnd++; 呈线性上升
    3）每当过了一个RTT，cwnd = cwnd*2; 呈指数让升
    4）还有一个ssthresh（slow start threshold），是一个上限，当cwnd >= ssthresh时，就会进入“拥塞避免算法”

  3.4 拥塞避免算法 – Congestion Avoidance
    ssthresh的值是65535，单位是字节
    1）收到一个ACK时，cwnd = cwnd + 1/cwnd
    2）当每过一个RTT时，cwnd = cwnd + 1

  3.5 拥塞状态时的算法
    1）等到RTO超时，重传数据包。TCP认为这种情况太糟糕，反应也很强烈。
      sshthresh =  cwnd /2
      cwnd 重置为 1
      进入慢启动过程
    2）Fast Retransmit算法，也就是在收到3个duplicate ACK时就开启重传，而不用等到RTO超时。
      TCP Tahoe的实现和RTO超时一样。
      TCP Reno的实现是：
        cwnd = cwnd /2
        sshthresh = cwnd
        进入快速恢复算法——Fast Recovery

  3.6 快速恢复算法 – Fast Recovery
    TCP Reno
    TCP New Reno

  3.7 FACK算法
    基于SACK的

  3.8 其它拥塞控制算法简介
    TCP Vegas 拥塞控制算法
    HSTCP(High Speed TCP) 算法
    TCP BIC 算法
    TCP WestWood算法
*/

// keep-alive
/*
http/1.0 提供Conection: keep-alive
http/1.1 默认开启，通过Connection: close显式关闭
具体原理：
通过不关闭TCP来实现持久连接，通过Content-Length与Transfer-Encoding: chunked来界定请求或响应实体的边界，进而实现响应
1. node通过net建立TCP Server，如果保持持久连接，无法判断请求或响应实体的边界
  require('net').createServer(function(sock) {
    sock.on('data', function(data) {
        sock.write('HTTP/1.1 200 OK\r\n');
        sock.write('\r\n');
        sock.write('hello world!');
        sock.destroy();  // 去掉这行，将处于pending状态，无法响应
    });
  }).listen(9090, '127.0.0.1');
  1.1 对于非持久连接，浏览器可以通过连接是否关闭来界定请求或响应实体的边界
2. Content-Length： 通过长度判断出响应实体已结束
  require('net').createServer(function(sock) {
    sock.on('data', function(data) {
        sock.write('HTTP/1.1 200 OK\r\n');
        sock.write('Content-Length: 12\r\n');
        sock.write('\r\n');
        sock.write('hello world!'); // 12个字节
    });
  }).listen(9090, '127.0.0.1');
  2.1 Content-Length 和实体实际长度不一致会怎样？
    - 如果 Content-Length 比实际长度短，会造成内容被截断；
    - 如果比实体内容长，会造成 pending；
3. Transfer-Encoding: chunked 分块编码（chunked）
  require('net').createServer(function(sock) {
      sock.on('data', function(data) {
          sock.write('HTTP/1.1 200 OK\r\n');
          sock.write('Transfer-Encoding: chunked\r\n');
          sock.write('\r\n');

          sock.write('b\r\n');
          sock.write('01234567890\r\n');

          sock.write('5\r\n');
          sock.write('12345\r\n');

          sock.write('0\r\n'); // 最后用一个 0 长度的分块表明数据已经传完了
          sock.write('\r\n');
      });
  }).listen(9090, '127.0.0.1');
  3.1 做 WEB 性能优化时，有一个重要的指标叫 TTFB（Time To First Byte），它代表的是从客户端发出请求到收到响应的第一个字节所花费的时间。
  3.2 Content-Length需要计算，与TTFB理念背道而驰
  3.3 不依赖头部的长度信息，也能知道实体的边界
  3.4 规则：
      - 每个分块包含十六进制的长度值和数据，长度值独占一行，长度不包括它结尾的 CRLF（\r\n），也不包括分块数据结尾的 CRLF。
      - 最后一个分块长度值必须为 0，对应的分块数据没有内容，表示实体结束。

*/

//  http3.0(uqic)
/*
基于UDP
  网络设备会拦截端口53（用于DNS）以外的UDP流量
  并且有些设备对UDP的传输较慢，技术更新也慢
TLS传输层安全协议
  http2.0可以不使用，http3.0必须使用
  TLS1.3 握手更快
快速握手
  提供0-RTT和1-RTT连接建立（0-RTT基于建立过连接并缓存了该连接）
通过端点建立连接（0-RTT）
  第一次通过IP+端口建立连接之后，会创建连接id（网络发生变化后也可以重新连接）

*/

// 缓存（强缓存：expries，cache-control；协商缓存：last-modified，etag）
/*
强缓存：
- expries 1.0
- cache-control: max-age=XXX 1.1
- max-age优先expries
协商缓存:
- cache-control: no-cache
- Last-Modified/If-Modifed-Since（s级以下）
- Etag/If-None-Match
- Etag优先Last-Modifed
http cache：
- 200 from memory cache
  不访问服务器，直接读缓存，从内存中读取缓存
  当kill进程后，也就是浏览器关闭以后，数据将不存在
- 200 from disk cache
  不访问服务器，直接读缓存，从磁盘中读取缓存
  当kill进程时，数据还是存在
- 304 Not Modified
  访问服务器，发现数据没有更新，服务器返回此状态码（不返回资源）。
  然后从缓存中读取数据。
用户行为对浏览器缓存的影响：
- 打开网页：
  地址栏输入地址： 查找 disk cache 中是否有匹配。如有则使用；如没有则发送网络请求。
- 普通刷新 (F5)：
  因为 TAB 并没有关闭，因此 memory cache 是可用的，会被优先使用(如果匹配的话)。其次才是 disk cache。
- 强制刷新 (Ctrl + F5)：
  浏览器不使用缓存，因此发送的请求头部均带有 Cache-control: no-cache(为了兼容，还带了 Pragma: no-cache),服务器直接返回 200 和最新内容。
*/

// 面经
/*
tcp和udp的区别和使用场景
quic基于udp怎么保证可靠性
【
UDP不提供可靠传输，quic基于UDP之上增加一个带来可靠性的层，提供了数据包重传，拥塞控制，调整传输节奏以及其他一些TCP存在的特性
】
讲一下同源策略和跨域方案？cors的几个头部是什么？
grpc相比http的优势？
*/
