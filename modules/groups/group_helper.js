const log = new LB.log('group_helper')
const groups = LB.cfg.global()['qq_group']
const {groupEvent} = require('../utils/lang_helper')

LB.group.message_helper = (e, cfg) => {
    /*
    cfg.enable_allowlist_helper
    cfg.enable_die_event_forward
     */

    let group_id = e.group_id,
        group_name = e.group_name,
        qq = e.user_id,
        msg = e.raw_message,
        isAdmin = cfg.admin.some((val) => val === qq),   //判断发信人是否为bot管理员，返回Boolean
        rgx = LB.group.regex(msg)

    //未匹配到正则，且聊天转发启用时，将群消息转发到服务器，并返回
    if (rgx == undefined && cfg.enable_chat_forward) {
        //此处应根据玩家是否绑定xboxid，决定websocket消息中显示的玩家标识
        sendWsMsg(e.group_id, 'sendText', groupEvent('chat_to_server', group_name, qq, msg))
        return
    }

    //非管理员执行管理员指令，直接返回（权限判断）
    if (!isAdmin && rgx.permission == 1) {
        e.reply(groupEvent('permission_denied'))
        return
    }

    rgx.actions.forEach(a => {
        switch (a.type) {
            default:
                log.error(`未知的动作类型：${a.type}`)
                break;
            //向群内发送消息
            case "group_message":
                e.reply(a.content)
                break;

            //执行预定的cmd指令
            case "run_cmd":
                sendWsMsg(group_id, 'runCMD', a.content)
                break;

            //执行自定义cmd指令
            case "run_cmd_raw":
                let cmd = msg.replace(rgx.regex, '$2') //使用正则进行匹配
                sendWsMsg(group_id, 'runCMD', cmd)
                break;

            //玩家自个儿绑定XboxID
            case "bind_xboxid": {
                let tips = ['member_already_binded_by_others', 'member_already_binded', 'member_bind_succeeded'],
                    xboxid = msg.replace(rgx.regex, '$2')
                allowlistHelper('bindXboxID', group_id, tips, qq, xboxid)
            }
                break;

            //查询他人的绑定信息
            case "get_bind_info": {
                let tips = 'target_member_not_bind'
                for (let n in getAtQQ(e)) {
                    allowlistHelper('getBindInfo', group_id, tips, getAtQQ(e)[n], isAdmin)
                }
            }
                break;

            //玩家自个儿查询绑定信息
            case "get_bind_info_self":
                let tips = 'member_not_bind'
                allowlistHelper('getBindInfo', group_id, tips, qq, isAdmin)
                break;

            //为目标申请白名单
            case "add_allowlist": {
                let tips = ['target_member_not_bind', 'target_member_already_in_allowlist']
                for (let n in getAtQQ(e)) {
                    allowlistHelper('addAllowlist', group_id, tips, getAtQQ(e)[n])
                }
            }
                break;

            //玩家自个儿申请白名单
            case "add_allowlist_self": {
                let tips = ['member_not_bind', 'member_already_in_allowlist']
                allowlistHelper('addAllowlist', group_id, tips, qq)
            }
                break;

            //为目标解绑（解绑XboxID+删白名单）
            case "del_allowlist": {
                let tips = ['target_member_not_bind', 'target_member_unbind_succeeded']
                for (let n in getAtQQ(e)) {
                    allowlistHelper('unbindXboxID', group_id, tips, getAtQQ(e)[n])
                }
            }
                break;

            //玩家自个儿解绑（解绑XboxID+删白名单）
            case "del_allowlist_self": {
                let tips = ['member_not_bind', 'member_unbind_succeeded']
                allowlistHelper('unbindXboxID', group_id, tips, qq)
            }
                break;
        }
    })
}

/**
 * 获取艾特的目标
 * @param e 消息链
 * @return {*[]} 包含1个或多个QQ的数组
 */
function getAtQQ(e) {
    let atid = []
    for (let b in e.message) {
        if (e.message[b].type == "at") {
            atid.push(e.message[b].qq)
        }
    }
    return atid
}

/**
 * WebSocket消息群发
 * @param groupid   群号
 * @param type      WebSocket消息类型
 * @param msg       WebSocket消息内容
 */
function sendWsMsg(groupid, type, msg) {
    LB.group.src = groupid
    groups[groupid].bind_server.forEach(s => {
        LB.servers[s][type](msg)
    })
}

/**
 * 白名单操作函数
 * @param operation 白名单操作类型
 * @param groupid   群号
 * @param tips      操作提示信息
 * @param args      参数（qq、xboxid、perm等）
 */
function allowlistHelper(operation, groupid, tips, ...args) {
    groups[groupid].bind_server.forEach((s) => {
        LB.playersDB[operation](groupid, tips, s, ...args)
    })
}