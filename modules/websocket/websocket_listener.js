const log = new LB.log('Websocket_Listener')
const {aes_decrypt} = require('../utils/encryptor')
const groups = LB.conf.readFrom('./config/global_config.yml')['qq_group']

const {gameEvent} = require('../utils/lang_helper')

/**
 * WebSocket数据包解析函数
 * @param server_name   服务器名称
 * @param str           数据包内容（加密后的字符串）
 */
function ws_converter(server_name, str) {
    let servers = LB.WS.servers[server_name],
        pack_type = JSON.parse(str).type

    if (pack_type == "encrypted") { //接收到已加密的数据包
        try {
            var TempData = aes_decrypt(servers.k, servers.iv, JSON.parse(str).params.raw)
        } catch (err) {
            log.error(`异常信息：${err.message}`);
            return;
        }

        ws_receiver(server_name, TempData)
    } else if (pack_type == "pack") { //接收到未加密的标准数据包
        ws_receiver(server_name, str)
    } else { //接收到未知的数据包
        log.error(`未知的数据包类型：${pack_type}`);
    }
}

/**
 * WebSocket数据包处理函数
 * @param srv   服务器名称
 * @param str           数据包内容（解密后的字符串）
 */
function ws_receiver(srv, str) {
    let data = JSON.parse(str),
        player = data.params.sender,
        text = data.params.text,
        result = data.params.result,
        dmname = data.params.dmname,
        mobname = data.params.mobname,
        mobtype = data.params.mobtype,
        srcname = data.params.srcname,
        srctype = data.params.srctype

    switch (data.cause) {
        case "join":
            sendGroupMsg(srv, player, gameEvent('player_join', player, srv), gameEvent('server_player_join', player))
            break

        case "left":
            sendGroupMsg(srv, player, gameEvent('player_left', player, srv), gameEvent('server_player_left', player))
            break

        case "chat":
            sendGroupMsg(srv, player, gameEvent('player_chat', player, srv, text), text)
            break

        case "runcmdfeedback":
            LB.Groups.sendMsg(LB.Groups.src, gameEvent('runcmd_feedback', srv, result))
            break

        case "mobdie":
            break;

        case "decodefailed":
            log.error('数据包解析失败')
            break
    }

}

/**
 * 广播消息到所有群聊
 * @param server_name   服务器名称
 * @param player        玩家昵称（XboxID）
 * @param text          消息文本（服->群）
 * @param raw_text      消息文本（服<->服）
 */
function sendGroupMsg(server_name, player, text, raw_text) {
    for (g in groups) {     //遍历所有群聊
        groups[g].bind_server.forEach(s => {    //遍历每个群聊中绑定的服务器
            if (groups[g].enable_chat_forward) {
                if (server_name == s) {    //遍历得到的服务器名=本服务器
                    LB.Groups.sendMsg(g, text)    //转发消息到该群
                } else if (groups[g].bind_server.some((val) => val === server_name)) {
                    //遍历得到的服务器名!=本服，则判断该服是否和本服在同一群组
                    LB.WS.servers[s].sendText(gameEvent('chat_between_server', player, server_name, raw_text))
                }
            }
        })
    }
}

LB.WS.listeners.push(ws_converter)