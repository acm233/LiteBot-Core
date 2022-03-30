"use strict"
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'LiteBot>'
})

const log = new LB.log()
LB.cmd = {}

/**
 * 内置命令行
 * @param comm  命令内容
 */
function term_cli(comm) {
    switch (comm) {
        case '':
            rl.prompt()
            break;

        case 'stop':
            rl.close()
            break;

        default:
            log.error(`未知的指令：${comm}。检查输入是否正确`)
            rl.prompt()
            break;
    }
}

rl.on('line', (i) => {
    term_cli(i)
}).on('close', async () => {
        await LB.logout()
        await log.mark('正在退出程序...')
        process.exit(0)
    }
)