const log = new LB.log("PluginLoader");
const fs = require("fs");
const LoaderDir = "./plugins";
const path = require('path');

LB.PluginMgr = { Load };

function Load(patha) {
    let P = path.join(path.dirname(path.dirname(__dirname)), patha);
    if (!LB.fs.isExists(P)){
        log.error(`未能找到文件<${P}>!`);
        return false;
    }
    try {
        require(P);
    } catch (e) {
        log.error(`在运行 <${P}> 时遇到错误:`);
        log.error(e.stack);
        return false;
    }
    return true;
}


function load() {
    let dir = fs.readdirSync(LoaderDir, { "encoding": "utf8" }), count = 0;
    dir.forEach((val, i) => {
        if (path.extname(val).toLowerCase() != ".js") { return; }
        let fullPath = `${LoaderDir}\/${val}`;
        if (Load(fullPath)) {
            log.info(`插件 <${fullPath}> 加载成功!`);
            count++;
        } else { log.error(`插件 <${fullPath}> 加载失败!`); }
    });
    log.info(`已成功加载 <${count}> 个插件`);
}
load();
