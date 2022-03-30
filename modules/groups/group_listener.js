const log = new LB.log('group_listener')
const cfg = LB.cfg.global()['qq_group']

LB.group.onMessage = (e) => {
    for (i in cfg) {
        if (e.group_id != i) continue  //判断发信人所在群聊是否与设定的的群聊匹配
        LB.group.message_helper(e, cfg[i])
    }
}

LB.group.onMemberIncrease = (e) => {
}

LB.group.onMemberDecrease = (e) => {
}


/*
LB.group = {
    onMessage,
    onMemberIncrease,
    onMemberDecrease
}

 */