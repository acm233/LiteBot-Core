const fs = require('fs')
const path = require('path')
const yaml = require('yaml')

LB.fs = {readFrom, writeTo, isExists}


/**
 * 读取配置文件
 * @param p 配置文件相对路径
 * @return string
 * */
function readFrom(p) {
    if (path.extname(p) === '.yml') {
        return yaml.parse(fs.readFileSync(p, 'utf-8'))
    } else if (path.extname(p) === '.json') {
        return JSON.parse(fs.readFileSync(p, 'utf-8'))
    }
}

/**
 * 写入配置文件
 * @param p     配置文件相对路径
 * @param obj   待转换的对象
 * */
function writeTo(p, obj) {
    if (path.extname(p) === '.yml') {
        fs.writeFileSync(p, yaml.stringify(obj))
    } else if (path.extname(p) === '.json') {
        fs.writeFileSync(p, JSON.stringify(obj, null, '\t'))
    }
}

/**
 * 判断配置文件是否存在
 * @param p 配置文件相对路径
 * @return {boolean}
 */
function isExists(p){
    return fs.existsSync(p)
}