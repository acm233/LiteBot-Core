const language = LB.conf.readFrom('./config/global_config.yml')['language']
const cfg = LB.conf.readFrom(`./config/language/${language}.json`)

String.prototype.format = function () { //文本格式化
    if (arguments.length === 0) return this;
    let param = arguments[0],
        str = this;
    if (typeof (param) === 'object') {
        for (let key in param)
            str = str.replace(new RegExp("\\{" + key + "\\}", "g"), param[key]);
        return str;
    } else {
        for (let i = 0; i < arguments.length; i++)
            str = str.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
        return str;
    }
}

class lang_helper {
    allowlistEvent(e, ...args) {
        if (e == "xboxid_already_binded_by_others") {
            return cfg[e].format({
                xboxid: args[0],
                others_qqid: args[1]
            })
        } else if (e == "get_bind_info") {
            return cfg[e].format({
                member_qqid: args[0],
                xboxid: args[1],
                permission: args[2],
                bind_status: args[3]
            })
        } else {
            return cfg[e].format({
                member_qqid: args[0],
                xboxid: args[1]
            })
        }
    }

    runcmdEvent(e, ...args) {
        if (e == "get_online_players") {
            return cfg[e].format({
                online: args[0],
                max_online: args[1],
                players: args[2]
            })
        } else {
            return cfg[e]
        }
    }

    gameEvent(e, ...args) {
        if (e == "runcmd_feedback") {
            return cfg[e].format({
                server_name: args[0],
                result: args[1]
            })
        } else {
            return cfg[e].format({
                player: args[0],
                server_name: args[1],
                content: args[2]
            })
        }
    }

    groupEvent(e, ...args) {
        if (e == "chat_to_server") {
            return cfg[e].format({
                group_name: args[0],
                group_sender: args[1],
                content: args[2]
            })
        } else {
            return cfg[e]
        }
    }
}

module.exports = new lang_helper()