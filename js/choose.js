window.addEventListener("load", function () {
    document.getElementById("qr").addEventListener("click", function () {
        chrome.runtime.sendMessage({"method": "chooseLogin"}, {}, function (response) {
            window.location.replace("https://pc.xuexi.cn/points/login.html?ref=https%3A%2F%2Fpc.xuexi.cn%2Fpoints%2Fmy-points.html");
        });
    });
});
