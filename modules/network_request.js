const request = require('request-promise');

LB.httpget = function (url, callback) {
    let options = {
        method: 'GET',
        url: url,
        headers: {
            "content-type": "application/json",
        },
        strictSSL: false,
        rejectUnauthorized: false,
        json: true
    }

    request(options, function (err, resp, body) {
        return callback(err, resp && resp.statusCode, body)
    });
}