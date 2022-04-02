"use strict"
const log = new LB.log('Websocket_Loader')
const cfg = LB.fs.readFrom('./config/global_config.yml')['websocket_server']
const {md5_encrypt} = require('../utils/encryptor')


for (let n in cfg) {
    if (!cfg[n].enable) continue

    let url = cfg[n].wsaddr + cfg[n].endpoint,
        k = md5_encrypt(cfg[n].wspasswd).toUpperCase().substring(0, 16),
        iv = md5_encrypt(cfg[n].wspasswd).toUpperCase().substring(16, 32),
        i = cfg[n].reconnect_interval
    //log.debug(`${n} , ${url} , ${k} , ${iv} , ${i}`)
    LB.WS.servers[n] = new LB.WS.instance(n, url, k, iv, i)
}