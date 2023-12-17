import http from 'node:http';
import router from './router.mjs';
import logger from './logger.js'
const server = http.createServer();
try {
    server.listen(8000, () => {
        console.log('服务器启动成功！');
        logger.info(`服务器成功启动，请访问8000端口！`);
    })
    router.start(server);
} catch (err) {
    console.log('err');
}