/********
MVVM/MVC
vue2.0/vue3.0
生命周期
diff
虚拟dom（snabbdom）
render函数
响应式
数据双向绑定
v-modal
v-if/v-for
slot
组件通信（props/$emit, eventBus, store, $attrs/$listeners, provide/inject, $children/$parent/$refs）
nuxt
指令（v-directive）
vue-loader
nextTick
面经
********/

// vue-loader
/*
手动配置（cli新版本）
  plugins: require('vue-loader/lib/plugin')
    new VueLoaderPlugin()
    将定义过的其他规则复制并应用到.vue文件里相应语言块（/.js$/规则也会应用与.vue文件里的<script>）
热重载
  - 不只是重新加载，载不刷新页面的情况下替换所有组件实例并保持当前状态
  - 状态保留规则
    编辑<template>，这个组件实例就地重新渲染并保留当前所有私有状态（因为模板被编译成了新的无副作用的渲染函数）
    编辑<script>，这个组件实例将就地销毁并重新创建（应用中其他组件状态将会被保留），如果这个组件带有全局副作用，则整个页面将会被重新加载
    编辑<style>，会通过vue-style-loader自行热加载，不会影响应用状态
CSS提取
  rules: 'mini-css-extract-plugin'
    {test: '/\.css%/', use: [process.env.NODE_ENV!=='production'?'vue-style-loader':MiniCssExtractPlugin.loader, 'css-loader']}
  plugins: 'mini-css-extract-plugin'
    new MiniCssExtractPlugin({filename: style.css})
代码校验（linting）
  eslint
    - .eslintrc.js
      module.exports={extends: ["plugin: vue/essential"]}
    - rules: 'eslint-loader'
      {enforce:'pre', test: '/.(js|vue)$/', loader: 'eslint-loader', exclude: /node_modules/}
  stylelint
    - plugin: 'stylelint-webpack-plugin'
      new StyleLintPlugin({files: ['**\/*.{vue,htm,html,css,sss,less,scss,sass}']})
*/

// nextTick
/*
触发时机：在同一事件循环中的数据变化后，DOM完成更新，立即执行nextTick(callback)内的回调。
原理：在内部对异步队列，宏任务尝试依次使用原生的 setImmediate，MessageChannel，setTimeout(fn, 0)；如果是微任务使用Promise.then，不支持直接使用宏任务。
*/

// 面经
/*
vue双向绑定原理？
【
基于数据驱动，通过defineProtype()劫持
】
如何在vue项目中实现按需加载？
【
UI组件库
使用babel-plugin-components/babel-plugin-import按需加载
vue单页面
函数返回import组件
】
vue中父子组件的生命周期执行顺序？
【
加载渲染过程
父beforeCreate->父created->父beforeMount->子beforeCreate->子created->子beforeMount->子mounted->父mounted
子组件更新过程
父beforeUpdate->子beforeUpdate->子updated->父updated
父组件更新过程
父beforeUpdate->父updated
销毁过程
父beforeDestroy->子beforeDestroy->子destroyed->父destroyed
】
*/