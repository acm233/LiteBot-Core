"use strict"
const fs = require('fs')
const _ver = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))['version'],
    _year = new Date().getFullYear();

console.log(`\n ========================================\n  LiteBot ${_ver}\n  Powered by OICQ\n  ©${_year} Asurin219 All rights reserved.\n ========================================\n`)

global.LB = {}
LB.group = {}
LB.servers = []
LB.wslisteners = []

require('./modules/utils/logger')
require('./modules/utils/config_loader')
require('./modules/utils/cli_controller')
require('./modules/utils/lang_helper')
require('./modules/groups/oicq_loader')
require('./modules/groups/regex')
require('./modules/groups/group_listener')
require('./modules/groups/group_helper')
//require('./modules/utils/network_request')
require('./modules/utils/encryptor')
require('./modules/websocket/websocket_helper')
require('./modules/websocket/websocket_loader')
require('./modules/websocket/websocket_listener')
require('./modules/utils/players_db')

const log = new LB.log()

process.on('unhandledRejection', function (err) {
    log.warn('出现异常：' + err.message)
})