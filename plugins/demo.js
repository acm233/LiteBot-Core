"use strict"
const log = new LB.log('Demo');
const {segment} = require("oicq");

LB.OICQ.onEvent('notice.group.increase', (e, groupid) => {
    let message = [
        segment.at(e.user_id),
        "\n欢迎加入LiteBot实验室！",
        segment.image('./litebot.png')
    ];
    LB.Groups.sendMsg(groupid, message)

})

LB.OICQ.onEvent('notice.group.decrease', (e, groupid) => {
    let message = `${e.user_id} 离开了群聊`
    LB.Groups.sendMsg(groupid, message)
})