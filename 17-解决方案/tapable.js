/*
SyncHook
SyncBailHook 非undefined停止不再执行
SyncWaterfallHook 上一个注册的回调返回值会作为下一个注册的回调的参数
SyncLoopHook 非undefined继续执行当前回调
AsyncParallelHook 异步并行
AsyncSeriesHook 异步串行
AsyncParallelBailHook 异步并行，非undefined停止不再执行
AsyncSeriesBailHook 异步串行，非undefined停止不再执行
AsyncSeriesWaterfallHook 异步串行，上一个注册的回调返回值会作为下一个注册的回调的参数
AsyncSeriesLoopHook 异步串行， 非undefined继续执行当前回调
*/
class Hook {
    constructor(args = []) { 
        this.tasks = []
        this.args = args
    }
    tap(name, task){
        this.tasks.push(task)
    }
}

class SyncHook extends Hook {
    constructor(args = []){
        super(args)
    }
    call(...args){
        args = args.slice(0, this.args.length)
        this.tasks.forEach(task=>task(...args))
    }
}
let syncHook = new SyncHook(['name'])
syncHook.tap('hello', (name, age)=>{
    console.log(`hello ${name} ${age}`)
})
syncHook.tap('hello', name=>{
    console.log(`hello 11 ${name}`)
})
syncHook.tap('hello again', name=>{
    console.log(`hello again ${name}`)
})
// syncHook.call('xzl', 18)

// 非undefined停止不再执行
class SyncBailHook extends Hook {
    constructor(args = []){
        super(args)
    }
    call(...args){
        let ret, index = 0
        args = args.slice(0, this.args.length)
        do{
            ret = this.tasks[index++](...args)
        }while(ret===undefined && index < this.tasks.length)
    }
}
let syncBailHook = new SyncBailHook(['name', 'age'])
syncBailHook.tap('hello', (name, age)=>{
    console.log(`hello ${name} ${age}`)
})
syncBailHook.tap('hello', name=>{
    console.log(`hello 11 ${name}`)
    return '停止向下执行'
})
syncBailHook.tap('hello again', name=>{
    console.log(`hello again ${name}`)
})
// syncBailHook.call('xzl', 18)

// 上一个注册的回调返回值会作为下一个注册的回调的参数
class SyncWaterfallHook extends Hook {
    constructor(args = []){
        super(args)
    }
    call(...args){
        let [first, ...others] = this.tasks
        args = args.slice(0, this.args.length)
        let ret = first(...args)
        others.reduce((a, b)=>{
            return b(a)
        }, ret)
    }
}
let syncWaterfallHook = new SyncWaterfallHook(['name', 'age'])
syncWaterfallHook.tap('hello', (name, age)=>{
    console.log(`hello ${name} ${age}`)
    return [name, age]
})
syncWaterfallHook.tap('hello', name=>{
    console.log(name)
    console.log(`hello 11 ${name}`)
    return '停止向下执行'
})
syncWaterfallHook.tap('hello again', name=>{
    console.log(`hello again ${name}`)
})
// syncWaterfallHook.call('xzl', 18)

// 非undefined继续执行当前回调
class SyncLoopHook extends Hook {
    constructor(args = []){
        super(args)
    }
    call(...args){
        let ret, index = 0
        args = args.slice(0, this.args.length)
        while(index < this.tasks.length) {
            ret = this.tasks[index++](...args)
            if (ret !== undefined) {
                index--
            }
        }
    }
}
let syncLoopHook = new SyncLoopHook(['name', 'age'])
let i = 1
syncLoopHook.tap('hello', (name, age)=>{
    console.log(`hello ${name} ${age}`)
    i++
    return i <= 3 ? true : undefined
})
syncLoopHook.tap('hello', name=>{
    console.log(`hello 11 ${name}`)
})
syncLoopHook.tap('hello again', name=>{
    console.log(`hello again ${name}`)
})
// syncLoopHook.call('xzl', 18)

// 异步并行
class AsyncParallelHook extends Hook {
    constructor(args = []){
        super(args)
        this.asyncTasks = []
        this.promiseTasks = []
    }
    tapAsync(name, task){
        this.asyncTasks.push(task)
    }
    tapPromise(name, task) {
        this.promiseTasks.push(task)
    }
    callAsync(...args){
        let finalCallback = args.pop()
        args = args.slice(0, this.args.length)
        let index = 0
        let that = this
        let done = function(...arg){
            index++
            if(index==that.asyncTasks.length || arg.length){
                finalCallback && finalCallback(...arg)
            }
        }
        this.asyncTasks.forEach(task=>{
            task(...args, done)
        })
    }
    promise(...args){
        return new Promise((resolve,reject)=>{
            args = args.slice(0, this.args.length)
            let index = 0
            let that = this
            let done = function(...arg){
                index++
                if(index==that.asyncTasks.length || arg.length){
                    resolve(...arg)
                }
            }
            this.asyncTasks.forEach(task=>{
                task(...args, done)
            })
        })
    }
}
let asyncParallelHook = new AsyncParallelHook(['name', 'age'])
asyncParallelHook.tapAsync('hello', (name, cb)=>{
    console.log(`hello 11 ${name}`)
    cb(1)
})
asyncParallelHook.tapAsync('hello again', (name, cb)=>{
    console.log(`hello again ${name}`)
    // cb(2)
})
asyncParallelHook.callAsync('xzl', res=>{
    console.log(res)
    console.log('end')
})
// asyncParallelHook.promise('xzl').then(res=>{
//     console.log(res)
//     console.log('end')
// })