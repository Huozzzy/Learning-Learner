// 每周答题
chrome.runtime.sendMessage({"method": "checkTab"}, {}, function (response) {
    if (response && response.hasOwnProperty("runtime")) {
        if (response.runtime) {
            function goToLastPage() {
                var item = document.getElementsByClassName("ant-pagination-item");
                item[item.length - 1].click();
            }
            // goToLastPage();
            setTimeout(goToLastPage,parseInt(2000));

            function getNeedAnswer() {
                var isPrePage = true;
                // 逆序遍历
                Array.from(document.querySelectorAll('.week > button')).reverse().forEach(function (e, b, c) {
                    if (isPrePage) {
                        let i = e.innerText;
                        if (i != "" && i == '开始答题') {
                            isPrePage = false;
                            e.click();
                            return;
                        }
                    }
                });

                if (isPrePage) {
                    var li = document.getElementsByClassName("ant-pagination-prev")[0];
                    if (li.getAttribute("aria-disabled") == "false") {
                        document.querySelector('a.ant-pagination-item-link > i.anticon-left').click();
                        setTimeout(getNeedAnswer, parseInt(Math.random() * 1000));
                    } else {
                        chrome.runtime.sendMessage({"method": "weeklyTitle"});
                    }
                }
            }

            setTimeout(getNeedAnswer, parseInt(2000));
        }
    }
});
