const path = require('path')
const fs = require('fs')
// 获取目录（正则匹配一下/^\d+-/）下index.js内容，截取第一个/* */内容
let contentArr = []
let pathFiles = fs.readdirSync(path.join(__dirname, './'))
pathFiles = pathFiles.filter(path=>/^\d+\-/.test(path)).sort((a,b)=>{
    return a.split('-')[0] - b.split('-')[0]
})
pathFiles.forEach(pathName=>{
    let content = fs.readFileSync(path.join(__dirname, pathName, 'index.js'), 'utf-8')
    content.replace(/^\/\*\*\*\*\*\*\*\*[\s\S]+\*\*\*\*\*\*\*\*\//, $_ => {
        contentArr.push({
            title: pathName,
            content: $_ || ''
        })
    })
})

let contentStr = contentArr.reduce((a,b)=> a + `\/\/ ${b.title}\r\n${b.content}\r\n\n`, '')
fs.writeFileSync(path.join(__dirname, './readme.js'), contentStr, 'utf-8')