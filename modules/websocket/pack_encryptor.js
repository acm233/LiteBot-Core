const uuid = require("uuid");

const {aes_encrypt} = require('../utils/encryptor')

/**
 * 数据包加密
 * @param k 加密密钥
 * @param iv 加密偏移量
 * @param pack 需要加密的数据包
 */
function encrypt(k, iv, pack) {
    let p = {
        type: 'encrypted',
        params: {
            mode: 'aes_cbc_pkcs7padding',
            raw: aes_encrypt(k, iv, pack)
        }
    };
    return JSON.stringify(p);
}

class pack_encryptor {
    /**
     * 执行指令数据包
     * @param k 加密密钥
     * @param iv 加密偏移量
     * @param cmd 需要加密的指令文本
     */
    runcmd(k, iv, cmd) {
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
     * @param text 需要加密的文本
     */
    sendtext(k, iv, text) {
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
}

module.exports = new pack_encryptor()