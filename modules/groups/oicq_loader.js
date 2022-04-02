'use strict'
const {createClient} = require('oicq')
const cfg = LB.fs.readFrom('./config/global_config.yml')['qq_account']
const log = new LB.log('OICQ')


//OICQ特定配置
const options = {
    platform: cfg['platform'],  //登录平台选择
    kickoff: true,              //下线后自动重登录
    log_level: 'warn',          //仅输出等级为warn的日志
    brief: true                 //格式化群消息中的表情和图片
}

const client = createClient(cfg['uin'], options)    //创建一个QQ客户端实例

client.on('system.online', () => log.info('登录成功，开始处理消息'));

client.on('system.login.qrcode', function () {
    log.error("扫码完成后请按回车进行登录")
    process.stdin.once('data', () => {
        this.login()
    })
}).on("system.login.slider", function (e) {
    log.error("输入ticket后请按回车进行登录")
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


client.on('message.group', e => {           //群消息事件
    LB.OICQ.Listeners.onGroupMessage(e)
}).on('notice.group.increase', e => {       //群成员增加事件
    LB.OICQ.Listeners.onGroupMemberIncrease(e)
}).on('notice.group.decrease', e => {       //群成员减少事件
    LB.OICQ.Listeners.onGroupMemberDecrease(e)
})


/**
 * 发送群消息
 * @param groupID   群号
 * @param msg   消息内容
 */
LB.Groups.sendMsg = (groupID, msg) => {     //发送群消息
    if (!client.isOnline()) {
        log.warn('已阻止调用API：QQ未登录');
        return
    }
    client.sendGroupMsg(groupID, msg)
}

//退出QQ登录
LB.OICQ.logout = async () => {
    await client.logout()
}