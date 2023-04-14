#!/usr/bin/env node

/**
 * 根据模板生成 service worker 文件
 * 使用场景：每次页面发版的时候，运行一下这个脚本，生成一个具有新版本的 sw.js
 */

const fs = require('fs')
const path = require('path')
const Handlebars = require('handlebars')

const source = fs.readFileSync(
  path.resolve(__dirname, 'sw.js.template'),
  'utf-8'
)

const template = Handlebars.compile(source)

const result = template({
  pageName: process.env.page,
  version: Date.now()
})

fs.writeFileSync(path.resolve(__dirname, '/dist/sw.js'), result)
