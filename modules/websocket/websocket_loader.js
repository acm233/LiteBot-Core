"use strict"
const log = new LB.log('websocket_loader')
const cfg = LB.cfg.global().websocket_server
const {md5_encrypt} = require('../utils/encryptor')


for (let n in cfg) {
    if (!cfg[n].enable) continue

    let url = cfg[n].wsaddr + cfg[n].endpoint,
        k = md5_encrypt(cfg[n].wspasswd).toUpperCase().substring(0, 16),
        iv = md5_encrypt(cfg[n].wspasswd).toUpperCase().substring(16, 32),
        i = cfg[n].reconnect_interval
    LB.servers[n] = new LB.WSInstance(n, url, k, iv, i)
}