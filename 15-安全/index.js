/********
csrf（token）
xss（csp内容安全策略 / cookie httpOnly）
token/jwt/auth
sql注入
********/

// xss（csp内容安全策略 / cookie httpOnly）
/*

csp
  减少和报告 XSS 攻击
  - HTTP Header：
    Content-Security-Policy-Report-Only（表示不执行限制选项，只是记录违反限制的行为。它必须与report-uri选项配合使用。），
    Content-Security-Policy（配置好并启用后，不符合 CSP 的外部资源就会被阻止加载）
    两个可同时生效，如果 HTTP 头与 Meta 定义同时存在，则优先采用 HTTP 中的定义
  - 在HTML上使用：
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src https://*; child-src 'none';">
    <meta http-equiv="Content-Security-Policy-Report-Only" content="default-src 'self'; img-src https://*; child-src 'none';">
  违例报告
  默认情况下，违规报告并不会发送。为启用发送违规报告，你需要指定 report-uri (en-US) 策略指令，并提供至少一个URI地址去递交报告
  例：Content-Security-Policy: default-src 'self'; report-uri http://reportcollector.example.com/collector.cgi
    {
      "csp-report": {
        "document-uri": "http://example.com/signup.html",
        "referrer": "",
        "blocked-uri": "http://example.com/css/style.css",
        "violated-directive": "style-src cdn.example.com",
        "original-policy": "default-src 'none'; style-src cdn.example.com; report-uri /_/csp-reports"
      }
    }

*/