const fs = require('fs')
const path = require('path')
const yaml = require('yaml')
const folder = './config/'

LB.cfg = {read, write, global, bds}

/**
 * 读取配置文件
 * @param filename 完整文件名
 * @return string
 * */
function read(filename) {
    let p = `${folder}${filename}`
    if (path.extname(filename) === '.yml') {
        return yaml.parse(fs.readFileSync(p, 'utf-8'))
    } else if (path.extname(filename) === '.json') {
        return JSON.parse(fs.readFileSync(p, 'utf-8'))
    }
}

/**
 * 写入配置文件
 * @param obj 待转换的对象
 * */
function write(obj) {
    let p = `${folder}${obj}`
    if (path.extname(obj) === '.yml') {
        fs.writeFileSync(p, yaml.stringify(obj))
    } else if (path.extname(obj) === '.json') {
        fs.writeFileSync(p, JSON.stringify(obj, null, '\t'))
    }
}

//加载全局配置
function global() {
    return read('global_config.yml')
}

//加载BDS连接配置
function bds() {
    return read('bds_list.json')
}