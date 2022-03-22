// noinspection JSUnresolvedVariable,JSCommentMatchesSignature,JSUnresolvedFunction,JSCheckFunctionSignatures

const CryptoJS = require('crypto-js')

LB.AES = {encrypt, decrypt};

/**
 * AES加密方法
 * @param key   加密key
 * @param iv    加密偏移量
 * @param data  需要加密的数据
 * @return  string
 */
function encrypt(k, i, data) {
    let key = CryptoJS.enc.Utf8.parse(k),
        iv = CryptoJS.enc.Utf8.parse(i),
        str = CryptoJS.enc.Utf8.parse(data),
        encrypted = CryptoJS.AES.encrypt(str, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
    return encrypted.toString()
}

/**
 * AES解密方法
 * @param key   解密key
 * @param iv    解密偏移量
 * @param crypted   解密后的数据
 * @return  string
 */
function decrypt(k, i, crypted) {
    let key = CryptoJS.enc.Utf8.parse(k),
        iv = CryptoJS.enc.Utf8.parse(i),
        decrypt = CryptoJS.AES.decrypt(crypted, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }),
        decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
    return decryptedStr.toString()
}

/**
 * MD5加密方法
 * @param  str  需要加密的数据
 * @return string
 */
LB.MD5 = (str) => {
    return CryptoJS.MD5(str).toString()
}