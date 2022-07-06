let scoreTabId = 0, runningTabId = 0, scoreWindowId = 0, runningWindowId = 0, channelUrls = {}, userId = 0,
    usedUrls = {}, chooseLogin = 0, weeklyTitle = 0, paperTitle = 0;
let windowWidth = 350 ;
let windowHeight = 350 ;
let chromeVersion = (/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [0, 0])[1];
let firefoxVersion = (/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [0, 0])[1];
let isMobile = !!(/Mobile/.exec(navigator.userAgent));
let urlMap = {
    "index": "https://www.xuexi.cn",
    "points": "https://pc.xuexi.cn/points/login.html?ref=https%3A%2F%2Fpc.xuexi.cn%2Fpoints%2Fmy-points.html",
    "scoreApi": "https://pc-proxy-api.xuexi.cn/api/score/days/listScoreProgress?sence=score&deviceType=2",
    "channelApi": "https://www.xuexi.cn/lgdata/",
    "dailyAsk": ["https://pc.xuexi.cn/points/exam-practice.html"],
    // "weeklyAsk": ["https://pc.xuexi.cn/points/exam-weekly-list.html"],
    "paperAsk": ["https://pc.xuexi.cn/points/exam-paper-list.html"]
};
let channel = {
    'article': [
        "35il6fpn0ohq|https://www.xuexi.cn/98d5ae483720f701144e4dabf99a4a34/5957f69bffab66811b99940516ec8784.html",
        "1ap1igfgdn2|https://www.xuexi.cn/d05cad69216e688d304bb91ef3aac4c6/9a3668c13f6e303932b5e0e100fc248b.html",
        "slu9169f72|https://www.xuexi.cn/105c2fa2843fa9e6d17440e172115c92/9a3668c13f6e303932b5e0e100fc248b.html",
        "tuaihmuun2|https://www.xuexi.cn/bab787a637b47d3e51166f6a0daeafdb/9a3668c13f6e303932b5e0e100fc248b.html",
        "1oo5atvs172|https://www.xuexi.cn/00f20f4ab7d63a1c259fff55be963558/9a3668c13f6e303932b5e0e100fc248b.html",
        "1gohlpfidnc|https://www.xuexi.cn/4954c7f51c37ef08e9fdf58434a8c1e2/5afa2289c8a14feb189920231dadc643.html",
        "1eppcq11fne|https://www.xuexi.cn/0db3aecacaed782aaab2da53498360ad/5957f69bffab66811b99940516ec8784.html",
        "152ijthp37e|https://www.xuexi.cn/f64099d849c46d8b64b25e3313e1b172/5957f69bffab66811b99940516ec8784.html",
    ],
    'video': [
        "2qfjjjrprmdh|https://www.xuexi.cn/4426aa87b0b64ac671c96379a3a8bd26/db086044562a57b441c24f2af1c8e101.html#1oajo2vt47l-5",
        "3m1erqf28h0r|https://www.xuexi.cn/4426aa87b0b64ac671c96379a3a8bd26/db086044562a57b441c24f2af1c8e101.html#1oajo2vt47l-5",
        "525pi8vcj24p|https://www.xuexi.cn/4426aa87b0b64ac671c96379a3a8bd26/db086044562a57b441c24f2af1c8e101.html#1oajo2vt47l-5",
        "48cdilh72vp4|https://www.xuexi.cn/4426aa87b0b64ac671c96379a3a8bd26/db086044562a57b441c24f2af1c8e101.html#1oajo2vt47l-5",
        "1novbsbi47k|https://www.xuexi.cn/a191dbc3067d516c3e2e17e2e08953d6/b87d700beee2c44826a9202c75d18c85.html",
        "1742g60067k|https://www.xuexi.cn/0b99b2eb0a13e4501cbaf82a5c37a853/b87d700beee2c44826a9202c75d18c85.html",
    ]
};

//检查用户积分数据
function getPointsData(callback) {
    if (scoreTabId) {
        try {
            
        
        let xhr = new XMLHttpRequest();
        xhr.open("GET", urlMap.scoreApi);
        xhr.setRequestHeader("Pragma", "no-cache");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                let res = JSON.parse(xhr.responseText);
                if (res.hasOwnProperty("code") && parseInt(res.code) === 200) {
                    if (checkScoreAPI(res)) {
                        // if (!isMobile) {
                            chrome.browserAction.setBadgeText({ "text": res.data.totalScore.toString() });
                        // }
                        if (typeof callback === "function") {
                            callback(res.data);
                        }
                    } else {
                        notice(chrome.i18n.getMessage("extScoreApi"), chrome.i18n.getMessage("extUpdate"));
                    }
                } else {
                    if (runningTabId) {
                        chrome.tabs.remove(runningTabId);
                    }
                    if (runningWindowId) {
                        closeWindow();
                    }
                    chrome.tabs.update(scoreTabId, { "active": true, "url": getLoginUrl() });
                }
            }
        };
        xhr.send();
    } catch (error) {
        autoEarnPoints(5 * 1000);
    }
    }
}

//检查积分接口数据结构
function checkScoreAPI(res) {
    if (res.hasOwnProperty("data")) {
        if (res.data.hasOwnProperty("taskProgress")) {
            return true;
        }
    }
    return false;
}

//检查首页内容数据
function getChannelData(type, callback) {
    shuffle(channel[type]);
    channelArr = channel[type][0].split('|');

    // if (!isMobile) {
        chrome.windows.get(runningWindowId, { "populate": true }, function (window) {
            if (typeof window !== "undefined") {
                chrome.tabs.sendMessage(window.tabs[window.tabs.length - 1].id, {
                    "method": "redirect",
                    "data": channelArr[1]
                });
            }
        });
    // } else {
    //     chrome.tabs.sendMessage(runningTabId, {
    //         "method": "redirect",
    //         "data": channelArr[1]
    //     });
    // }

    setTimeout(function () {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", urlMap.channelApi + channelArr[0] + ".json?_st=" + Math.floor(Date.now() / 6e4));
        xhr.setRequestHeader("Accept", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    let res = JSON.parse(xhr.responseText);
                    let list = [];
                    let pass = [];
                    let url;

                    for (key in res) {
                        if (!res.hasOwnProperty(key)) {
                            continue;
                        }
                        if (res[key].hasOwnProperty("url")) {
                            url = res[key].url;
                            if (type === 'article') {
                                if (url.indexOf("e43e220633a65f9b6d8b53712cba9caa") === -1 && url.indexOf("lgpage/detail/index") === -1) {
                                    continue;
                                }
                            } else {
                                if (url.indexOf("cf94877c29e1c685574e0226618fb1be") === -1 && url.indexOf("7f9f27c65e84e71e1b7189b7132b4710") === -1 && url.indexOf("lgpage/detail/index") === -1) {
                                    continue;
                                }
                            }
                            if (list.indexOf(url) === -1 && pass.indexOf(url) === -1) {
                                if (usedUrls[type].indexOf(url) === -1) {
                                    list.push(url);
                                } else {
                                    pass.push(url);
                                }
                            }
                        }
                    }
                    shuffle(list);
                    shuffle(pass);
                    list.concat(pass);

                    if (list.length) {
                        if (typeof callback === "function") {
                            callback(list);
                        }
                    } else {
                        notice(chrome.i18n.getMessage("extChannelApi"), chrome.i18n.getMessage("extUpdate"));
                    }
                }
            }
        };
        xhr.send();
    }, 1000 + Math.floor(Math.random() * 3000));
}

//自动积分
function autoEarnPoints(timeout) {
    let url;
    let newTime = 0;
    setTimeout(function () {
        getPointsData(function (data) {
            let score = data.taskProgress;
            let type;

            for (let key in score) {
                if (!score.hasOwnProperty(key)) {
                    continue;
                }
                switch (score[key].sort) {
                    case 100:
                    case 200:
                        if (score[key].currentScore < score[key].dayMaxScore) {
                            type = "article";
                            newTime = 60 * 1000 + Math.floor(Math.random() * 1 * 1000);
                        }
                        break;
                    case 300:
                    case 400:
                        if (score[key].currentScore < score[key].dayMaxScore) {
                            type = "video";
                            newTime = 60 * 1000 + Math.floor(Math.random() * 1 * 1000);
                        }
                        break;
                    case 500:
                        if (score[key].currentScore < score[key].dayMaxScore) {
                            type = "exam-practice";
                            newTime = 20 * 1000 + Math.floor(Math.random() * 1 * 1000);
                        }
                        break;
                    //    2022-5-24 每周答题不再有新题，跳过每周答题积分的检查
                    // case 1700:
                    //     if (weeklyTitle == 0 && score[key].currentScore <= 0) {
                    //         type = "exam-weekly";
                    //         newTime = 50 * 1000 + Math.floor(Math.random() * 2 * 1000);
                    //     }
                    //     break;
                    case 700:
                        if (paperTitle == 0 && score[key].currentScore <= 0) {
                            type = "exam-paper";
                            newTime = 30 * 1000 + Math.floor(Math.random() * 3 * 1000);
                        }
                        break;

                }
            }

            if (type && !channelUrls.hasOwnProperty(type)) {
                if (type === 'article') {
                    getChannelData("article", function (list) {
                        channelUrls["article"] = list;
                    });
                }
                if (type === 'video') {
                    getChannelData("video", function (list) {
                        channelUrls["video"] = list;
                    });
                }
                if (type === 'exam-practice') {
                    channelUrls["exam-practice"] = urlMap.dailyAsk;
                }
                // if (type === 'exam-weekly') {
                //     channelUrls["exam-weekly"] = urlMap.weeklyAsk;
                // }
                if (type === 'exam-paper') {
                    channelUrls["exam-paper"] = urlMap.paperAsk;
                }
            }

            if (type && channelUrls[type].length) {
                if (type === 'article' || type === 'video') {
                    url = channelUrls[type].shift();
                } else {
                    url = channelUrls[type][0];
                }

            }

            // if (!isMobile) {
                if (url && scoreTabId && runningWindowId) {
                    chrome.windows.get(runningWindowId, { "populate": true }, function (window) {
                        if (typeof window !== "undefined") {
                            chrome.tabs.sendMessage(window.tabs[window.tabs.length - 1].id, {
                                "method": "redirect",
                                "data": url
                            });
                            autoEarnPoints(newTime);
                        }
                    });
                } else {
                    closeWindow();
                }
            // } else {
            //     if (url && scoreTabId && runningTabId) {
            //         chrome.tabs.sendMessage(runningTabId, {
            //             "method": "redirect",
            //             "data": url
            //         });
            //         autoEarnPoints(newTime);
            //     } else {
            //         chrome.tabs.remove(runningTabId);
            //         chrome.tabs.remove(scoreTabId);
            //     }
            // }
        });
    }, timeout);
}

//获取最后使用的网址
function getLastTypeUrl(type, index) {
    let urls = [];
    let length = usedUrls[type].length ? usedUrls[type].length - 1 : 0;
    for (let i = length; i >= 0; --i) {
        if (!usedUrls[type].hasOwnProperty(i)) {
            continue;
        }
        urls.push(usedUrls[type][i]);

        if (urls.length >= index + 1) {
            break;
        }
    }
    return urls.hasOwnProperty(index) ? urls[index] : undefined;
}

//打乱数组
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

//通知
function notice(title, message = "") {
    // if (!isMobile) {
        chrome.notifications.create({
            "type": "basic",
            "iconUrl": "img/Pikachu-128.png",
            "title": title,
            "message": message
        }, function (notificationId) {
            setTimeout(function () {
                chrome.notifications.clear(notificationId);
            }, 5000);
        });
    // } else {
    //     alert(title + (message ? "\n" + message : ""));
    // }
}

//创建窗口
function createWindow(url, callback) {
    chrome.windows.create({
        "url": url,
        "type": "popup",
        "top": 0,
        "left": 0,
        "width": windowWidth,
        "height": windowHeight
    }, function (window) {
        if (firefoxVersion) {
            chrome.windows.update(window.id, {
                "top": 0,
                "left": 0,
            });
        }
        chrome.tabs.update(window.tabs[window.tabs.length - 1].id, { "muted": true });
        if (typeof callback === "function") {
            callback(window);
        }
    })
}

//关闭窗口
function closeWindow(windowId) {
    if (windowId) {
        chrome.windows.get(windowId, function (window) {
            if (window) {
                chrome.windows.remove(windowId);
            }
        });
    } else {
        if (runningWindowId) {
            chrome.windows.remove(runningWindowId);
        }
        if (scoreWindowId) {
            chrome.windows.remove(scoreWindowId);
        }
        notice(chrome.i18n.getMessage("extFinish"));
    }
}

//获取登录链接
function getLoginUrl() {
    return "https://pc.xuexi.cn/points/login.html?ref=https%3A%2F%2Fpc.xuexi.cn%2Fpoints%2Fmy-points.html";
}

//扩展按钮点击事件
chrome.browserAction.onClicked.addListener(function (tab) {
    if (chromeVersion < 45 && firefoxVersion < (isMobile ? 55 : 48)) {
        notice(chrome.i18n.getMessage("extVersion"));
    } else {
        // if (!isMobile) {
            if (scoreTabId) {
                if (runningWindowId) {
                    chrome.windows.update(runningWindowId, { "focused": true, "state": "normal" });
                } else {
                    chrome.windows.update(scoreWindowId, { "focused": true, "state": "normal" });
                }
            } else {
                channelUrls = {};
                chooseLogin = 0;
                // weeklyTitle = 0;
                paperTitle = 0;
                createWindow(urlMap.points, function (window) {
                    scoreWindowId = window.id;
                    scoreTabId = window.tabs[window.tabs.length - 1].id;
                });
            }
        // } else {
        //     if (scoreTabId) {
        //         if (runningTabId) {
        //             chrome.tabs.update(runningTabId, { "active": true });
        //         } else {
        //             chrome.tabs.update(scoreTabId, { "active": true });
        //         }
        //     } else {
        //         channelUrls = {};
        //         chooseLogin = 0;
        //         chrome.tabs.create({ "url": urlMap.points }, function (tab) {
        //             scoreTabId = tab.id;
        //         });
        //     }
        // }
    }
});

//标签页移除事件
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    if (tabId === runningTabId) {
        runningTabId = 0;
    } else if (tabId === scoreTabId) {
        scoreTabId = 0;
    }
});

//窗口移除事件
// if (!isMobile) {
    chrome.windows.onRemoved.addListener(function (windowId) {
        if (windowId === runningWindowId) {
            runningWindowId = 0;
        } else if (windowId === scoreWindowId) {
            scoreWindowId = 0;
            chrome.browserAction.setBadgeText({ "text": "" });
        }
    });
// }

//通信事件
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.method) {
        case "checkTab":
            if (sender.tab.windowId === runningWindowId || sender.tab.id === runningTabId || sender.tab.id === scoreTabId) {
                sendResponse({
                    "runtime": 1
                });
            }
            break;
        case "startRun":
            if (!Object.keys(channelUrls).length) {
                // if (!isMobile) {
                    if (!runningWindowId) {
                        getPointsData(function (data) {
                            if (userId !== data.userId) {
                                usedUrls = {
                                    "article": [],
                                    "video": []
                                }
                            }
                            userId = data.userId;
                            createWindow(urlMap.index, function (window) {
                                runningWindowId = window.id;
                                notice(chrome.i18n.getMessage("extWorking"), chrome.i18n.getMessage("extWarning"));
                                setTimeout(function () {
                                    channelUrls["exam-practice"] = urlMap.dailyAsk;
                                    // channelUrls["exam-weekly"] = urlMap.weeklyAsk;
                                    channelUrls["exam-paper"] = urlMap.paperAsk;
                                    getChannelData("article", function (list) {
                                        channelUrls["article"] = list;
                                        getChannelData("video", function (list) {
                                            channelUrls["video"] = list;
                                            autoEarnPoints(1000 + Math.floor(Math.random() * 1000));
                                        });
                                    });
                                }, 1000 + Math.floor(Math.random() * 1000));
                            });
                        });
                    }
                // } else {
                //     if (!runningTabId) {
                //         getPointsData(function (data) {
                //             if (userId !== data.userId) {
                //                 usedUrls = {
                //                     "article": [],
                //                     "video": []
                //                 }
                //             }
                //             userId = data.userId;
                //             chrome.tabs.create({ "url": urlMap.index }, function (tab) {
                //                 runningTabId = tab.id;
                //                 setTimeout(function () {
                //                     channelUrls["exam-practice"] = urlMap.dailyAsk;
                //                     channelUrls["exam-weekly"] = urlMap.weeklyAsk;
                //                     channelUrls["exam-paper"] = urlMap.paperAsk;
                //                     getChannelData("article", function (list) {
                //                         channelUrls["article"] = list;
                //                         getChannelData("video", function (list) {
                //                             channelUrls["video"] = list;
                //                             autoEarnPoints(1000 + Math.floor(Math.random() * 1000));
                //                         });
                //                     });
                //                 }, 1000 + Math.floor(Math.random() * 3000));
                //             });
                //         });
                //     }
                // }
            }
            break;
        case "useUrl":
            if (usedUrls[request.type].indexOf(sender.tab.url) === -1) {
                usedUrls[request.type].push(sender.tab.url);
            }
            break;
        case "chooseLogin":
            chooseLogin = 1;
            sendResponse({
                "chooseLogin": chooseLogin
            });
            break;
        case "checkLogin":
            if (sender.tab.id === scoreTabId) {
                if (!chooseLogin) {
                    chrome.tabs.update(scoreTabId, { "url": getLoginUrl() });
                }
            }
            break;
        // case "weeklyTitle":
        //     weeklyTitle = 1;
        //     sendResponse({
        //         "weeklyTitle": weeklyTitle
        //     });
        //     break;
        case "paperTitle":
            paperTitle = 1;
            sendResponse({
                "paperTitle": paperTitle
            });
            break;
        case "askComplete":
            sendResponse({ "complete": 0 });
            break;
    }
});