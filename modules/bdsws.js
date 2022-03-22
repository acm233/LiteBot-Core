"use strict"
const cfg = LB.cfg.bds()

LB.bds = []

for (let i in cfg) {
    if (!cfg[i].enable) {
        continue
    }

    let url = cfg[i].wsaddr + cfg[i].endpoint,
        k = LB.MD5(cfg[i].wspasswd).substring(0, 16),
        iv = LB.MD5(cfg[i].wspasswd).substring(16, 32)

    LB.bds[i] = new LB.WSInstance(i, url, k, iv, 5)

}





