chrome.runtime.sendMessage({ type: "checkRunning" }, {}, function (response) {
    if (response && response.hasOwnProperty("runtime")) {
        if (response.runtime) {
            // 滑块验证
            const swiperValid = document.getElementById("swiper_valid")
            if (swiperValid) {
                let obs = new MutationObserver(mutationRecords => {
                    slideVerify()
                  });
                  obs.observe(swiperValid, {
                    childList: true,
                    subtree: true,
                    characterDataOldValue: true
                  });
            }

            function getNeedAnswer() {
                var isNextPage = true;
                document.querySelectorAll('.item .right > button').forEach(function (e, b, c) {
                    if (isNextPage) {
                        let year = e.parentNode.parentNode.firstElementChild.lastElementChild.innerText.slice(0, 4);
                        let i = e.innerText;
                        if (i != "" && (i == '开始答题' || i == '继续答题')) {

                            if (year != "" && (new Date().getFullYear() == year)) {
                                isNextPage = false;
                                e.click();
                            }
                            // else {
                            //     var item = document.getElementsByClassName("ant-pagination-item");
                            //     item[item.length - 1].click();
                            //     // 设置查询非当年题目
                            //     setTimeout(getNeedAnswerHistory, parseInt(Math.random() * 1000 + 2000));
                            // }
                            return;
                        }
                    }
                });

                if (isNextPage) {
                    var li = document.getElementsByClassName("ant-pagination-next")[0];
                    if (li.getAttribute("aria-disabled") == "false") {
                        document.querySelector('a.ant-pagination-item-link > i.anticon-right').click();
                        setTimeout(getNeedAnswer, parseInt(Math.random() * 1000 + 1000));
                    } else {
                        chrome.runtime.sendMessage({type: "paperTitle"}, {}, function (res) {
                            if (res.complete) {
                                window.close();
                            }
                        });
                    }
                }
            }

            // function getNeedAnswerHistory() {
            //     var isNextPage = true;
            //     Array.from(document.querySelectorAll('.item .right > button')).reverse().forEach(function (e, b, c) {
            //         if (isNextPage) {
            //             let i = e.innerText;
            //             if (i != "" && (i == '开始答题' || i == '继续答题')) {
            //                 isNextPage = false;
            //                 e.click();
            //                 return;
            //             }
            //         }
            //     });
            //
            //     if (isNextPage) {
            //         var li = document.getElementsByClassName("ant-pagination-prev")[0];
            //         if (li.getAttribute("aria-disabled") == "false") {
            //             document.querySelector('a.ant-pagination-item-link > i.anticon-left').click();
            //             setTimeout(getNeedAnswerHistory, parseInt(Math.random() * 2000));
            //         } else {
            //             chrome.runtime.sendMessage({ type: "paperTitle" }, {}, function (res) {
            //                 if (res.complete) {
            //                     window.close();
            //                 }
            //             });
            //         }
            //     }
            // }

            function slideVerify() {
                const nc_mask = document.getElementById("nc_mask")
                if (nc_mask !== null && getComputedStyle(nc_mask).display !== 'none') {
                    var btn_slide = document.getElementById("nc_1_n1z")
                    var mousedown = document.createEvent("MouseEvents");
                    if (btn_slide !== null) {
                        var btn_slide_rect = btn_slide.getBoundingClientRect();
                        var x = btn_slide_rect.left + btn_slide_rect.width * (parseInt(Math.random() * 5) / 10 + 0.2);
                        var y = btn_slide_rect.top + btn_slide_rect.height / 2;
                    }
                    var nc_scale = document.getElementById("nc_1_n1t");
                    if (nc_scale !== null) { var w = nc_scale.getBoundingClientRect().width; }

                    //点击滑块
                    mousedown.initMouseEvent("mousedown", true, true, window, 0, x, y, x, y, false, false, false, false, 0, null);
                    if (btn_slide != null) { btn_slide.dispatchEvent(mousedown); }

                    var aa = 0;
                    var bb = 0;
                    //滑动滑块
                    var intervaltimer = setInterval(function () {
                        var mousemove = document.createEvent("MouseEvents");
                        var _x = x + aa;
                        var _y = y + bb;
                        mousemove.initMouseEvent("mousemove", true, true, window, 0, _x, _y, _x, _y, false, false, false, false, 0, null);
                        if (btn_slide != null) { btn_slide.dispatchEvent(mousemove); }
                        if (_x - x >= w) {
                            // 滑到最右边
                            clearInterval(intervaltimer);
                            var mouseup = document.createEvent("MouseEvents");
                            mouseup.initMouseEvent("mouseup", true, true, window, 0, _x, _y, _x, _y, false, false, false, false, 0, null);
                            if (btn_slide != null) { btn_slide.dispatchEvent(mouseup); }
                        } else {
                            aa += parseInt(Math.random() * (209 - 199) + 199) / 33;
                        }
                    }, 10);
                }
            }

            chrome.storage.local.get(['studyConfig'], function (result) {
            //     let config = result.studySubjectConfig;
            //     let paperConfig = new Object();
            //     for (let i = 0; i < config.length; i++) {
            //         if ("paper" == config[i].type) {
            //             paperConfig = config[i];
            //             break;
            //         }
            //     }
            //
            //     if (paperConfig.subject == "current") {
                    setTimeout(getNeedAnswer, parseInt(Math.random() * 1000 + 1000));
            //     } else {
            //         // 设置查询非当年题目
            //         setTimeout(function () {
            //             // 点击最后一页
            //             var item = document.getElementsByClassName("ant-pagination-item");
            //             item[item.length - 1].click();
            //
            //             setTimeout(getNeedAnswerHistory, parseInt(Math.random() * 1000 + 2000));
            //         }, parseInt(Math.random() * 1000 + 5000));
            //     }
            });

        }
    }
});