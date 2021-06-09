
// https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
function getXhr () {
    if(window.XMLHttpRequest) { // IE10 以上的浏览器以及其他浏览器支持使用 XMLHTTPRequest 对象，进行跨域资源共享(CORS)访问。
        return new window.XMLHttpRequest();
    }else if (window.XDomainRequest){ // IE8 & IE9
        return new window.XDomainRequest();
    }else{
        return new window.ActiveXObject('Microsoft.XMLHTTP');
    }
}
function ajax ({method, url, data = null, headers = {}, withCredentials, timeout = 30000, async = true}) {
    const xhr = getXhr();
    if (async) { // 默认为异步,需要onreadystatechange事件处理，且值为4再正确处理下面的内容。
        request.timeout = timeout
    }
    xhr.open(method, url, async)
    if (method.toLower() === 'post') {
        headers = Object.assign({
            'Content-Type': 'application/x-www-urlencoded' // 'application/json;charset=UTF-8'
        }, headers)
    }
    Object.keys(headers).forEach(key=>{
        xhr.setRequestHeader(key, headers[key])
    })
    xhr.send(JSON.stringify(data))
    xhr.withCredentials = withCredentials || false // 用来指定跨域 Access-Control 请求是否应当带有授权信息，如 cookie 或授权 header 头。
    xhr.onreadystatechange = function(){
        if(xhr.readyState===4 && (xhr.status===200||xhr.status===304)) {
            console.log(xhr.responseText)
        }
    }
    xhr.onerror = function(){console.log('error')}//  报错监听
    xhr.ontimeout = function(){console.log('timeout')} // 超时监听
    xhr.onprogress = function(e){console.log('progress:', e)} // 请求进度监听
    if (OH_NOES_WE_NEED_TO_CANCEL_RIGHT_NOW_OR_ELSE) {
        xhr.abort()
    }
}
module.exports.ajax = ajax