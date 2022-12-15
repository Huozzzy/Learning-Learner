chrome.runtime.sendMessage({ type: 'checkRunning' }, {}, function (response) {
  if (response && response.hasOwnProperty('runtime')) {
    if (response.runtime) {
      var WaitingTime = 5,
        setTimeoutFunc = null,
        ManageType = 'auto',
        isManual = false

      // 滑块验证
      const swiperValid = document.getElementById('swiper_valid')
      if (swiperValid) {
        let obs = new MutationObserver((mutationRecords) => {
          slideVerify()
        })
        obs.observe(swiperValid, {
          childList: true,
          subtree: true,
          characterDataOldValue: true,
        })
      }

      function getAnswers() {
        let answerChoseNum = 0,
          answerArray = [],
          match_num = {},
          max = 0,
          timeDelay = 0
        isManual = false
        // 获取答题标题，单选题、多选题、填空题
        let questionTitle = $('.q-header')
        if (!questionTitle.length) {
          // 如果答题已完成
          if ($('.ant-btn.action.ant-btn-primary').length) {
            setTimeout(function () {
              chrome.runtime.sendMessage(
                { type: 'studyComplete' },
                {},
                function (res) {
                  if (res.complete) {
                    window.close()
                  }
                },
              )
            }, 2000 + Math.floor(Math.random() * 1000))
          } else {
            setTimeoutFunc = setTimeout(
              getAnswers,
              parseInt(Math.random() * 2000 + 2000),
            )
          }
          return
        }
        // 提交答案
        if (!$('.q-footer .tips').length) {
          answerSubmit(1)
          return
        }
        // 获取答案
        $('.q-footer .tips').click()
        $('.line-feed [color=red]').each(function () {
          let i = $(this).text()
          if (i != '') {
            answerArray.push(i)
          }
        })

        // 如果答案为空，则找到全部提示内容
        if (answerArray.length == 0) {
          $('.line-feed > font').each(function () {
            let i = $(this).text()
            if (i != '') {
              answerArray.push(i)
            }
          })

          if (answerArray.length == 0) {
            $('.line-feed').each(function () {
              let i = $(this).text()
              if (i != '' && i != '请观看视频') {
                answerArray.push(i)
              }
            })
          }
        }

        // 获取题目
        let questionType = questionTitle.text().substr(0, 3)
        switch (questionType) {
          case '单选题':
            timeDelay = 1
          case '多选题':
            answerChoseNum = $('.q-answers .chosen').length
            if (answerChoseNum <= 0) {
              $('.q-answer').each(function () {
                let that = $(this)
                var answerSelect = that.text().split('. ').slice(-1)[0]
                var answerIsRight = false
                var answerMatches = 0
                var isChosen = false
                var answerJoinString = answerArray.join('')

                // 转换符号，
                answerSelect = answerSelect
                  .replace(/\(/g, '（')
                  .replace(/\)/g, '）')
                answerJoinString = answerJoinString
                  .replace(/\(/g, '（')
                  .replace(/\)/g, '）')

                isChosen = Boolean(that.attr('class').indexOf('chosen') != -1)
                answerIsRight =
                  (answerSelect.indexOf(answerJoinString) != -1 ||
                    answerJoinString.indexOf(answerSelect) != -1) &&
                  answerJoinString != ''
                if (answerIsRight && questionType == '单选题') {
                  answerIsRight =
                    answerJoinString.length == answerSelect.length
                      ? true
                      : false
                }
                if (answerIsRight && !isChosen) {
                  that.click()
                  answerChoseNum++
                }
                if (!answerIsRight) {
                  answerMatches += getAnswerMatches(
                    answerJoinString,
                    that.text(),
                  )
                  match_num[answerMatches] = that
                }
              })

              if (answerChoseNum == 0) {
                for (let i in match_num) {
                  max = Number(max) >= Number(i) ? Number(max) : Number(i)
                }
                match_num[max].click()
                answerChoseNum++
                isManual = true
              }
              manualManage()
              timeDelay = 1000
            }
            break
          case '填空题':
            var inpus = document.querySelectorAll('.q-body input')
            var inputs_e = document.querySelectorAll('.q-body input[value=""]')
            answerChoseNum = inpus.length - inputs_e.length
            if (inputs_e.length > 0) {
              var ev = new Event('input', { bubbles: true })
              inpus.forEach(function (a, b, c) {
                if (answerArray[0] == undefined) {
                  isManual = true
                  let a = document.querySelector('.q-body').innerText
                  let n = parseInt(Math.random() * 2 + 2)
                  let i = parseInt(Math.random() * (a.length - n - 1))
                  answerArray[0] = a.substr(i, n)
                }
                var value = ''
                if (c.length == 1) {
                  value = answerArray.join('')
                } else {
                  value =
                    b < answerArray.length ? answerArray[b] : answerArray[0]
                }
                if (a.value == '') {
                  a.setAttribute('value', value)
                  a.dispatchEvent(ev)
                  answerChoseNum++
                }
              })
              manualManage()
              timeDelay = 1500
            }
            break
        }
        setTimeoutFunc = setTimeout(function () {
          answerSubmit(answerChoseNum)
        }, parseInt(Math.random() * timeDelay + 1000))
      }

      function answerSubmit(answerChoseNum = 0) {
        // 提交答案
        if (answerChoseNum > 0 && ManageType == 'auto') {
          // 有提交按钮，提交数据
          if ($('.submit-btn').length) {
            $('.submit-btn').click()
          } else {
            if ($('.next-btn').length) {
              $('.next-btn').click()
            }
          }
          setTimeoutFunc = setTimeout(
            getAnswers,
            parseInt(Math.random() * 1000 + 2000),
          )
        }
      }

      function getAnswerMatches(a = '', b = '') {
        let c = 0
        for (let i = 0; i < b.length; i++) {
          if (a.indexOf(b.substr(i, 1)) != -1) {
            c++
          }
        }
        return c
      }

      function slideVerify() {
        const nc_mask = document.getElementById('nc_mask')
        if (nc_mask !== null && getComputedStyle(nc_mask).display !== 'none') {
          var btn_slide = document.getElementById('nc_1_n1z')
          if (btn_slide !== null) {
            var btn_slide_rect = btn_slide.getBoundingClientRect()
            var x =
              btn_slide_rect.left +
              btn_slide_rect.width * (parseInt(Math.random() * 5) / 10 + 0.2)
            var y = btn_slide_rect.top + btn_slide_rect.height / 2
          }
          var nc_scale = document.getElementById('nc_1_n1t')
          if (nc_scale !== null) {
            var w = nc_scale.getBoundingClientRect().width
          }
          const eventdown = new MouseEvent('mousedown',{
            bubbles: true,
            cancelable: true,
            view: window,
            detail: 0,
            screenX: x,
            screenY: y,
            clientX: x,
            clientY: y,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            button:0,
            relatedTarget: null,
          });
          if (btn_slide != null) {
            btn_slide.dispatchEvent(eventdown)
          }

          var aa = 0
          var bb = 0
          //滑动滑块
          var intervaltimer = setInterval(function () {
            // var mousemove = document.createEvent('MouseEvents')
            var _x = x + aa
            var _y = y + bb
            setTimeout (function(){
                const eventmove = new MouseEvent('mousemove',{
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    detail: 0,
                    screenX: _x,
                    screenY: _y,
                    clientX: _x,
                    clientY: _y,
                    ctrlKey: false,
                    altKey: false,
                    shiftKey: false,
                    metaKey: false,
                    button:0,
                    relatedTarget: null,
                  });
            },Math.floor(Math.random() *  1000));
            if (btn_slide != null) {
              btn_slide.dispatchEvent(eventmove)
            }
            if (_x - x >= w) {
              // 滑到最右边
              clearInterval(intervaltimer);
              const eventup = new MouseEvent('mouseup',{
                bubbles: true,
                cancelable: true,
                view: window,
                detail: 0,
                screenX: _x,
                screenY: _y,
                clientX: _x,
                clientY: _y,
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                button:0,
                relatedTarget: null,
              });
              if (btn_slide != null) {
                btn_slide.dispatchEvent(eventup)
              }
            } else {
              aa += parseInt(Math.random() * (209 - 199) + 199) / 33
            }
          }, 20)
        }
      }

      function manualManage() {
        let myId = 'my_ms'
        if ($('#' + myId).length || !isManual) {
          return
        }

        // 浏览器提醒
        // chrome.runtime.sendMessage({ type: "answerError" });

        // 设置类型等待
        ManageType = 'wait'

        let timerId = 'my_ds_c'
        let buttonId = 'my_bt_c'
        let html =
          '<div id="' +
          myId +
          '" style="color: red; font-size: 20px; text-align: center;">此题无完全匹配答案，已填写(选择)一个相对最匹配的答案(可能是错误的)。你可以点击下面按钮切换到手动做题并修正答案后再次点击按钮切换到自动做题。<br>'
        html +=
          '<span>若 <span id="' +
          timerId +
          '">' +
          WaitingTime +
          '</span> 秒无操作则继续自动做题</span><br>'
        html +=
          '<button id="' +
          buttonId +
          '" value="auto" style="color: green; font-size: 24px; text-align: center; margin-top: 10px;">切换到手动做题</button>'
        html += '</div>'

        $('.header-row').append(html)

        let timeLeftSeconds = 0
        let timeLeftEvenv = null
        // button点击事件
        $('#' + buttonId)
          .off('click')
          .on('click', function () {
            if (timeLeftEvenv != null) {
              clearInterval(timeLeftEvenv)
              timeLeftEvenv = null
            }
            if ($(this).val() == 'auto') {
              $(this).val('manual')
              $(this).text('切换到自动做题')
              $(this).css('color', 'red')
              ManageType = 'manual'
            } else {
              $(this).val('auto')
              $(this).text('切换到手动做题')
              $(this).css('color', 'green')
              ManageType = 'auto'
              $('#' + myId).remove()
              getAnswers()
            }
          })

        // 定时事件
        timeLeftEvenv = setInterval(function () {
          timeLeftSeconds++
          $('#' + timerId).text(WaitingTime - timeLeftSeconds)
          if (timeLeftSeconds >= WaitingTime) {
            $('#' + myId).remove()
            clearInterval(timeLeftEvenv)
            timeLeftEvenv = null
            ManageType = 'auto'
            answerSubmit(1)
          }
        }, 100)
      }

      setTimeoutFunc = setTimeout(getAnswers, parseInt(Math.random() * 1000))
    }
  }
})
