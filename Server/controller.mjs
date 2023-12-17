import fs from 'node:fs/promises'
import formidable from 'formidable';
import path from 'node:path';
import child_process from 'node:child_process'
import utils from './utils.mjs'
import logger from './logger.js';
const __dirname = path.resolve();
class Query {
    constructor(queryUrl) {
        const data = queryUrl.split('/');
        this.bookid = data[2];//因为第一个‘/’前面是空,第二个‘/’前面是请求类型
        this.unit = data[3];
        this.col = data[4];
        this.tab = data[5];
        this.tabindex = data[6];
    }
}
function handleRename(req) {
    return new Promise((resolve, reject) => {
        let form = new formidable.IncomingForm({ multiples: true, uploadDir: __dirname + '/temp', keepExtensions: true });
        form.parse(req, (err, fields, files) => {
            if (err) {
                logger.warn('文件解析失败');
                reject('文件解析失败……');
                
            }

            try {
                let promises = [];
                let fileSource = new Array(files.file.length);
                files.file.forEach((file, index) => {
                    const extension = file.mimetype.split('/')[1];
                    const uid = uuid(8, 16);
                    promises.push(new Promise((resolve, reject) => {
                        fs.rename(file.filepath, './temp/' + uid + '.' + extension)
                            .then(() => {
                                fileSource[index] = './temp/' + uid + '.' + extension;
                                resolve('文件重命名成功')
                            })
                            .catch(() => {
                                fs.rm(file.filepath);
                                logger.warn('文件重命名失败');
                                reject('文件重命名失败……');
                                
                            })
                    }))

                })
                Promise.all(promises)
                    .then(() => {
                        resolve(fileSource);
                    })
                    .catch(e => {
                        reject(e);
                    })
            }
            catch (err) {
                logger.warn('只上传了一个文件……');
                fs.rm(files.file.filepath);
                reject('只上传了一个文件……');
            }


        })
    })
}
function handleOcr(options) {
    return new Promise(resolve => {
        const {exec,use,fileNames,dest}=options;
        const py = child_process.spawn(exec, [use,fileNames,dest]);
        py.stderr.on('err', err => {
            logger.warn('ocr识别失败……');
            reject('ocr识别失败……');
            
        })
        py.on('close', () => {
            resolve(fileNames);
        })
    })
}
function uuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [], i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form
        var r;

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
}
function getUnit(bookid, unit) {
    return new Promise((resolve,reject)=>{
        fs.readdir(`./lib/${bookid}`)
        .then(files=>{
            let promises=[];
            files.forEach((file,index)=>{
                let re=new RegExp('^('+unit+').*(\.json)$')
                promises.push(new Promise(()=>{
                    if(file.match(re)){
                        fs.readFile(`./lib/${bookid}/${file}`,{encoding:'utf-8'})
                            .then(data=>{
                                resolve(data);
                            })
                    }
                }))
                
            })
            Promise.all(promises)
            .then(()=>{
                reject('还没有收录这个单元的答案……');
            })
        })
        .catch(err=>{
            reject('还没有收录这本书的答案……');
        })
    })
}
function getBookNames() {
    return fs.readFile('./books.json', { encoding: 'utf-8' });
}
export default {
    async handleQuery(queryUrl) {
        const instance = new Query(queryUrl)
        let res = '';
        await getUnit(instance.bookid, instance.unit)
            .then(data => { res = data; })
            .catch(err => {  });
        let jsonObj = undefined;
        try{
            jsonObj=JSON.parse(res);
        }
        catch(err){
            jsonObj=undefined;
        }
        return new Promise((resolve, reject) => {
            if (jsonObj!=undefined && jsonObj[instance.col] != undefined && jsonObj[instance.col][instance.tab] != undefined && jsonObj[instance.col][instance.tab][instance.tabindex]!=undefined) resolve(JSON.stringify(jsonObj[instance.col][instance.tab][instance.tabindex]));
            else reject('还没有收录这部分的答案……');
        });
    },
    async handleSearch(searchUrl) {
        const bookid = searchUrl.split('/')[2];
        let res = '';
        await getBookNames()
            .then(data => {
                const dataObj = JSON.parse(data);
                res = dataObj[bookid];
            });
        return new Promise((resolve) => {
            resolve(JSON.stringify(res));
        });
    },
    async handleUpload(uploadUrl, req) {
        const txtdest = __dirname+'/test.txt';
        const segs = uploadUrl.split('/');
        const bookid = segs[2];
        const unit = segs[3];
        const remark = segs[4];
        const res = await handleRename(req)
            .then(fileNames => {
                logger.info('1');
                return new Promise(resolve => {
                    resolve(fileNames);
                })
            })
            .then(fileNames => {
                logger.info('2');
                return handleOcr({
                    exec:'python3',
                    use:'./python/main.py',
                    fileNames,
                    dest:txtdest
                });
            })
            .then(fileNames => {
                logger.info('3');
                fileNames.forEach(fileName => {
                    fs.rm(fileName);
                })
                return utils.formater(txtdest, {
                    bookid,
                    unit,
                    remark
                });
            })
            .then(() => {
                logger.info('4');
                let files={};
                utils.findall('./lib',files);
                fs.writeFile('books.json', JSON.stringify(files));
                return 1;
            })
            .catch((err) => {
                logger.warn(err);
                console.log(err);
                return 0;
            })
        return res;
    }
}