const log = new LB.log('regex')
const cfg = LB.cfg.regex()

/**
 * 正则处理函数
 * @param msg   待匹配的消息文本
 * @returns Object
 */
LB.group.regex = (msg) => {
    for (let i in cfg) {
        let reg = new RegExp(cfg[i].regex, "g")
        if (msg == msg.match(reg)) {
            return {
                regex: reg,
                permission: cfg[i].permission,
                actions: cfg[i].actions
            }
        }
    }
}