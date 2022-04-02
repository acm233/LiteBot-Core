const log = new LB.log('Regex')
const cfg = LB.fs.readFrom('./config/regex.json')
/**
 * 正则处理函数
 * @param msg   待匹配的消息文本
 * @returns Object
 */
LB.Groups.regex = (msg) => {
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