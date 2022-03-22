"use strict"

const _ver = '3.0.0',
    _year = new Date().getFullYear();

console.log(`\n ========================================\n  LiteBot ${_ver}\n  Powered by OICQ\n  ©${_year} Asurin219 All rights reserved.\n ========================================\n`)

global.LB = {}

require('./config_loader')
require('./cli')
require('./logger')
require('./oicq')
require('./network_request')
require('./encrypt')
require('./websocket')
require('./bdsws')


process.on('unhandledRejection', function (err) {
    // eslint-disable-next-line no-undef
    LB.log.warn('出现异常：' + err.message)
})