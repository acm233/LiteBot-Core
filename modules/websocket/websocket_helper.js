const WSClient = require('websocket').client;
const {runcmd, sendtext} = require('./pack_encryptor')
const log = new LB.log('WebSocket')

LB.WS.instance = class {
    /**
     * 初始化WebSocket客户端实例
     * @param name  WS连接名称
     * @param url   WS连接URL
     * @param k     加密密钥
     * @param iv    加密偏移量
     * @param r     WS重连间隔
     */
    constructor(name, url, k, iv, r) {
        this.name = name;
        this.url = url;
        this.k = k;
        this.iv = iv;
        this.client = new WSClient()
        this.isOnline = false

        this.client.on('connect', (con) => { //WebSocket客户端连接成功
            this.con = con
            this.isOnline = true
            log.info(`服务器 “${name}” 连接成功`);

            con.on('close', () => {
                this.isOnline = false
                log.warn(`服务器 “${name}” 已断开`)
                this.client.connect(this.url)
                //setTimeout(() => this.client.connect(this.url), r * 1000)
            });
            con.on('message', (m) => {
                LB.WS.listeners.forEach(ws => {
                    try {
                        //监听来自各WebSocket服务器的消息
                        ws(this.name, m.utf8Data);
                    } catch (err) {
                        log.error(`服务器 “${name}” 出现异常(${err.message})`);
                    }
                });
            });
            con.on('error', (err) => {
                log.error(`服务器 “${name}” 连接错误(${err.toString()})`);
            });
        });

        this.client.on('connectFailed', (err) => {
            this.isOnline = false
            log.error(`服务器 “${name}” 连接失败(${err.toString()})，${r}秒后将尝试重连`);
            setTimeout(() => this.client.connect(this.url), r * 1000)
        });

        this.client.connect(this.url)
    };

    /**
     * 获取WebSocket连接状态
     * @return {boolean|*}
     */
    isOK() {
        return this.isOnline
    }

    /**
     * 发送指令
     * @param m 加密后的指令数据包
     */
    runCMD(m) {
        try {
            //log.info(`[Group -> Server] (event:runcmdrequest) ${m}`);
            this.con.sendUTF(runcmd(this.k, this.iv, m));
        } catch (err) {
            log.error(`服务器 ${this.name} 出现异常，无法发送消息:${err}`);
        }
    };

    /**
     * 发送文本消息
     * @param m 加密后的文本消息数据包
     */
    sendText(m) {
        try {
            //log.info(`[Group -> Server] (event:sendtext) ${m}`);
            this.con.sendUTF(sendtext(this.k, this.iv, m));
        } catch (err) {
            log.error(`服务器 ${this.name} 出现异常，无法发送消息:${err}`);
        }
    }
}