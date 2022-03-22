'use strict'
const {createClient} = require('oicq')
const cfg = LB.cfg.global()['qq_account']

//OICQ内部配置
const options = {
    platform: cfg['platform'],  //登录平台
    kickoff: true,              //下线后自动重登录
    log_level: 'warn',          //日志等级
    brief: true                 //格式化群消息中的表情和图片
}


const client = createClient(cfg['uin'], options)
client.on('system.online', () => LB.log.info('登录成功，开始处理消息'));

client.on('system.login.qrcode', function () {
    LB.log.error("扫码完成后请按回车进行登录")
    process.stdin.once('data', () => {
        this.login()
    })
}).on("system.login.slider", function (e) {
    LB.log.error("输入ticket后请按回车进行登录")
    process.stdin.once("data", (input) => {
        this.sliderLogin(input)
    });
}).on("system.login.device", function (e) {
    process.stdin.once("data", () => {
        this.login();
    });
}).on('system.login.error', function (e) {
    if (e.code < 0) this.login()
}).login(cfg['password']);


client.on('message.group', (e) => {
    //LB.log.debug(e, 'event:message.group')
})
/**
 * 发送群消息
 * @param groupID   群号
 * @param msg   消息内容
 */
LB.SendGroupMessage = (groupID, msg) => {     //发送群消息
    if (!client.isOnline()) {
        LB.log.warn('已阻止调用API：QQ未登录');
        return
    }
    client.sendGroupMsg(groupID, msg)
}

//退出QQ登录
LB.logout = () => {
    client.logout()
}