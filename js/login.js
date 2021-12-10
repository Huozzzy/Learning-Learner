// var qrCode = document.querySelector('.ddloginbox');
// if (qrCode) {
//     setTimeout(function () {
//         qrCode.scrollIntoView({
//             behavior: "smooth"
//         });
//         setTimeout(function () {
//             window.scrollTo({
//                 left: (document.body.scrollWidth - document.documentElement.clientWidth) / 2,
//                 top: window.scrollY,
//                 behavior: 'smooth'
//             });
//         }, 1000 + Math.floor(Math.random() * 1000));
//     }, 1000 + Math.floor(Math.random() * 1000))
// }

setTimeout(function () {
    window.scrollTo({
        left: (document.body.scrollWidth - document.documentElement.clientWidth) / 2,
        top: 1350,
        behavior: 'smooth'
    });
}, 10);

// chrome.runtime.sendMessage({"method": "checkLogin"});


