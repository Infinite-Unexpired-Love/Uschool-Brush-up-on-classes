import fs from 'node:fs';
import readline from 'node:readline';
export default {
    /*
    *destInfo{
    * bookid:b\d+,
    * unit:u\d+  
    * remark:[.\s]*
    *}
    */
    formater(source, destInfo) {
        return new Promise((resolve, reject) => {
            const rl = readline.createInterface({
                input: fs.createReadStream(source),
                crlfDelay: Infinity,
            });

            let ls = {};
            let index = -1;
            let colName = '';
            let secName = '';
            let seq = 0;
            rl.on('line', (line) => {
                line = line.trim();
                if (line.match(/^(\d-\d).*\w$/)) {
                    colName = line.substring(0, 3);
                    ls[colName] = {};
                    index = -1;
                    return
                }
                if (line.match(/(^[A-Z][a-z]{2}.*(\d|i)$)|(Sharing your ideas)/)) {
                    secName = line.substring(0, 3);
                    if (!ls[colName][secName]) {
                        ls[colName][secName] = [[]];
                        seq = 0;
                    }
                    else {
                        ls[colName][secName].push([]);
                        seq++;
                    }
                    ++index;
                    return
                }
                try {
                    ls[colName][secName][seq].push(line);
                }
                catch (err) {
                    reject('文档格式化失败……');
                    rl.removeAllListeners();
                    rl.close();
                }
            });
            rl.on('close', () => {
                const jsonString = JSON.stringify(ls);
                let files = fs.readdirSync(`./lib/${destInfo.bookid}`);
                let toRemove = '';
                files.forEach(file => {
                    if (file.match(destInfo.unit))
                        toRemove = file;
                })
                if (toRemove) {
                    toRemove = `./lib/${destInfo.bookid}/` + toRemove;
                    fs.rmSync(toRemove);
                }
                fs.writeFile(`./lib/${destInfo.bookid}/${destInfo.unit}.${destInfo.remark}.json`, jsonString, () => {
                    resolve(1);
                });
            })
        })
    },
    findall(directary, files) {
        const data = fs.readdirSync(directary);
        data.forEach((val, index) => {
            val = directary + '/' + val;
            const res = fs.statSync(val);
            if (res.isDirectory())
                this.findall(val, files);
            else {
                const segs = val.split('/');
                const bookName = segs[2];
                const unit = segs[3];
                if (!files[bookName])
                    files[bookName] = [];
                files[bookName].push(unit.substring(0, unit.length - 5));
            }

        })
    },
    isOriginAllowed(origin, allowedOrigin) {
        if (Array.isArray(allowedOrigin)) {
            for (let i = 0; i < allowedOrigin.length; i++) {
                if (this.isOriginAllowed(origin, allowedOrigin[i])) {
                    return true;
                }
            }
            return false;
        }
        else {
            const reg = new RegExp(allowedOrigin);
            return reg.test(origin);
        }
    }
}


