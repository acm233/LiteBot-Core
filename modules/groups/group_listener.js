const log = new LB.log('group_listener')
const cfg = LB.cfg.global()['qq_group']

/**
 * 监听群消息事件
 * @param e 事件对象
 */
LB.group.onMessage = (e) => {
    for (i in cfg) {
        if (e.group_id != i) continue  //判断发信人所在群聊是否与设定的的群聊匹配
        LB.group.message_helper(e, cfg[i])
    }
}

/**
 * 监听群人数增加事件
 * @param e 事件对象
 */
LB.group.onMemberIncrease = (e) => {
}

/**
 * 监听群人数减少事件
 * @param e 事件对象
 */
LB.group.onMemberDecrease = (e) => {
}


/*
LB.group = {
    onMessage,
    onMemberIncrease,
    onMemberDecrease
}

 */