let  scoreData = 0;
let urlMap = {
    "index": "https://www.xuexi.cn",
    "points": "https://pc.xuexi.cn/points/my-points.html",
    "scoreApi": "https://pc-proxy-api.xuexi.cn/delegate/score/days/listScoreProgress?sence=score&deviceType=2",
    "channelApi": "https://www.xuexi.cn/lgdata/",
    "loginUrl": "https://pc.xuexi.cn/points/login.html",
    "dailyAsk": ["https://pc.xuexi.cn/points/exam-practice.html"],
    // "weeklyAsk": ["https://pc.xuexi.cn/points/exam-weekly-list.html"],
    "paperAsk": ["https://pc.xuexi.cn/points/exam-paper-list.html"]
};
let channel = {
    "articleUrl": [
        "1jpuhp6fn73",  // 重要活动
        "19vhj0omh73",  // 重要会议
        "132gdqo7l73",  // 重要讲话
        "35il6fpn0ohq", // 学习重点
        "1ap1igfgdn2",  // 学习时评
        "slu9169f72",   // 中宣部发布
        "tuaihmuun2",   // 新文发布厅
        "1oo5atvs172",  // 文化广场
        "1eppcq11fne",  // 科技思想研究
        "152ijthp37e",  // 科技前沿
        "1jscb6pu1n2",  // 重要新闻
        "1ajhkle8l72",  // 综合新闻
    ],
    "videoUrl": [
        "2qfjjjrprmdh", // 国防军事新文
        "525pi8vcj24p", // 红色书信
        "1novbsbi47k",  // 重要活动视频专辑
        "1742g60067k",  // 学习新视界
        "1koo357ronk",  // 学习专题报道
        "1f8iooppm7l",  // 文艺广场
        "eta8vnluqmd",  // 军事科技
        "16421k8267l",  // 强军V视
        "41gt3rsjd6l8", // 绿色发展
    ]
};

// 学习开始
function startRun() {
    chrome.storage.local.get(["studyConfig", "paperTitle", "studyWindowId", "studyTabId"], function (result) {
        if (result.studyWindowId && result.studyTabId) {
            // 获取积分数据
            fetch(urlMap.scoreApi)
                .then((response) => response.json())
                .then(function (requestData) {
                    if (requestData.hasOwnProperty("code") && parseInt(requestData.code) === 200) {
                        scoreData = requestData.data;
                        // 浏览器扩展图标
                        chrome.action.setBadgeText({"text": scoreData.totalScore.toString()});
                        // 获取请求类型
                        let type;
                        type = getTypeByPoint(scoreData.taskProgress, result.studyConfig, result.paperTitle );
                        if (typeof (type) != "undefined" && type != null) {
                            (async () => {
                                const url = await getUrlByType(type);
                                if (typeof (url) != "undefined" && url != null) {
                                    chrome.tabs.sendMessage(result.studyTabId, {
                                        "type": "redirect",
                                        "url": url
                                    });
                                } else {
                                    // 定时重新执行
                                    setTimeout(startRun, Math.floor(10000 + Math.random() * 30 * 1000));
                                    // 获取页面失败
                                    noticeMessage(chrome.i18n.getMessage("extChannelApi"), chrome.i18n.getMessage("extUpdate"));
                                }
                            })();
                        } else {
                            setTimeout(stopStudy, Math.floor(5000 + Math.random() * 1000));
                        }
                    } else {
                        // 跳转登录页面
                        chrome.tabs.update(studyTabId, {
                            "active": true,
                            "url": urlMap.loginUrl + "?ref=" + urlMap.points
                        });
                    }
                })
                .catch(error => function (error) {
                    console.log(error);
                    // 定时重新执行
                    setTimeout(startRun, Math.floor(10000 + Math.random() * 30 * 1000));
                });
        }
    });

    return true;
}

// 获取url
async function getUrlByType(type) {
    let url;

    if (type == "paper") {
        url = urlMap.paperAsk;
    }  else if (type == "day") {
        url = urlMap.dailyAsk;
    } else {
        let key;
        if (type == "article") {
            key = ArrayRandom(channel.articleUrl);
        } else {
            key = ArrayRandom(channel.videoUrl);
        }
        try {
            const response = await fetch(urlMap.channelApi + key + ".json?_st=" + Math.floor(Date.now() / 6e4));
            const urlData = await response.json();


            let urlList = [];
            let urlTemp;
            let publishTime;
            for (key in urlData) {
                if (!urlData.hasOwnProperty(key)) {
                    continue;
                }
                if (urlData[key].hasOwnProperty("url")) {
                    urlTemp = urlData[key].url;
                    // 判断发布时间是否是365天之内，如果没有，判断url规则
                    if (urlData[key].hasOwnProperty("publishTime")) {
                        publishTime = new Date(urlData[key].publishTime);
                        var lastYear = new Date(new Date() - 60 * 86400000);
                        if (publishTime < lastYear) {
                            continue;
                        }
                    } else {
                        if (urlTemp.indexOf("lgpage/detail/index") === -1) {
                            continue;
                        }
                    }

                    if (urlList.indexOf(urlTemp) === -1) {
                        urlList.push(urlTemp);
                    }
                }
            }
            if (urlList.length) {
                url = ArrayRandom(urlList);
            }

        } catch (error) {
            console.log(error);
        }
    }

    return url;
}

// 1阅读文章，2试听学习，4专项答题，5每周答题，6每日答题，9登录，1002文章时长，1003视听学习时长
function getTypeByPoint(score, configs, paperTitle ) {
    let type;
    let config = configs.sort(function (a, b) {
        return a.sort - b.sort;
    });

    let task = new Array();
    task['article'] = false;
    task['video'] = false;
    task['paper'] = false;
    // task['week'] = false;
    task['day'] = false;


    for (let key in score) {
        if (!score.hasOwnProperty(key)) {
            continue;
        }
        if (task['article'] == false && (score[key].sort == 200 )) {
            if (score[key].currentScore < score[key].dayMaxScore) {
                task['article'] = true;
            }
        }
        if (task['video'] == false && score[key].sort == 300) {
            if (score[key].currentScore < score[key].dayMaxScore) {
                task['video'] = true;
            }
        }
        if (task['video'] == false && score[key].sort == 400) {
            if (score[key].currentScore < score[key].dayMaxScore) {
                task['video'] = true;
            }
        }
        if (task['paper'] == false && score[key].sort == 700) {
            if (paperTitle == 0 && score[key].currentScore <= 0) {
                task['paper'] = true;
            }
        }

        if (task['day'] == false && score[key].sort == 500) {
            if (score[key].currentScore < score[key].dayMaxScore) {
                task['day'] = true;
            }
        }
    }

    for (let i = 0; i < config.length; i++) {
        if (config[i].flag == true && task[config[i].type] == true) {
            type = config[i].type;
            break;
        }
    }
    return type;
}

// 开始学习
function startStudy() {
    
    // 获取数据，判断执行
    chrome.storage.local.get(["studyWindowId"], function (result) {
        if (!result.studyWindowId) {
                chrome.windows.create({
                "url": urlMap.points,
                "type": "popup",
                "top": 0,
                "left": 0,
                "width": 300,
                "height": 400,
            }, function (window) {
                chrome.windows.update(window.id, {state:'maximized'});
                chrome.storage.local.set({
                    "studyWindowId": window.id,
                    "studyTabId": window.tabs[window.tabs.length - 1].id,
                    "paperTitle": 0,
                }, function () {
                    // 静音处理
                    chrome.tabs.update(window.tabs[window.tabs.length - 1].id, { 
                        "muted": true 
                    });
                    // 开始学习
                    noticeMessage(chrome.i18n.getMessage("extWarning"));
                });
            });

        } else {
            // 学习中
            noticeMessage(chrome.i18n.getMessage("extWorking"));

            // 设置焦点
            chrome.windows.update(result.studyWindowId, { 
                "focused": true ,
                'updateProperties': {
                'state': 'maximized'
              }
            });
        }
    });
    return true;
}

// 停止学习，需要关闭
function stopStudy() {
    // 获取数据，判断执行
    chrome.storage.local.get(["studyWindowId"], function (result) {
        if (result.studyWindowId) {
            // 关闭窗口
            chrome.windows.remove(result.studyWindowId, function () {
                noticeMessage(chrome.i18n.getMessage("extFinish"));
            });
            // 重置参数
            chrome.storage.local.remove(["studyWindowId", "studyTabId"]);
            chrome.action.setBadgeText({ text: "" });
        }
    });
    return true;
}

// 通知消息
function noticeMessage(title, message = "") {
    chrome.notifications.create({
        "type": "basic",
        "iconUrl": "img/Pikachu-128.png",
        "title": title,
        "message": message
    }, function (notificationId) {
        setTimeout(function () {
            chrome.notifications.clear(notificationId);
        }, 3000);
    });
}


// 数据随机取一条
function ArrayRandom(array) {
    var index = Math.floor((Math.random() * array.length));
    return array[index];
}


// tab移除监听事件
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    // 获取数据，判断执行
    chrome.storage.local.get(["studyTabId"], function (result) {
        if (result.studyTabId && tabId == result.studyTabId) {
            chrome.storage.local.remove(["studyWindowId", "studyTabId"]);
            chrome.action.setBadgeText({ text: "" });
        }
    });
    return true;
});

// 窗口移除监听事件
chrome.windows.onRemoved.addListener(function (windowId) {
    chrome.storage.local.get(["studyWindowId"], function (result) {
        if (result.studyWindowId && result.studyWindowId == windowId) {
            chrome.storage.local.remove(["studyWindowId", "studyTabId"]);
            chrome.action.setBadgeText({ text: "" });
        }
    });
    return true;
});

// 后台监听事件消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    let requestType = message.type;

    switch (requestType) {
        // 检测扩展是否运行
        case "checkRunning":
            chrome.storage.local.get(["studyWindowId"], function (result) {
                let runtime = false;
                if (result.studyWindowId) {
                    runtime = true;
                }
                sendResponse({ "runtime": runtime });
            });
            break;

        // 检测是否是扩展开启状态
        case "checkAuth":
            sendResponse({ "runtime": true });
            break;

        // 开始学习
        case "startStudy":
            startStudy();
            sendResponse({ "complete": 1 });
            break;

        // 结束学习
        case "stopStudy":
            stopStudy();
            sendResponse({ "complete": 1 });
            break;

        // 开始运行
        case "startRun":
            startRun();
            sendResponse({ "complete": 1 });
            break;

        // 专项答题
        case "paperTitle":
            chrome.storage.local.set({ "paperTitle": 1 });
            startRun();
            sendResponse({ "complete": 0 });
            break;

        // 学习完成
        case "studyComplete":
            startRun();
            sendResponse({ "complete": 0 });
            break;

        // 回答错误
        // case "answerError":
        //     noticeMessage(chrome.i18n.getMessage("extAnswerError"))
        //     sendResponse({ "complete": 0 });
        //     break;
    }
    return true;
});

// 插件安装监听事件
chrome.runtime.onInstalled.addListener(() => {

    chrome.storage.local.clear();

    let studyConfig = [
        { "type": "day", "order": 1, "title": "每日答题", "time": 0, "flag": true },
        // { "type": "paper", "order": 2, "title": "专项答题", "time": 0, "flag": true },
        { "type": "article", "order": 3, "title": "文章学习", "time": 60, "flag": true },
        { "type": "video", "order": 4, "title": "视频学习", "time": 60, "flag": true }
    ];

    // 设置初始数据
    chrome.storage.local.set({
        "studyConfig": studyConfig,
        "env": "idc"
    });
});

//扩展按钮点击事件
chrome.action.onClicked.addListener(function (tab) {
    startStudy();
});