"use strict"
const sqlite3 = require('sqlite3').verbose();
const dbPath = './config/players_data.db'
const db = new sqlite3.Database(dbPath)

const servers = LB.CFG.global()['websocket_server']
const {allowlistEvent} = require('./lang_helper')
const log = new LB.log('players_db')

for (let i in servers) {
    db.run(`CREATE TABLE IF NOT EXISTS ${servers[i].ID} (QQID INTEGER UNIQUE , XBOXID STRING UNIQUE , BIND_STATUS BOOLEAN DEFAULT (false))`)
}

/**
 * 数据库查询
 * @param sql       查询语句
 * @param callback  回调函数
 */
const db_all = (sql, callback) => {
    db.all(sql, (err, row) => {
        if (err != null) {
            log.error(err)
            return
        }
        callback(row)
    })
}

/**
 * 数据库语句执行
 * @param sql   执行语句
 */
const db_run = (sql) => {
    db.run(sql, err => {
        if (err != null) {
            log.error(err)
        }
    })
}


/**
 * 绑定XboxID
 * @param groupid       群号
 * @param tips          提示消息
 * @param server_name   服务器名称
 * @param qq            待绑定的QQ
 * @param xboxid        待绑定的XboxID
 * @return {Promise<void>}
 */
LB.PlayersDB.bindXboxID = async (groupid, tips, server_name, qq, xboxid) => {
    let table_id = servers[server_name].ID
    let select_sql = `SELECT QQID,XBOXID FROM ${table_id} WHERE QQID='${qq}' or XBOXID='${xboxid}'`   //根据xboxid、qq查询数据库
    let insert_sql = `INSERT INTO ${table_id}(QQID, XBOXID, BIND_STATUS) VALUES('${qq}', '${xboxid}', false)`

    await db_all(select_sql, (res) => {
        if (res[0] != undefined) {
            if (res[0].QQID != qq) {
                LB.Groups.sendMsg(groupid, allowlistEvent(tips[0], server_name, xboxid, res[0].QQID))
                return
            }
            LB.Groups.sendMsg(groupid, allowlistEvent(tips[1], server_name, xboxid, res[0].QQID))
            return
        }
        db_run(insert_sql)
        LB.Groups.sendMsg(groupid, allowlistEvent(tips[2], server_name, qq, xboxid))
    })
}


/**
 * 解除绑定
 * @param groupid       群号
 * @param qq            待解绑的QQ
 * @param tips          提示消息（数组）
 * @param server_name   服务器名称
 * @return {Promise<void>}
 */
LB.PlayersDB.unbindXboxID = async (groupid, tips, server_name, qq) => {
    let table_id = servers[server_name].ID
    let select_sql = `SELECT XBOXID FROM ${table_id} WHERE QQID='${qq}'`

    await db_all(select_sql, (res) => {
        if (res[0] == undefined) { //查询不到该玩家qq对应的xboxid
            LB.Groups.sendMsg(groupid, allowlistEvent(tips[0], server_name, qq))
            return
        }

        try {
            if (!LB.WS.servers[server_name].isOK()) {   //连接异常（连接中断、出现错误等）
                LB.Groups.sendMsg(groupid, allowlistEvent('server_connect_error', server_name, qq))
                return
            }
        } catch (err) { //其他异常（一般只出现在未启用的时候）
            log.debug(err)
            log.debug(`ID为“${server_name}”（别名：“${server_name}”）的服务器尚未启用`)
            return
        }

        LB.Groups.src = groupid
        LB.WS.servers[server_name].runCMD(`allowlist remove ${res[0].XBOXID}`)
        let delete_sql = `DELETE FROM ${table_id} WHERE QQID='${qq}'`
        db_run(delete_sql)
        LB.Groups.sendMsg(groupid, allowlistEvent(tips[1], server_name, qq, res[0].XBOXID))
    })
}


/**
 * 添加白名单
 * @param groupid       群号
 * @param qq            待绑定的QQ
 * @param tips          提示消息（数组）
 * @param server_name   服务器名称
 * @return {Promise<void>}
 */
LB.PlayersDB.addAllowlist = async (groupid, tips, server_name, qq) => {
    let table_id = servers[server_name].ID
    let select_sql = `SELECT XBOXID,BIND_STATUS FROM ${table_id} WHERE QQID='${qq}'`
    await db_all(select_sql, (res) => {
        if (res[0] == undefined) {
            LB.Groups.sendMsg(groupid, allowlistEvent(tips[0], server_name, qq))    //未绑定
            return
        }

        let alreadyAdd = Boolean(res[0].BIND_STATUS)
        if (alreadyAdd) {
            LB.Groups.sendMsg(groupid, allowlistEvent(tips[1], server_name, qq, res[0].XBOXID))     //已经添加过白名单了
            return
        }

        try {
            if (!LB.WS.servers[server_name].isOK()) {   //连接异常（连接中断、出现错误等）
                LB.Groups.sendMsg(groupid, allowlistEvent('server_connect_error', server_name, qq))
                return
            }
        } catch (err) { //其他异常（一般只出现在未启用的时候）
            log.debug(err)
            log.debug(`ID为“${server_name}”（别名：“${server_name}”）的服务器尚未启用`)
            return
        }

        LB.Groups.src = groupid
        LB.WS.servers[server_name].runCMD(`allowlist add ${res[0].XBOXID}`)
        let update_sql = `UPDATE ${table_id} SET BIND_STATUS=true WHERE QQID='${qq}'`
        db_run(update_sql)
        LB.Groups.sendMsg(groupid, allowlistEvent('adding_to_allowlist', server_name, qq, res[0].XBOXID))  //白名单添加成功
    })
}


/**
 * 查询绑定信息
 * @param groupid       群号
 * @param qq            需要查询的QQ
 * @param tips          提示消息
 * @param server_name   服务器名称
 * @param perm          玩家权限值
 * @return {Promise<void>}
 */
LB.PlayersDB.getBindInfo = async (groupid, tips, server_name, qq, perm) => {
    let table_id = servers[server_name].ID
    let select_sql = `SELECT * FROM ${table_id} WHERE QQID='${qq}'`
    await db_all(select_sql, (res) => {
        if (res[0] == undefined) {
            LB.Groups.sendMsg(groupid, allowlistEvent(tips, server_name, qq))
            return
        }
        let status = ['已绑定，未添加', '已绑定，已添加']
        let permission = ['普通成员', '管理员']
        LB.Groups.sendMsg(groupid, allowlistEvent('get_bind_info', qq, res[0].XBOXID, permission[Number(perm)], status[res[0].BIND_STATUS]))
    })
}