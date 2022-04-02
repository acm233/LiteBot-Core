"use strict"
global.LB = {}
require('./modules/utils/logger')
require('./modules/utils/update_manager')
require('./modules/utils/config_loader')

const log = new LB.log()
if(!LB.fs.isExists('./config')){
    log.info('配置文件不存在！请将./modules/examples文件夹复制到根目录，并重命名为config')
    log.info('修改配置文件后，再启动LiteBot')
    process.exit(0)
}

LB.UTILS = {}
LB.OICQ = {
    Listeners: {}
}
LB.Groups = {}
LB.WS = {
    servers: [],
    listeners: []
}
LB.PlayersDB = {}
LB.PluginMgr = {}

require('./modules/utils/cli_controller')
require('./modules/utils/lang_helper')
require('./modules/groups/group_event_listener')
require('./modules/groups/oicq_loader')
require('./modules/groups/regex')
require('./modules/groups/group_message_helper')
require('./modules/utils/encryptor')
require('./modules/websocket/websocket_helper')
require('./modules/websocket/websocket_loader')
require('./modules/websocket/websocket_listener')
require('./modules/utils/players_db')
require('./modules/utils/plugin_loader');

process.on('unhandledRejection', function (err,promise) {
    log.error(`\n出现异常：\n${err}\n${promise}\n`)
})
