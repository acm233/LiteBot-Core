const WSClient = require('websocket').client;
const uuid = require('uuid');


/**
 * 执行命令数据包
 * @param k 加密密钥
 * @param iv 加密偏移量
 * @param pack 需要加密的数据包
 */
function encrypt(k, iv, pack) {
    let p = {
        type: 'encrypted',
        params: {
            mode: LB.cfg.ws_encrypt_type,
            raw: LB.AES.encrypt(k, iv, pack)
        }
    };
    return JSON.stringify(p);
}

/**
 * 执行命令数据包
 * @param k 加密密钥
 * @param iv 加密偏移量
 * @param cmd 执行命令
 */
function runcmd(k, iv, cmd) {
    let p = {
        type: 'pack',
        action: 'runcmdrequest',
        params: {
            cmd: cmd,
            id: uuid.v1()
        }
    }
    return encrypt(k, iv, JSON.stringify(p))
}

/**
 * 发送文本数据包
 * @param k 加密密钥
 * @param iv 加密偏移量
 * @param text 发送文本
 */
function sendtext(k, iv, text) {
    let p = {
        type: 'pack',
        action: 'sendtext',
        params: {
            text: text,
            id: uuid.v1()
        }
    };
    return encrypt(k, iv, JSON.stringify(p))
}

LB.WSInstance = class {
    /**
     * 初始化WebSocket客户端实例
     * @param name  WS连接名称
     * @param url   WS连接URL
     * @param k     加密密钥
     * @param iv    加密偏移量
     * @param r WS重连间隔
     */
    constructor(name, url, k, iv, r) {
        this.name = name;
        this.url = url;
        this.k = k;
        this.iv = iv;
        this.ws = new WSClient()

        this.ws.on('connect', (con) => { //WebSocket客户端连接成功
            this.con = con
            LB.log.info(`服务器 “${name}” 连接成功`,'WebSocket');

            con.on('close', () => {
                LB.log.warn(`服务器 “${name}” 已断开`,'WebSocket');
                setTimeout(() => this.ws.connect(this.url), r * 1000)
            }).on('message', (m) => {
                LB.WS.forEach((e) => {
                    try {
                        //监听来自各WebSocket服务器的消息
                        e(this.name, m.utf8Data);
                    } catch (err) {
                        LB.log.error(`服务器 “${name}” 连接异常(${err.message})`,'WebSocket');
                    }
                });
            }).on('error', (err) => {
                LB.log.error(`服务器 “${name}” 连接错误(${err.toString()})`,'WebSocket');
            });
        });

        this.ws.on('connectFailed', (err) => {
            LB.log.error(`服务器 “${name}” 连接失败(${err.toString()})`,'WebSocket');
            setTimeout(() => this.ws.connect(this.url), r * 1000)
        });

        this.ws.connect(this.url)
    };

    /**
     * 执行指令
     * @param m 加密后的指令数据包
     */
    runCMD(m) {
        try {
            LB.log.info(`[Group -> Server] (event:runcmdrequest) ${m}`,'WebSocket');
            this.con.sendUTF(runcmd(this.k, this.iv, m));
        } catch (err) {
            LB.log.error(`服务器 ${this.name} 连接中断:${err}`,'WebSocket');
            LB.bot.toMgmtGroup(LB.HELPER.MSG.getGroupEvent('server_connect_error'))
        }
    };

    /**
     * 发送文本消息
     * @param m 加密后的文本数据包
     */
    sendText(m) {
        try {
            LB.log.info(`[Group -> Server] (event:sendtext) ${m}`,'WebSocket');
            this.con.sendUTF(sendtext(this.k, this.iv, m));
        } catch (err) {
            LB.log.error(`[WebSocket] 服务器 ${this.name} 连接中断，无法发送消息:${err}`,'WebSocket');
        }
    }
}