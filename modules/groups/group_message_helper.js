const log = new LB.log('Message_Helper')
const groups = LB.CFG.global()['qq_group']
const {groupEvent} = require('../utils/lang_helper')

LB.Groups.message_helper = (e, cfg) => {
    let group_id = e.group_id,
        group_name = e.group_name,
        qq = e.user_id,
        msg = e.raw_message,
        isAdmin = cfg.admin.some((val) => val === qq),   //判断发信人是否为bot管理员，返回Boolean
        func0 = cfg.enable_chat_forward,        //群功能1：聊天转发
        func1 = cfg.enable_allowlist_helper,    //群功能2：白名单助手
        rgx = LB.Groups.regex(msg)

    //未匹配到正则，且聊天转发启用时，将群消息转发到服务器，并返回
    if (rgx == undefined && func0) {
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

            //玩家自个绑定XboxID
            case "bind_xboxid": {
                let tips = ['member_already_binded_by_others', 'member_already_binded', 'member_bind_succeeded'],   //xboxid已被他人占用、玩家已绑定过、玩家绑定成功
                    xboxid = msg.replace(rgx.regex, '$2')
                allowlistHelper(func1, 'bindXboxID', group_id, tips, qq, xboxid)
            }
                break;

            //玩家自个查询绑定信息
            case "get_bind_info_self":
                let tips = 'member_not_bind'
                allowlistHelper(func1, 'getBindInfo', group_id, tips, qq, isAdmin)
                break;

            //玩家自个申请白名单
            case "add_allowlist_self": {
                let tips = ['member_not_bind', 'member_already_in_allowlist']
                allowlistHelper(func1, 'addAllowlist', group_id, tips, qq)
            }
                break;

            //玩家自个解绑（解绑XboxID+删白名单）
            case "del_allowlist_self": {
                let tips = ['member_not_bind', 'member_unbind_succeeded']
                allowlistHelper(func1, 'unbindXboxID', group_id, tips, qq)
            }
                break;

            //查询他人的绑定信息
            case "get_bind_info": {
                let tips = 'target_member_not_bind' //玩家未绑定
                for (let i in getAtQQ(e.message)){
                    allowlistHelper(func1, 'getBindInfo', group_id, tips, getAtQQ(e.message)[i])
                }
            }
                break;

            //为他人申请白名单
            case "add_allowlist": {
                let tips = ['target_member_not_bind', 'target_member_already_in_allowlist']
                for (let i in getAtQQ(e.message)){
                    allowlistHelper(func1, 'addAllowlist', group_id, tips, getAtQQ(e.message)[i])
                }
            }
                break;

            //为他人解绑（解绑XboxID+删白名单）
            case "del_allowlist": {
                let tips = ['target_member_not_bind', 'target_member_unbind_succeeded']
                for (let i in getAtQQ(e.message)){
                    allowlistHelper(func1, 'unbindXboxID', group_id, tips, getAtQQ(e.message)[i])
                }
            }
                break;
        }
    })
}

/**
 * 获取艾特的目标
 * @return {*[]} 包含1个或多个QQ的数组
 * @param msg
 */
function getAtQQ(msg) {
    let atid = []
    for (let b in msg) {
        if (msg[b].type == "at") {
            atid.push(msg[b].qq)
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
    LB.Groups.src = groupid
    groups[groupid].bind_server.forEach(s => {
        LB.WS.servers[s][type](msg)
    })
}

/**
 * 白名单操作函数
 * @param enable    白名单助手开关
 * @param operation 白名单操作类型
 * @param groupid   群号
 * @param tips      操作提示信息
 * @param args      参数（qq、xboxid、perm等）
 */
function allowlistHelper(enable, operation, groupid, tips, ...args) {
    if (!enable) return
    switch (operation) {
        case 'addAllowlist':case 'unbindXboxID':
            let bind_servers = groups[groupid].bind_server //该群的所有服务器
            LB.PlayersDB[operation](groupid, tips, bind_servers, ...args)
        break;

        default:
            LB.PlayersDB[operation](groupid, tips, ...args)
        break;
    }
}