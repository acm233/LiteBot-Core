const log4js = require('@log4js-node/log4js-api')
require('log4js-json-layout2')

function log_output(level, text, module) {
    let logger = log4js.getLogger(`[${module}]`);
    if (module === undefined) {
        logger = log4js.getLogger('[LiteBot]');
    }
    logger.level = level
    logger[level](text);
}

LB.log = class {
    constructor(m) {
        this.Text = '';
        this.module = m
    }

    trace() {
        log_output('trace', Object.values(arguments).join(this.Text), this.module)
    }

    debug() {
        if(!LB.fs.isExists('./config/global_config.yml') || !LB.fs.readFrom('./config/global_config.yml')) return
        log_output('debug', Object.values(arguments).join(this.Text), this.module)
    }

    info() {
        log_output('info', Object.values(arguments).join(this.Text), this.module)
    }

    warn() {
        log_output('warn', Object.values(arguments).join(this.Text), this.module)
    }

    error() {
        log_output('error', Object.values(arguments).join(this.Text), this.module)
    }

    fatal() {
        log_output('fatal', Object.values(arguments).join(this.Text), this.module)
    }

    mark() {
        log_output('mark', Object.values(arguments).join(this.Text), this.module)
    }
}