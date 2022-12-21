chrome.runtime.sendMessage({ type: "checkRunning" }, {}, function (response) {
    if (response && response.hasOwnProperty("runtime")) {
        if (response.runtime) {

            // 滑块验证
            const swiperValid = document.getElementById('swiper_valid')
            // if (swiperValid) {
            //     let obs = new MutationObserver((mutationRecords) => {
            //         slideVerify()
            //     })
            //     obs.observe(swiperValid, {
            //         childList: true,
            //         subtree: true,
            //         characterDataOldValue: true,
            //     })
            // }

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
                        chrome.runtime.sendMessage({ type: "paperTitle" }, {}, function (res) {
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