const log = new LB.log('Demo Plugins');

log.info("我是Demo");

LB.OICQ.onEvent('notice.group.increase',e=>{
    log.debug('新人来辣！')
    console.log(e)
})

LB.OICQ.onEvent('notice.group.decrease',e=>{
    log.debug('牙败，有人退群！')
    console.log(e)
})