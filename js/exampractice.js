chrome.runtime.sendMessage({"method": "checkTab"}, {}, function (response) {
    if (response && response.hasOwnProperty("runtime")) {
        if (response.runtime) {

            var waitTiming = 10, setTimeoutFunc = null, ManageType = 'auto', isManual = false;

            function getAnswers() {
                var options = 0, optionsArray = [], match_num = {}, max = 0, delay = 0;
                isManual = false;
                if (document.querySelector(".q-header") == null) {
                    if (document.querySelector(".ant-btn.action.ant-btn-primary") != null) {
                        chrome.runtime.sendMessage({"method": "askComplete"});
                        return;
                    } else {
                        setTimeoutFunc = setTimeout(getAnswers, parseInt(Math.random() * 1000));
                        return;
                    }
                }
                var questionTitle = document.querySelector(".q-header");
                if (questionTitle == null) {
                    return;
                }
                var questionType = questionTitle.innerText.substr(0, 3);
                if (document.querySelector(".q-footer .tips") != null) {
                    document.querySelector(".q-footer .tips").click();
                } else {
                    answerSubmit(1);
                    return;
                }
                document.querySelectorAll('.line-feed [color=red]').forEach(function (a, b, c) {
                    let i = a.innerText;
                    if (i != "") optionsArray.push(i);
                });

                if (optionsArray.length == 0) {
                    document.querySelectorAll('.line-feed > font').forEach(function (a, b, c) {
                        let i = a.innerText;
                        if (i != "") optionsArray.push(i);
                    });

                    if (optionsArray.length == 0) {
                        document.querySelectorAll('.line-feed').forEach(function (a, b, c) {
                            let i = a.innerText;
                            if (i != "" && i != "请观看视频") {
                                optionsArray.push(i);
                            }
                        });
                    }
                }
                switch (questionType) {
                    case "单选题":
                        delay = 1;
                    case "多选题":
                        options = document.querySelectorAll('.q-answers .chosen').length;
                        if (options <= 0) {
                            document.querySelectorAll('.q-answer').forEach(function (a, b, c) {
                                var optionChoose = a.innerHTML.split('. ').slice(-1)[0];
                                var optionIsRight = false;
                                var optionMatches = 0;
                                var isChosen = false;
                                var optionString = optionsArray.join('');
                                optionChoose = optionChoose.replace(/\(/g, "（").replace(/\)/g, "）");
                                optionString = optionString.replace(/\(/g, "（").replace(/\)/g, "）");

                                isChosen = Boolean(a.className.indexOf("chosen") != -1);
                                optionIsRight = (optionChoose.indexOf(optionString) != -1 || optionString.indexOf(optionChoose) != -1) && optionString != "";
                                if (optionIsRight && questionType == '单选题') {
                                    optionIsRight = (optionString.length == optionChoose.length ? true : false);
                                }
                                if (optionIsRight && !isChosen) {
                                    a.click();
                                    options++;
                                }
                                if (!optionIsRight) {
                                    optionMatches += getoptionMatches(optionString, a.innerHTML);
                                    match_num[optionMatches] = a
                                }
                            })
                            if (options == 0) {
                                for (let i in match_num) {
                                    max = Number(max) >= Number(i) ? Number(max) : Number(i);
                                }
                                match_num[max].click();
                                options++;
                                isManual = true;
                            }
                            manualManage();
                            delay = delay == 0 ? 2500 : 1500;
                        }
                        break;
                    case "填空题":
                        var inpus = document.querySelectorAll('.q-body input');
                        var inputs_e = document.querySelectorAll('.q-body input[value=""]');
                        options = inpus.length - inputs_e.length;
                        if (inputs_e.length > 0) {
                            var ev = new Event('input', {bubbles: true});
                            inpus.forEach(function (a, b, c) {
                                if (optionsArray[0] == undefined) {
                                    isManual = true;
                                    let a = document.querySelector(".q-body").innerText;
                                    let n = parseInt(Math.random() * 2 + 2);
                                    let i = parseInt(Math.random() * (a.length - n - 1));
                                    optionsArray[0] = a.substr(i, n);
                                }
                                var value = "";
                                if (c.length == 1)
                                    value = optionsArray.join('');
                                else
                                    value = b < optionsArray.length ? optionsArray[b] : optionsArray[0];
                                if (a.value == "") {
                                    a.setAttribute("value", value);
                                    a.dispatchEvent(ev);
                                    options++;
                                }
                            })
                            manualManage();
                            delay = 3500;
                        }
                        break;
                }
                setTimeoutFunc = setTimeout(function () {
                    answerSubmit(options)
                }, parseInt(Math.random() * 1000 + delay));
            }

            function answerSubmit(options = 0) {
                if (options > 0 && ManageType == 'auto') {
                    if ($(".submit-btn").length) {
                        $(".submit-btn").click();
                    } else {
                        if ($(".next-btn").length) {
                            $(".next-btn").click();
                        }
                    }
                    setTimeoutFunc = setTimeout(getAnswers, parseInt(Math.random() * 1000));
                }
            }

            function getoptionMatches(a = '', b = '') {
                let c = 0;
                for (let i = 0; i < b.length; i++) {
                    if (a.indexOf(b.substr(i, 1)) != -1) {
                        c++;
                    }
                }
                return c;
            }

            function manualManage() {
                if (document.querySelector("#my_ms") != null || !isManual) return;
                let ds_c = 0;
                let ds_t = null;
                ManageType = "wait";
                let e = document.createElement("div");
                e.id = "my_ms";
                e.innerHTML = "此题无完全匹配答案，已填写(选择)一个相对最匹配的答案(可能是错误的)。你可以点击下面按钮切换到手动做题并修正答案后再次点击按钮切换到自动做题。<br><span id='my_ds'>若 <span id='my_ds_c'>" + waitTiming + "</span> 秒无操作则继续自动做题</span><br>";
                e.style.color = 'red';
                e.style.fontSize = '20px';
                e.style.textAlign = 'center';
                document.querySelector(".header-row").appendChild(e);
                let b = document.createElement("button");
                b.style.color = 'green';
                b.style.fontSize = '24px';
                b.style.textAlign = 'center';
                b.style.marginTop = '10px';
                b.value = 'auto';
                b.innerText = '切换到手动做题';
                b.onclick = function () {
                    document.querySelector("#my_ds").innerHTML = '';
                    if (ds_t != null) {
                        clearInterval(ds_t);
                        ds_t = null;
                    }
                    if (this.value == 'auto') {
                        this.value = 'manual';
                        ManageType = "manual";
                        b.innerText = '切换到自动做题';
                        this.style.color = 'red';
                    } else {
                        this.value = 'auto';
                        ManageType = 'auto';
                        b.innerText = '切换到手动做题';
                        this.style.color = 'green';
                        document.querySelector("#my_ms").remove();
                        getAnswers();
                    }
                }
                e.appendChild(b);
                ds_t = setInterval(function () {
                    ds_c++;
                    document.querySelector("#my_ds_c").innerText = waitTiming - ds_c;
                    if (ds_c >= waitTiming) {
                        document.querySelector("#my_ms").remove();
                        clearInterval(ds_t);
                        ds_t = null;
                        ManageType = 'auto';
                        answerSubmit(1);
                    }
                }, 1000);

            }

            setTimeoutFunc = setTimeout(getAnswers, parseInt(Math.random() * 1000));

        }
    }
});
