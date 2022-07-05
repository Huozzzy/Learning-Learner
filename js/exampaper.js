chrome.runtime.sendMessage({"method": "checkTab"}, {}, function (response) {
    if (response && response.hasOwnProperty("runtime")) {
        if (response.runtime) {
            function getNeedAnswer() {
                var isNextPage = true;
                document.querySelectorAll('.item .right > button').forEach(function (e, b, c) {
                    if (isNextPage) {
                        let i = e.innerText;
                        let year = e.parentNode.parentNode.firstElementChild.lastElementChild.innerText.slice(0, 4);
                        if (i != "" && (i == '开始答题' || i == '继续答题')) {

                            if ((new Date().getFullYear() == year)) {
                                isNextPage = false;
                                e.click();
                            }
                            return;
                        }
                    }
                });

                if (isNextPage) {

                    var li = document.getElementsByClassName("ant-pagination-next")[0];
                    if (li.getAttribute("aria-disabled") == "false") {
                        document.querySelector('a.ant-pagination-item-link > i.anticon-right').click();
                        setTimeout(getNeedAnswer, parseInt(1500));
                    } else {
                        chrome.runtime.sendMessage({"method": "paperTitle"});
                    }
                }
            }

            setTimeout(getNeedAnswer, parseInt(1000));

        }
    }
});
