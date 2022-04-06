"use strict"
const sqlite3 = require('sqlite3').verbose();
const dbPath = './config/players_data.db'
const db = new sqlite3.Database(dbPath)

const servers = LB.conf.readFrom('./config/global_config.yml')['websocket_server']
const groups = LB.conf.readFrom('./config/global_config.yml')['qq_group']
const {allowlistEvent} = require('./lang_helper')
const log = new LB.log('PlayersDB')


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
 * 数据库事务
 * @param sql   执行语句
 */
const db_exec = (sql) => {
    db.exec(sql, err => {
        if (err != null) {
            log.error(err)
        }
    })
}

let init_sql = ''

init_sql += 'CREATE TABLE IF NOT EXISTS PLAYERS (ID INTEGER PRIMARY KEY AUTOINCREMENT, QQ_ID TEXT UNIQUE, Xbox_ID TEXT UNIQUE);'
init_sql += 'CREATE TABLE IF NOT EXISTS SERVERS (ID INTEGER PRIMARY KEY AUTOINCREMENT, Server_Name TEXT UNIQUE);'
init_sql += 'CREATE TABLE IF NOT EXISTS ALLOWLIST_DATA (ID INTEGER PRIMARY KEY AUTOINCREMENT, Server_ID INTEGER REFERENCES SERVERS (ID) ON DELETE CASCADE, Player_ID INTEGER REFERENCES PLAYERS (ID) ON DELETE CASCADE);'

for (let i in servers) {    //服务器表写入数据
    init_sql += 'INSERT INTO SERVERS(Server_Name) SELECT\'' + i + '\' WHERE NOT EXISTS(SELECT * FROM SERVERS WHERE Server_Name = \'' + i + '\');'
}

db_exec(init_sql)

/**
 * 绑定XboxID
 * @param groupid       群号
 * @param tips          提示消息
 * @param qq            待绑定的QQ
 * @param xboxid        待绑定的XboxID
 * @return {Promise<void>}
 */
LB.PlayersDB.bindXboxID = async (groupid, tips, qq, xboxid) => {
    let select_sql = `SELECT * FROM PLAYERS WHERE QQ_ID='${qq}' or Xbox_ID='${xboxid}'`    //根据xboxid或qq查询玩家表
    let insert_sql = `INSERT INTO PLAYERS(QQ_ID,Xbox_ID) VALUES('${qq}','${xboxid}')`      //插入数据到玩家表

    await db_all(select_sql, (res) => {
        if (res[0] != undefined) {      //主表（玩家表）有记录
            if (res[0].QQ_ID != qq) {   //XboxID对应的QQ!=当前玩家QQ（即XboxID已被他人绑定）
                LB.Groups.sendMsg(groupid, allowlistEvent(tips[0], xboxid, res[0].QQ_ID))
                return
            }
            //XboxID对应的QQ=当前玩家QQ（即当前玩家已绑定过）
            LB.Groups.sendMsg(groupid, allowlistEvent(tips[1], xboxid, res[0].QQ_ID))
            return
        }
        db_run(insert_sql)
        LB.Groups.sendMsg(groupid, allowlistEvent(tips[2], qq, xboxid))
    })
}


/**
 * 添加白名单
 * @param groupid       群号
 * @param tips          提示消息（数组）
 * @param qq            待绑定的QQ
 * @param bind_servers   服务器名称
 * @return {Promise<void>}
 */
LB.PlayersDB.addAllowlist = async (groupid, tips, bind_servers, qq) => {
    let xboxid
    let sql0 = `SELECT Xbox_ID FROM PLAYERS WHERE QQ_ID='${qq}'`
    await db_all(sql0, (res) => {
        if (res[0] == undefined) {
            LB.Groups.sendMsg(groupid, allowlistEvent(tips[0], qq))   //联查无记录，未绑定
            return
        }
        xboxid = res[0].Xbox_ID
    })

    let sql1 = `SELECT P.QQ_ID, P.Xbox_ID, S.Server_Name FROM PLAYERS P,ALLOWLIST_DATA A,SERVERS S WHERE A.Player_ID = P.ID AND A.Server_ID = S.ID AND P.QQ_ID='${qq}'`
    await db_all(sql1, (res) => {
        if (res[0] == undefined) {
            let update_sql = ''

            bind_servers.forEach(i => {
                try {
                    if (!LB.WS.servers[i].isOK()) {   //连接异常（连接中断、出现错误等）
                        LB.Groups.sendMsg(groupid, allowlistEvent('server_connect_error', bind_servers, qq))
                        return
                    }
                } catch (err) { //其他异常（一般只出现在未启用的时候）
                    log.error(err)
                    return
                }
                LB.WS.servers[i].runCMD(`allowlist add "${xboxid}"`)
                update_sql += `INSERT INTO ALLOWLIST_DATA(Server_ID,Player_ID) SELECT S.ID,P.ID FROM SERVERS S INNER JOIN PLAYERS P ON S.Server_Name='${i}' AND P.QQ_ID = '${qq}';`
            })

            db_exec(update_sql)
            LB.Groups.src = groupid
            LB.Groups.sendMsg(groupid, allowlistEvent('adding_to_allowlist', qq, xboxid))  //白名单添加成功
        } else {
            LB.Groups.sendMsg(groupid, allowlistEvent(tips[1], qq, xboxid))     //已经添加过白名单了
        }
    })
}

/**
 * 查询绑定信息
 * @param groupid       群号
 * @param tips          提示消息
 * @param qq           需要查询的QQ
 * @return {Promise<void>}
 */
LB.PlayersDB.getBindInfo = async (groupid, tips, qq) => {
    let xboxid, binded = []

    let sql0 = `SELECT QQ_ID,Xbox_ID FROM PLAYERS WHERE QQ_ID='${qq}'`
    await db_all(sql0, (res) => {
        log.debug(`\n绑定信息：\n${JSON.stringify(res, null, '\t')}`)
        if (res[0] == undefined) {
            LB.Groups.sendMsg(groupid, allowlistEvent(tips, qq))   //联查无记录，未绑定
            return
        }
        xboxid = res[0].Xbox_ID
    })

    let sql1 = `SELECT P.QQ_ID, P.Xbox_ID, S.Server_Name FROM PLAYERS P,ALLOWLIST_DATA A,SERVERS S WHERE A.Player_ID = P.ID AND A.Server_ID = S.ID AND P.QQ_ID='${qq}'`
    await db_all(sql1, (res) => {
        log.debug(`\n白名单信息：\n${JSON.stringify(res, null, '\t')}`)
        if (res[0] == undefined) {
            if(xboxid == undefined) return
            binded.push("没有记录")
        } else {
            for (let i in res) {
                binded.push(res[i].Server_Name)
            }
        }


        let status = binded.toString(),
            perm = ['普通成员', '管理员'],
            n = Number(groups[groupid].admin.some((val) => val === qq))

        LB.Groups.sendMsg(groupid, allowlistEvent('get_bind_info', qq, xboxid, perm[n], status))
    })
}


/**
 * 解除绑定
 * @param groupid       群号
 * @param qq            待解绑的QQ
 * @param tips          提示消息（数组）
 * @param bind_servers
 * @return {Promise<void>}
 */
LB.PlayersDB.unbindXboxID = async (groupid, tips, bind_servers, qq) => {
    let select_sql = `SELECT P.QQ_ID, P.Xbox_ID, S.Server_Name FROM PLAYERS P LEFT JOIN ALLOWLIST_DATA A LEFT JOIN SERVERS S ON A.Player_ID = P.ID AND A.Server_ID = S.ID WHERE P.QQ_ID = '${qq}'`
    await db_all(select_sql, (res) => {
        if (res[0] == undefined) { //查询不到该玩家qq对应的xboxid
            LB.Groups.sendMsg(groupid, allowlistEvent(tips[0], qq))
            return
        }

        bind_servers.forEach(i => {
            try {
                if (!LB.WS.servers[i].isOK()) {   //连接异常（连接中断、出现错误等）
                    LB.Groups.sendMsg(groupid, allowlistEvent('server_connect_error', qq))
                    return
                }
            } catch (err) { //其他异常（一般只出现在未启用的时候）
                log.error(err)
                return
            }
            LB.WS.servers[i].runCMD(`allowlist remove "${res[0].Xbox_ID}"`)
        })

        let delete_sql = `PRAGMA foreign_keys = ON;DELETE FROM PLAYERS WHERE QQ_ID='${qq}'`
        db_exec(delete_sql)

        LB.Groups.src = groupid
        LB.Groups.sendMsg(groupid, allowlistEvent(tips[1], qq, res[0].Xbox_ID))
    })
}