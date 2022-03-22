const log4js = require('@log4js-node/log4js-api')

LB.log = {trace, debug, info, warn, error, fatal, mark}

function log_output(level, text, location) {
    let logger = log4js.getLogger(`[${location}]`);
    if (location === undefined) {
        logger = log4js.getLogger('[LBFox]');
    }
    logger.level = level
    logger[level](text);
}

function trace(text, location) {
    log_output('trace', text, location)
}

function debug(text, location) {
    log_output('debug', text, location)
}

function info(text, location) {
    log_output('info', text, location)
}

function warn(text, location) {
    log_output('warn', text, location)
}

function error(text, location) {
    log_output('error', text, location)
}

function fatal(text, location) {
    log_output('fatal', text, location)
}

function mark(text, location) {
    log_output('mark', text, location)
}