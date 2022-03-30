// noinspection JSUnresolvedVariable,JSCommentMatchesSignature,JSUnresolvedFunction,JSCheckFunctionSignatures

const CryptoJS = require('crypto-js')

class encryptor {
    /**
     * AES加密方法
     * @param k     加密密钥
     * @param iv    加密偏移量
     * @param data  待处理的未加密数据
     */
    aes_encrypt(k,iv,data) {
        let key = CryptoJS.enc.Utf8.parse(k),
            str = CryptoJS.enc.Utf8.parse(data),
            encrypted = CryptoJS.AES.encrypt(str, key, {
                iv: CryptoJS.enc.Utf8.parse(iv),
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
        return encrypted.toString()
    }

    /**
     * AES加密方法
     * @param k     加密密钥
     * @param iv    加密偏移量
     * @param data  待处理的已加密数据
     */
    aes_decrypt(k,iv,data) {
        let key = CryptoJS.enc.Utf8.parse(k),
            decrypt = CryptoJS.AES.decrypt(data, key, {
                iv: CryptoJS.enc.Utf8.parse(iv),
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }),
            decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
        return decryptedStr.toString()
    }

    /**
     * MD5加密方法
     * @param data  待处理的未加密数据
     */
    md5_encrypt = (data) => {
        return CryptoJS.MD5(data).toString()
    }
}

module.exports = new encryptor()