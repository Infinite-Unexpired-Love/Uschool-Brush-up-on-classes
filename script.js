// ==UserScript==
// @name         U校园挂机喵
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      2.0.0
// @description  save your time
// @author       初雪小白
// @match        https://u.unipus.cn/user/student/mycourse/*
// @match        https://ucontent.unipus.cn/_pc_default/*/*/courseware/*/*/*/*
// @match        https://ucontent.unipus.cn/_pc_default/*/*/courseware/*/*/*/*/*
// @require      https://cdn.staticfile.org/jquery/3.1.1/jquery.min.js
// @resource     customCSS https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css
// @require      https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        unsafeWindow

// ==/UserScript==

//全局变量部分Start
let interval = 300000;//单位ms，在一个页面逗留的时间 √
let autosolve = false;//是否自动答题 
let review = true;//是否复习模式
let unit = 1;//选择复习的单元  √
let loop = true;//是否循环复习 √
let autosubmit = false;//是否自动提交
let waiting = 5000;//单位ms，网速越慢值应越大，以免数据加载不出来 √
let time_control = 120;//单位min，刷的时间 √
let bookid = null;//书名代码，课程目录路径中的courseid
let curSec = 0;//栏目下的分区序号
let configContent = `
<!-- Button trigger modal -->
<button type="button" class="btn btn-primary btn-lg" data-toggle="modal" data-target="#configBoard" id="config">
  打开设置
</button>

<!-- Modal -->
        <div class="modal fade" id="configBoard" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
                                aria-hidden="true">&times;</span></button>
                        <h2 class="modal-title" id="myModalLabel">U校园挂机喵——Powered by 初雪小白</h2>
                    </div>
                    <div class="modal-body">
                        <ul id="myTabs" class="nav nav-tabs" role="tablist">
                            <li role="presentation" class="active"><a href="#home" id="home-tab" role="tab" data-toggle="tab"
                                    aria-controls="home" aria-expanded="false">
                                    <font style="vertical-align: inherit;">
                                        <font style="vertical-align: inherit;">设置面板</font>
                                    </font>
                                </a></li>
                            <li role="presentation" class=""><a href="#profile" role="tab" id="profile-tab" data-toggle="tab"
                                    aria-controls="profile" aria-expanded="true">
                                    <font style="vertical-align: inherit;">
                                        <font style="vertical-align: inherit;">日志</font>
                                    </font>
                                </a></li>
                                <li role="presentation" class=""><a href="#reward" role="tab" id="reward-tab" data-toggle="tab"
                                    aria-controls="reward" aria-expanded="false">
                                    <font style="vertical-align: inherit;">
                                        <font style="vertical-align: inherit;">加个鸡腿</font>
                                    </font>
                                </a></li>
                        </ul>
                        <div id="myTabContent" class="tab-content">
                            <div role="tabpanel" class="tab-pane fade active in" id="home" aria-labelledby="home-tab">
                                <div class="portion">
                                    <ul class="clearfix">
                                        <li><input type="checkbox">
                                            <h3 class="h3">自动答题</h3>
                                        </li>
                                        <li><input type="checkbox" checked="checked">
                                            <h3 class="h3">复习模式</h3>
                                        </li>
                                        <li><input type="checkbox">
                                            <h3 class="h3">自动提交</h3>
                                        </li>
                                        <li><input type="checkbox" checked="checked">
                                            <h3 class="h3">循环复习</h3>
                                        </li>
                                    </ul>
                                </div>
                                <div class="portion">
                                    <ol class="ol">
                                        <li>
                                            <h3 class="h3">页面停留时间</h3><input type="number" value="5">
                                            <h3 class="h3">min(在内容页设置，目录页设置无效,最少为3)</h3>
                                        </li>
                                        <li>
                                            <h3 class="h3">页面渲染时间</h3><input type="number" value="5">
                                            <h3 class="h3">s(推荐>=5，在内容页设置，目录页设置无效)</h3>
                                        </li>
                                        <li>
                                            <h3 class="h3">开始章节</h3><input type="number" value="2">
                                            <h3 class="h3">(在课程目录页就不想动了需要填写此项，15s后直接跳转，在目录页设置)</h3>
                                        </li>
                                        <li>
                                            <h3 class="h3">刷多久</h3><input type="number" value="120">
                                            <h3 class="h3">min(在内容页设置,到达设定的时间后，再过30s跳转到脚本首页)</h3>
                                            <button class="resetTimeControl">重置</button>
                                        </li>
                                        <li>
                                            <h3 class="h3">没有答案？<a href="https://www.firstsnowlittlewhite.love" target="_blank">立即上传，成为Contributor!</a></h3>
                                        </li>
                                        <li>
                                            <h3 class="h3">建议使用答题功能前先<a href="https://www.firstsnowlittlewhite.love" target="_blank">查看</a>有无收录答案</h3>
                                        </li>
                                    </ol>
                                </div>
                            </div>
                            <div role="tabpanel" class="tab-pane fade" id="profile" aria-labelledby="profile-tab">
                                <h4>查看原数据、报错信息——————</h4>
                                <div class="log-container"></div>
                            </div>
                            <div role="tabpanel" class="tab-pane fade" id="reward" aria-labelledby="reward-tab">
                                <h5>你的鼓励是作者继续更新、维护脚本的动力，同时也是为服务器的正常运行出一份力！</h5>
                                <ul class="imgs">
                                    <li><img src="" alt="" crossorigin="anonymous"></li>
                                    <li><img src="" alt="" crossorigin="anonymous"></li>
                                </ul>
                            </div>
                        </div>
                        
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
                        <button type="button" class="btn btn-primary save">保存</button>
                    </div>
                </div>
            </div>
        </div>`;
let newCSS = GM_getResourceText("customCSS");//加载外部CSS，资源已在上方resource中
let myCSS = document.createElement("style");//自定义CSS
myCSS.innerHTML =
    `
        #config {position: fixed;left: 0;top: 100px;z-index: 999;}
        .portion {
            height: auto;
            margin: 10px 0;
        }
        .h3 {
            display: inline-block;
            font-size: 14px;
            margin: 0!important;
        }
        .portion ul,ol {
            list-style: none;
            line-height: 20px!important;
            margin-bottom: 0!important;
            padding-left: 0;
        }
        .portion ul,ol li {
            margin: 10px 10px;
        }
        .portion ul li {
            float: left;
        }
        .clearfix:before,.clearfix:after {
            content:"";
            display:table;
        }
        .clearfix:after {
            clear:both;
            overflow:hidden;
        }
        .clearfix {
            zoom:1; /* for ie6 & ie7 */
        }
        .clear {
            clear:both;
            display:block;
            font-size:0;
            height:0;
            line-height:0;
            overflow:hidden;
        }
        .log-container {
            height: 400px;
            overflow-y: scroll;
        }
        .imgs {
            width: 100%;
            margin-top: 40px;
            list-style: none;
            display: flex;
            justify-content: space-between;
            padding: 0;
        }

        .imgs li {
            width: 40%;
            margin: 0 20px;
        }
        .imgs li img {
            width: 100%;
        }
        h4,h5 {
            padding-top: 10px;
        }
        h5 {
            text-align:center;
        }
        .ol li input {
            width: 50px;
        }
        .log-container p {
            font-size:12px;
            min-height:16px;
            line-height:16px;
        }
    `
//----------------------------
$(function () {//dom加载完毕
    GM_addStyle(newCSS);
    $("head").append(myCSS);
    //$("head").append('<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">');
    AddHtml(configContent);
    $("window").ready(function () {//所有文件加载完毕
        let imgs = $('#reward').find('img');
        imgs.each((i, e) => {
            let sourceUrl = '';
            switch (i) {
                case 0:
                    sourceUrl = 'UschoolScriptImg0';
                    break
                case 1:
                    sourceUrl = 'UschoolScriptImg1';
                    break
                default: break
            }
            let imgdata = localStorage.getItem(sourceUrl);
            if (imgdata) {
                e.setAttribute('src', imgdata);
            }
            else {
                e.addEventListener('load', function () {
                    let canvas = document.createElement('canvas');
                    let ctx = canvas.getContext("2d");
                    canvas.width = e.width;
                    canvas.height = e.height;
                    ctx.drawImage(e, 0, 0);
                    const dataUrl = canvas.toDataURL();
                    localStorage.setItem(sourceUrl, dataUrl);
                })
                let url = '';
                if (i)
                    url = "https://server.firstsnowlittlewhite.love:9000/img/weixinpay.jpg";
                else
                    url = "https://server.firstsnowlittlewhite.love:9000/img/alipay.jpg";
                e.setAttribute('src', url);
            }
        })
        if (localStorage.getItem('configContent')) {
            configs = JSON.parse(localStorage.getItem('configContent'));
            autosolve = configs[0];//是否自动答题 
            review = configs[1];//是否复习模式
            autosubmit = configs[2];//是否自动提交
            loop = configs[3];//是否循环复习 
            const tf = [autosolve, review, autosubmit, loop];
            interval = configs[4];//单位ms，在一个页面逗留的时间
            waiting = configs[5];//单位ms，网速越慢值应越大，以免数据加载不出来
            unit = configs[6];//选择复习的单元                       
            time_control = configs[7];
            const vals = [interval, waiting, unit, time_control];
            $('.modal').find('.modal-body').find('.portion').find('ul').find('input').each(function (i, e) {
                $(e).prop('checked', tf[i]);
            })
            $('.modal').find('.modal-body').find('.portion').find('ol').find('input').each(function (i, e) {
                switch (i) {
                    case 0: $(e).val((vals[0] / 60) / 1000);
                        break;
                    case 1: $(e).val(vals[1] / 1000);
                        break;
                    case 2: $(e).val(vals[2] + 1);
                }
            })
        }
        writeLog('timecontrol is ', '', time_control);
        $('.resetTimeControl').click(function () {
            localStorage.setItem('time_controls', "[0]");
        })
        $('.save').click(function () {
            let map = [];
            $('.modal').find('.modal-body').find('.portion').find('ul').find('input').each(function (i, e) {
                switch (i) {
                    case 3: if ($(e).prop('checked'))
                        map[1] = true;
                    default: map.push($(e).prop('checked'));
                }
            })
            $('.modal').find('.modal-body').find('.portion').find('ol').find('input').each(function (i, e) {
                switch (i) {
                    case 0: if ($(e).val() == null) {
                        map.push(5 * 60 * 1000);
                    } else {
                        let val = Math.floor($(e).val());
                        if (val <= 3)
                            map.push(3 * 60 * 1000);
                        else
                            map.push(val * 60 * 1000);
                    }
                        break;
                    case 1: if ($(e).val() == null) {
                        map.push(15 * 1000);
                    } else {
                        let val = Math.floor($(e).val());
                        if (val <= 3)
                            map.push(5 * 1000);
                        else
                            map.push(val * 1000);
                    }
                        break;
                    case 2: if ($(e).val() == null) {
                        map.push(0);
                    } else {
                        let val = Math.floor($(e).val());
                        if (val <= 0)
                            map.push(0);
                        else
                            map.push(val - 1);
                    }
                        break;
                    case 3: if ($(e).val() == null) {
                        map.push(5);
                    } else {
                        let val = Math.floor($(e).val());
                        if (val <= 0)
                            map.push(5);
                        else
                            map.push(val);
                    }
                        break;
                }
            })
            localStorage.setItem('configContent', JSON.stringify(map));
            if (localStorage.getItem('time_controls')) {
                let time_controls = JSON.parse(localStorage.getItem('time_controls'));
                time_controls.push(0);
                localStorage.setItem('time_controls', JSON.stringify(time_controls));
            }
            else {
                let time_controls = [0];
                localStorage.setItem('time_controls', JSON.stringify(time_controls));
            }
            location.reload();
        })
        let href = location.href;
        if (href.match('courseCatalog') !== null) {//总目录页
            setTimeout(function () {
                let uls = [];
                $('ul').each(function (i, e) {
                    if (e.className === '') {
                        uls.push(e);
                    }
                })
                if (review) {
                    $(uls[unit]).children('.group').eq(1).click();//setting the scene页面有点小问题
                }
                else {

                }
            }, 15000)//等待一段时间后执行，以便用户选择是否在当前页开始并获得异步加载后的页面数据
        }
        else {
            if (localStorage.getItem("time_controls")) {
                let time_controls = JSON.parse(localStorage.getItem("time_controls"));
                let latest = time_controls[time_controls.length - 1];
                if (latest >= time_control) {
                    setTimeout(function () {
                        location.href = "https://scriptcat.org/script-show-page/901";
                    }, 30000);
                }
            }
            let right_lis = [];
            let active_index = 0;
            let top_lis = null;
            let active_one = null;
            if (localStorage.getItem('bookid')) {
                bookid = localStorage.getItem('bookid');
            }
            else {
                const bookinfo = href.split('/')[4];
                bookid = bookinfo.split('&')[0].split('=')[1];
                localStorage.setItem('bookid', bookid);
            }
            setTimeout(function () {
                console.log('out begin!');
                top_lis = $('.headerbar').children('.TabsBox').children();
                $('#layoutTheme').children('#sidemenuContainer').find('.menuRightTabContent').find('li').each(function (i, e) {
                    if (!e.classList.contains('disabled') && e.classList.contains('group')) {
                        right_lis.push(e);
                    }
                })
                active_index = getIndexOf(right_lis, 'active');
                active_one = getIndexOf(top_lis, 'active');
                //writeData($('.questions')[0]);
                console.log(active_one);
                console.log(right_lis);
                console.log(top_lis);
            }, waiting);//等待页面渲染
            setTimeout(function () {
                const http = new axios();
                const curCol = $(right_lis[active_index]).find('a')[0].innerHTML.substring(0, 3);
                const curUnit = curCol[0];
                const curTab = top_lis[active_one].querySelector('a').innerHTML.substr(0, 3);
                const hrefs = location.href.split('/');
                curSec = 0;
                http.get(`https://server.firstsnowlittlewhite.love:9000/query/b${bookid}/u${curUnit}/${curCol}/${curTab}/${curSec}`)
                    .then(data => {
                        writeLog(data);
                        if (data[0] == '[' || data[0] == '{') {
                            const parseData = handleData(JSON.parse(data));
                            const node = $('#pageLayout')[0];
                            console.log(node);
                            if (autosolve) writeData(node, parseData);
                        }

                    })
                    .catch(err => writeLog(err));
            }, waiting + 2000);
            let timer = setInterval(function () {
                console.log('interval begin!');
                const btnList = $('button');
                const node = $('.questions')[0] || $("[class^='sequence-pc--sequence-container-']")[0];
                console.log(node);
                if (localStorage.getItem("time_controls")) {//达到设置的时间
                    let time_controls = JSON.parse(localStorage.getItem("time_controls"));
                    time_controls[time_controls.length - 1] += interval / 60000;
                    localStorage.setItem("time_controls", JSON.stringify(time_controls));
                    let latest = time_controls[time_controls.length - 1];
                    if (latest >= time_control) {
                        setTimeout(function () {
                            location.href = "https://scriptcat.org/script-show-page/901";
                        }, 30000);
                    }
                }
                else {
                    let time_controls = [];
                    time_controls.push(interval / 60000);
                    localStorage.setItem("time_controls", JSON.stringify(time_controls));
                }
                if (findSubmit(btnList)) {//有下一题按钮
                    const subbtn = findSubmit(btnList);
                    subbtn.click();
                    if (node)//有问题才需要增加
                        curSec++;
                }
                else {
                    if ($('.headerbar').children('.TabsBox').children().length === 1) {//没有别的tab
                        right_lis[active_index + 1].click();
                        curSec = 0;
                    }
                    else {
                        if (active_one === top_lis.length - 1) {//到达了最后一个tab
                            if (active_index === right_lis.length - 1) {//到达了最后一个col
                                if (loop) {
                                    $('#header').find('.layoutHeaderStyle--breadCrumbBox-rFgzd').children('ul').children().eq(0).children('a')[0].click();//返回课程目录
                                }
                                else
                                    clearInterval(timer);//停留在最后一个col
                            }
                            else {
                                right_lis[active_index + 1].click();//进入下一个col
                                curSec = 0;
                            }

                        }
                        else {
                            top_lis[active_one + 1].click();//进入下一个tab
                            curSec = 0;
                        }
                    }
                }
                setTimeout(function () {
                    top_lis = $('.headerbar').children('.TabsBox').children();
                    active_index = getIndexOf(right_lis, 'active');
                    active_one = getIndexOf(top_lis, 'active');
                }, waiting);//等待页面渲染
                setTimeout(function () {
                    const http = new axios();
                    const curCol = $(right_lis[active_index]).find('a')[0].innerHTML.substring(0, 3);
                    const curUnit = curCol[0];
                    const curTab = top_lis[active_one].querySelector('a').innerHTML.substr(0, 3);
                    const hrefs = location.href.split('/');
                    http.get(`https://server.firstsnowlittlewhite.love:9000/query/b${bookid}/u${curUnit}/${curCol}/${curTab}/${curSec}`)
                        .then(data => {
                            writeLog(data);
                            if (data[0] == '[' || data[0] == '{') {
                                const parseData = handleData(JSON.parse(data));
                                const node = $('#pageLayout')[0];
                                console.log(node);
                                if (autosolve) writeData(node, parseData);
                            }
                        })
                        .catch(err => writeLog(err));
                }, 20000)

            }, interval);//页面停留时间
        }
    })


})
//全局函数定义Start
function AddHtml(html) {
    document.body.insertAdjacentHTML('afterBegin', html);
}
function getIndexOf(list, classname) {
    let index = -1;
    $.each(list, function (i, e) {
        if (e.classList.contains(classname))
            index = i;
    })
    return index;
}
function findSubmit(btnList) {
    let btn = undefined;
    $.each(btnList, function (i, e) {
        if (e.classList.contains('submit-bar-pc--btn-1_Xvo')) {
            if (e.innerHTML == '下一题')
                btn = e;
        }
    })
    return btn;
}
function handleData(data) {
    // let product = [];
    // if (!isNaN(Number(data[0][0]))) {//data为列表格式
    //     data.forEach((e, index) => {
    //         const e1 = e.match(/[a-zA-Z].*/);//返回的是一个对象

    //         const e2 = e1[0].replace(/(reference)/i, '');
    //         if (!isNaN(e[0]))//是每一项的第一句
    //             product.push(e2);
    //         else {
    //             let line = product[product.length - 1];
    //             product[product.length - 1] = line + ' ' + e2;
    //         }
    //     })
    // }
    // else {//data里面只有一句话
    //     product.push(data.join(' '));
    // }
    // return product;
    let product = [];
    if (data[0].match(/^(\s*reference)/i)) {
        if (!isNaN(Number(data[1][0]))) {//data为列表格式
            data.forEach((e, index) => {
                e=e.replace(':','');
                if (index == 0)
                    return;
                const e1 = e.match(/[a-zA-Z].*/);//返回的是一个对象

                const e2 = e1[0].replace(/(reference)/i, '');
                if (!isNaN(e[0]))//是每一项的第一句
                    product.push(e2);
                else {
                    let line = product[product.length - 1];
                    product[product.length - 1] = line + ' ' + e2;
                }
            })
        }
        else {//data为一句话
            product.push(data.join(' '));
        }
    }
    else {
        if (!isNaN(Number(data[0][0]))) {//data为列表格式
            data.forEach((e, index) => {
                e=e.replace(':','');
                const e1 = e.match(/[a-zA-Z].*/);//返回的是一个对象

                const e2 = e1[0].replace(/(reference)/i, '');
                if (!isNaN(e[0]))//是每一项的第一句
                    product.push(e2);
                else {
                    let line = product[product.length - 1];
                    product[product.length - 1] = line + ' ' + e2;
                }
            })
        }
        else {//data里面是选项
            let line = data.join(' ');
            line = line.toUpperCase();
            line = line.replace(/(CC)/g, 'C');//将ocr无法区分的C和c统一转化为C
            let reg = new RegExp(/[A-Z]/);
            for (let ch of line) {
                if (reg.test(ch))
                    product.push(ch);
            }
        }
    }
    return product;
}
function writeData(elementNode, data) {
    const inps = $(elementNode).find('input[type="text"]');
    const textareas = $(elementNode).find('textarea');
    const radios = $(elementNode).find("[class^='single-choice--options']");
    if (inps.length) {
        inps.each(function (index) {
            setTimeout(() => {
                $(this)[0].value = data[index];
                let event = new Event('input', { bubbles: true });
                event.simulated = true;
                $(this)[0].dispatchEvent(event);
                setTimeout(() => {
                    $(this)[0].focus();
                }, 200);
                setTimeout(() => {
                    $(this)[0].blur();
                }, 3000);
                writeLog('已填写答案……');
            }, 5000 * index);
        })
    }
    if (radios.length) {
        radios.each(function (index) {
            //处理选项数据
            setTimeout(() => {
                const input_radios = $(this).find('input[type="radio"]');
                switch (data[index]) {
                    case 'A': input_radios[0].click();
                        break;
                    case 'B': input_radios[1].click();
                        break;
                    case 'C': input_radios[2].click();
                        break;
                    case 'D': input_radios[3].click();
                        break;
                    default: break;
                }
                writeLog('已填写答案……');
            }, 5000 * index)
        })
    }
    else {
        textareas.each(function (index) {
            console.log(data);
            setTimeout(() => {
                $(this)[0].value = data[index];
                let event = new Event('input', { bubbles: true });
                event.simulated = true;
                $(this)[0].dispatchEvent(event);
                setTimeout(() => {
                    $(this)[0].focus();
                }, 200);
                setTimeout(() => {
                    $(this)[0].blur();
                }, 3000);
                writeLog('已填写答案……');
            }, 5000 * index);
        })
    }
}
function writeLog(data, spliter = '', ...args) {
    const date = new Date();
    let p = document.createElement('p');
    let argsstr = '';
    if (args) {
        args.forEach(arg => {
            argsstr += (spliter + arg);
        })
    }
    p.innerHTML = `[${date.toLocaleString()}]    ` + data + argsstr;
    $('.log-container').append(p);
}
class axios {
    constructor(timeout = 10000) {
        this.xml = new XMLHttpRequest();
        this.timeout = timeout;
    }
    get(Url) {
        let data = '';
        this.xml.addEventListener('readystatechange', () => {
            if (this.xml.readyState == 4)
                data = this.xml.responseText;
        })
        this.xml.open('get', Url);
        this.xml.send();
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                reject(`Bad connection`)
            }, this.timeout);
            setInterval(() => {
                if (this.xml.readyState == 4)
                    resolve(data);
            }, 100);
        })
    }
}
//-------------------------------------
