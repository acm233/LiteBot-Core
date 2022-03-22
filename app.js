"use strict"
const fs = require('fs')
const _ver = JSON.parse(fs.readFileSync('./package.json','utf-8'))['version'],
    _year = new Date().getFullYear();

console.log(`\n ========================================\n  LiteBot ${_ver}\n  Powered by OICQ\n  ©${_year} Asurin219 All rights reserved.\n ========================================\n`)

global.LB = {}

require('./modules/config_loader')
require('./modules/cli')
require('./modules/logger')
require('./modules/oicq')
require('./modules/network_request')
require('./modules/encrypt')
require('./modules/websocket')
require('./modules/bdsws')


process.on('unhandledRejection', function (err) {
    // eslint-disable-next-line no-undef
    LB.log.warn('出现异常：' + err.message)
})