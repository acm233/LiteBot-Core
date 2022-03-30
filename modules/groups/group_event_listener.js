const log = new LB.log('group_listener')
const cfg = LB.CFG.global()['qq_group']

/**
 * 监听群消息事件
 * @param e 事件对象
 */
LB.OICQ.Listeners.onGroupMessage = (e) => {
    for (let i in cfg) {
        if (e.group_id != i) continue  //判断发信人所在群聊是否与设定的的群聊匹配
        LB.Groups.message_helper(e, cfg[i])
    }
}

/**
 * 监听群人数增加事件
 * @param e 事件对象
 */
LB.OICQ.Listeners.onGroupMemberIncrease = (e) => {
}

/**
 * 监听群人数减少事件
 * @param e 事件对象
 */
LB.OICQ.Listeners.onGroupMemberDecrease = (e) => {
}