"use strict"
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'mqfox>'
})

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
            LB.log.error(`未知的指令：${comm}。检查输入是否正确`)
            rl.prompt()
            break;
    }
}

rl.on('line', (i) => {
    term_cli(i)
}).on('close', () => {
        LB.logout()
        LB.log.mark('正在退出程序...')
        setTimeout(() => process.exit(0), 1000)
    }
)