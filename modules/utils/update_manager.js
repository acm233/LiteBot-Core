const fs = require('fs')

const _ver = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))['version'],
    _year = new Date().getFullYear(),
    logo = fs.readFileSync('./modules/logo.txt','utf-8')

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

console.log(logo.format({
    _version:_ver,
    _copyright_year:_year
}))