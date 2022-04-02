const fs = require('fs')
function copy(src, dst) {
    let paths = fs.readdirSync(src); //同步读取当前目录
    paths.forEach(function (path) {
        let _src = src + '/' + path,
            _dst = dst + '/' + path
        fs.stat(_src, function (err, stats) {
            if (err) throw err;
            if (stats.isFile()) { //是文件则拷贝
                let readable = fs.createReadStream(_src),   //创建读取流
                    writable = fs.createWriteStream(_dst)   //创建写入流
                readable.pipe(writable)
            } else if (stats.isDirectory()) { //是目录则递归
                checkConf(_src, _dst, copy)
            }
        });
    });
}

function checkConf(src, dst, callback) {
    fs.access(dst, fs.constants.F_OK, (err) => {
        if (err) {
            fs.mkdirSync(dst);
            callback(src, dst);
        } else {
            callback(src, dst);
        }
    })
}

LB.CFG = checkConf('./examples', './config', copy)