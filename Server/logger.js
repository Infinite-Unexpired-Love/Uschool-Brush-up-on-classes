const path = require('path');
const log4js = require('log4js');

const layout = {
    type: 'pattern',
    pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] %m'
};
// 配置log4js
log4js.configure({
    appenders: {
        // 日志文件
        file: { type: 'file', filename: path.join(__dirname, './log/server.log'),layout,pattern: '.yyyy-MM-dd'}
    },
    categories: {
        // 默认日志
        default: { appenders: [ 'file'], level: 'debug' },
    }
});

// 获取默认日志
const logger = log4js.getLogger();

module.exports = logger;