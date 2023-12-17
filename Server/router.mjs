import controller from './controller.mjs';
import fs from 'node:fs'
import utils from './utils.mjs';
import logger from './logger.js'
import RequestIp from '@supercharge/request-ip'
class resObj {
    constructor(stat, data, err) {
        this.status = stat;
        this.data = data;
        this.err = err;
    }
}
const ALLOW_ORIGIN = [//域名白名单
    'localhost:8080',
    'https:\/\/ucontent.unipus.cn'
]
export default {
    start(server) {
        server.on('request', (req, res) => {
            const origin = req.headers.origin;
            const ip=RequestIp.getClientIp(req);
            logger.info('------------------------');
            logger.info(`Request from ${ip}`);
            if (utils.isOriginAllowed(origin, ALLOW_ORIGIN)) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }
            const pathname = decodeURI(req.url);
            const method = req.method;
            if (method == 'OPTIONS') {
                res.setHeader('Access-Control-Allow-Methods', 'GET,POST');
                res.end('');
                return
            }
            logger.info(`Request source ${pathname}`);
            const reg1 = /^\/search/;
            const reg2 = /^\/upload/;
            if (pathname.match(/.jpg/)) {
                fs.readFile('.' + pathname, (err, data) => {
                    if (err) {
                        res.end('');
                    }
                    else {
                        res.setHeader('Content-Type', 'image/jpeg');
                        res.end(data);
                    }
                })
            }
            else if (reg1.test(pathname)) {
                logger.info('Request type: search');
                controller.handleSearch(pathname)
                    .then(data => {
                        res.end(data);
                    })
            }
            else if (reg2.test(pathname)) {
                logger.info('Request type: upload');
                controller.handleUpload(pathname, req)
                    .then((num) => {
                        if (num == 0) {
                            res.end(JSON.stringify(new resObj(400, '', '上传失败')));
                        }
                        if (num == 1) {
                            res.end(JSON.stringify(new resObj(200, '上传成功', '')));
                        }

                    })
            }
            else if (pathname=='/favicon.ico'){
                res.end('');
            }
            else {
                logger.info('Request type: query');
                controller.handleQuery(pathname)
                    .then(data => {
                        res.end(data);
                    })
                    .catch(err => {
                        logger.warn('Error when query',err);
                        res.end(err);
                    })
            }
        })
    }
}