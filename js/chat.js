var search = $(".search-input");
var searchBtn = $(".search-btn");
var userId = $(".user-id");
var friendRequest = $(".friend-request");
var getFriend = $(".get-friend");
var friendApply = $(".friend-apply");
var friendLogo = $(".friend-apply li img");
var friendNickname = $(".nickname");
var friendId = $(".friend-id");
var searchFriend = $(".search-friend");
var chatList = $(".chat-list");

$(".icon-tianjia").click(function () {
  $(".icon-gengduo>div.contact").hide();
  $(".icon-tianjia>div.contact").toggle();
});
$(".icon-gengduo").click(function () {
  $(".icon-tianjia>div.contact").hide();
  $(".icon-gengduo>div.contact").toggle();
});

var ws = new WebSocket("ws://localhost:3000");
ws.addEventListener("open", function () {
  //websocket连接成功触发事件
  console.log("连接上了websocket");
});
setTimeout(function () {
  let data = {
    sign_str: localStorage.getItem("sign_str")
  };
  ws.send(JSON.stringify(data));
}, 500);

ws.addEventListener("message", function (res) {
  let data = JSON.parse(res.data);
  console.log(data);
  if (data.chatMsg) {
    console.log("正在对话");
    // 接收消息
    let div = `
			<div>
				<p class="opposite">
					<img src=${data.opposing.head_logo} alt="">
					<span>${data.chatMsg}</span>
				</p>
			</div>
		`;
    $(".msg-content").append(div);
  }
});

// 设置头像大小
function setHeadlogoSize(dom) {
  // console.log($(dom),"[width: " + $(dom).css('width') + ", height: " + $(dom).css('height]'))
  if ($(dom).css("width") > $(dom).css("height")) {
    $(dom).css("height", "100%");
  } else {
    $(dom).css("width", "100%");
  }
}

// 加载页面时获取好友列表
window.onload = function () {
  $.ajax({
    url: "http://127.0.0.1:5000/get-friend",
    type: "GET",
    data: {
      user_id: localStorage.getItem("id")
    },
    success: function (res) {
      var contact_id = {};
      var contact_nickname = {};
      var contact_logo = {};
      var sign_str = {};
      var len = res.data.length;
      for (var i = 0; i < len; i++) {
        contact_id[i] = res.data[i].friend_id;
        contact_nickname[i] = res.data[i].nickname;
        contact_logo[i] = res.data[i].head_logo;
        sign_str[i] = res.data[i].sign_str;
      }
      for (var j = 0; j < len; j++) {
        var li = $(
          `
				<li data-id=${contact_id[j]} sign-str=${sign_str[j]}>
					<div>
						<img src=${contact_logo[j]}>
					</div>
					<div class="friend-msg">
						<div class="nickname">
							<span>${contact_nickname[j]}</span>
						</div>
						<div class="username">
							<span>最近一条聊天记录</span>
						</div>
					</div>
				</li>`
        );
        chatList.append(li);
      }
    },
    error: function () {
      alert("获取好友列表失败");
    }
  });
  $(".user-msg>div>img").attr("src", `${localStorage.getItem("head_logo")}`);
  userId.html(`${localStorage.getItem("nickname")}`);
  // 用户资源加载完成后设置头像尺寸和nickname
  setTimeout(function () {
    setHeadlogoSize(".user-msg>div>img");
    $(".chat-list>li>div:first-child>img").each(function () {
      setHeadlogoSize(this);
    });
  }, 2000);
};

// 获取好友申请
$(".friend-request").click(function () {
  $.ajax({
    url: "http://127.0.0.1:5000/friend-apply",
    type: "GET",
    data: {
      id: localStorage.getItem("id"),
      sign_str: localStorage.getItem("sign_str")
    },
    success: function (res) {
      var len = res.data.length;
      if (len != 0) {
        var search_id = {};
        var search_nickname = {};
        var search_username = {};
        var search_headlogo = {};
        $(".friend-apply .user-list>li").remove();
        $(".user-list").addClass("show");
        $(".friend-apply").addClass("show");
        for (var i = 0; i < len; i++) {
          search_id[i + 1] = res.data[i].id;
          search_username[i + 1] = res.data[i].sign_str;
          search_nickname[i + 1] = res.data[i].nickname;
          search_headlogo[i + 1] = res.data[i].head_logo;
        }
        let li;
        for (var j = 0; j < len; j++) {
          li = `
							<li data-searchId=${search_username[j + 1]}>
								<div>
								<img src="${search_headlogo[j + 1]}" alt="">
								</div>
								<span>用户名:</span>
								<span class="search-name">${search_username[j + 1]}</span>
								<span>昵称:</span>
								<span class="search-nickname">${search_nickname[j + 1]}</span>
								<button type="button" class="agree">同意</button>
								<button type="button" class="refuse">拒绝</button>
							</li>
						`;

          $(".friend-apply .user-list").append(li);
        }
        setTimeout(function () {
          $(".user-list>li>div>img").each(function () {
            setHeadlogoSize(this);
          });
        }, 1000);
        // 处理好友申请
        $(".user-list>li").on("click", "button", function () {
          let parent = $(this).parent();
          if ($(this).attr("class") == "agree") {
            $.ajax({
              url: "http://127.0.0.1:5000/agree-apply",
              type: "GET",
              data: {
                friend_str: parent.attr("data-searchId"),
                user_str: localStorage.getItem("sign_str")
              },
              success: function (res) {
                parent.find("button").remove();
                let btn = `<button type="button">已成为好友可开始聊天</button>`;
                parent.append(btn);
                let li = `
									<li data-id=${res.friend_msg[0].id} sign-str=${res.friend_msg[0].sign_str}>
										<div>
											<img src="${res.friend_msg[0].head_logo}">
										</div>
										<div class="friend-msg">
											<div class="nickname">
												<span>${res.friend_msg[0].nickname}</span>
											</div>
											<div class="username">
												<span>最近一条聊天记录</span>
											</div>
										</div>
									</li>
								`;
                $(".chat-list>li:nth-child(1)").before(li);
                setTimeout(() => {
                  setHeadlogoSize(".chat-list>li:nth-child(1) img");
                }, 1000);
              },
              error: function () {
                alert("添加好友失败！");
              }
            });
          } else if ($(this).attr("class") == "refuse") {
            $.ajax({
              url: "http://127.0.0.1:5000/refuse-apply",
              type: "GET",
              data: {
                friend_str: parent.attr("data-searchId"),
                user_str: localStorage.getItem("sign_str")
              },
              success: function () {
                parent.find("button").remove();
                let btn = `<button type="button" class="deal">你已拒绝该用户的申请</button>`;
                parent.append(btn);
              },
              error: function () {
                alert("拒绝申请似乎出了点小问题-_~");
              }
            });
          }
        });
      } else {
        alert("暂无好友申请~_-");
      }
    },
    error: function () {
      alert("获取好友申请失败！");
    }
  });
});

// 搜索用户
$(".get-friend").click(function () {
  $(".get-friend-box").addClass("show");
  $(".resMsg").addClass("show");
});
$(".closing").click(function () {
  $(".get-friend-box").removeClass("show");
  $(".get-friend-box input").val("");
  $(".user-list").removeClass("show");
  $(".resMsg").addClass("show");
  $(".resMsg").html("");
});
$(".friend-apply .closing").click(function () {
  $(".friend-apply").removeClass("show");
});
$(".get-friend-box span").click(function () {
  let searchVal = $(".get-friend-box input").val();
  var search_id = {};
  var search_nickname = {};
  var search_username = {};
  var search_headlogo = {};
  if (searchVal == "") {
    alert("输入不能为空");
    return;
  }
  $.ajax({
    url: "http://127.0.0.1:5000/search-user",
    type: "GET",
    data: {
      id: localStorage.getItem("id"),
      sign_str: localStorage.getItem("sign_str"),
      search_text: searchVal
    },
    success: function (res) {
      var len = res.data.length;
      if (len != 0) {
        $(".get-friend-box .user-list>li").remove();
        $(".user-list").addClass("show");
        $(".resMsg").removeClass("show");
        for (var i = 0; i < len; i++) {
          search_id[i + 1] = res.data[i].id;
          search_username[i + 1] = res.data[i].sign_str;
          search_nickname[i + 1] = res.data[i].nickname;
          search_headlogo[i + 1] = res.data[i].head_logo;
        }
        let li;
        for (var j = 0; j < len; j++) {
          li = `
							<li data-searchId=${search_username[j + 1]}>
								<div>
								<img src=${search_headlogo[j + 1]} alt="">
								</div>
								<span>用户名:</span>
								<span class="search-name">${search_username[j + 1]}</span>
								<span>昵称:</span>
								<span class="search-nickname">${search_nickname[j + 1]}</span>
								<button type="button">添加好友</button>
							</li>
						`;

          $(".get-friend-box .user-list").append(li);
        }
        setTimeout(function () {
          $(".user-list>li>div>img").each(function () {
            setHeadlogoSize(this);
          });
        }, 1000);
      } else {
        $(".user-list").removeClass("show");
        $(".resMsg").addClass("show");
        $(".resMsg").html("暂无搜索结果！");
      }
      // 添加好友
      $(".user-list>li").on("click", "button", function () {
        let _this = this;
        var searchStr = $(this).parent().attr("data-searchId");
        if ($(this).parent().attr("class") !== "complete") {
          $.ajax({
            url: "http://127.0.0.1:5000/add-friend",
            type: "GET",
            data: {
              origin_str: localStorage.getItem("sign_str"),
              friend_str: searchStr
            },
            success: function (res) {
              $(_this).html("等待验证");
              $(_this).parent().addClass("complete");
              $(_this).parent().attr("apply-status", "1");
              alert("已申请，等待对方验证");
            },
            error: function () {
              alert("添加申请发送失败！！");
            }
          });
        }
      });
    },
    error: function () {
      alert("搜索用户失败！");
    }
  });
});

// 点击选择聊天对象
var curFriendMsg = {};
var contactList = $(".chat-list");
contactList.on("click", "li", function () {
  $(".msg-content>div").remove();
  $(".add-chat-list").removeClass("add-chat-list");
  $(this).addClass("add-chat-list");
  curFriendMsg.id = $(this).attr("data-id");
  curFriendMsg.sign_str = $(this).attr("sign-str");
  curFriendMsg.head_logo = $(this)
    .children(":nth-child(1)")
    .children("img")
    .attr("src");
  curFriendMsg.nickname = $(this)
    .children(":nth-child(2)")
    .children("div.nickname")
    .children()
    .html();
});

// 发送消息
var msgContent = $(".msg-content");
var sendBtn = $(".send");
$(".comment-content textarea")[0].addEventListener("keydown", function (event) {
  // console.log(event)
  if (event.keyCode === 13 && !event.ctrlKey) {
    event.preventDefault();
    if (!!$(".comment-content textarea").val().trim()) {
      console.log(
        `这是“enter”键，将发送消息\n${$(".comment-content textarea")
          .val()
          .trim()}`
      );
      let data = {
        myself: {
          id: localStorage.getItem("id"),
          sign_str: localStorage.getItem("sign_str"),
          nickname: localStorage.getItem("nickname"),
          head_logo: localStorage.getItem("head_logo")
        },
        opposing: curFriendMsg,
        chatMsg: $(".comment-content textarea").val().trim()
      };
      let div = `
					<div>
						<p class="myself">
							<img src="${localStorage.getItem("head_logo")}" alt="">
							<span>${data.chatMsg}</span>
						</p>
					</div>
				`;
      $(".msg-content").append(div);
      $(".comment-content textarea").val("");
      ws.send(JSON.stringify(data));
    }
  }
  if (event.keyCode === 13 && event.ctrlKey) {
    $(".comment-content textarea").val(
      `${$(".comment-content textarea").val()}` + "\n"
    );
  }
});

$(".changeName input").blur(function () {
  $(this).css("outline", "1px solid black");
});

$(".changeName input").focus(function () {
  $(this).css("outline", "1px solid red");
});

// 修改昵称
$(userId).click(function () {
  $(".changeName").css("display", "block");
});
$(".changeName .cancel>span").click(function () {
  $(".changeName").css("display", "none");
});
$(".changeName>button").click(function () {
  let newName = $(".changeName>input").val();
  let user_id = localStorage.getItem("id");
  if (newName) {
    $.ajax({
      url: "http://127.0.0.1:5000/change-name",
      type: "GET",
      data: {
        newName: newName,
        user_id: user_id
      },
      success: function (res) {
        localStorage.setItem("nickname", newName);
        location.reload();
      },
      error: function () {
        alert("修改昵称失败！");
      }
    });
  } else {
    alert("输入不能为空！");
  }
});

// 修改密码
$(".change-pwd .closing").click(function () {
  $(".change-pwd").hide();
  $(".change-pwd>input").eq(0).val("");
  $(".change-pwd>input").eq(1).val("");
  $(".change-pwd>input").eq(2).val("");
});
$(".change-pwd input").focus(function () {
  $(this).css("outline", "1px solid red");
});
$(".change-pwd input").blur(function () {
  $(this).css("outline", "1px solid rgb(88, 65, 216)");
});
$(".changePwd").click(function () {
  $(".change-pwd").show();
});
$(".change-pwd>button").click(function () {
  let oldPwd = $(".change-pwd>input").eq(0).val();
  let newPwd = $(".change-pwd>input").eq(1).val().trim();
  let confirm = $(".change-pwd>input").eq(2).val().trim();
  if (oldPwd && newPwd && confirm) {
    console.log(oldPwd, newPwd, confirm);
    if (newPwd === confirm) {
      $.ajax({
        url: "http://127.0.0.1:5000/change-pwd",
        type: "GET",
        data: {
          id: localStorage.getItem("id"),
          oldPwd: oldPwd,
          newPwd: newPwd
        },
        success: function (res) {
          $(".change-pwd>input").eq(0).val("");
          $(".change-pwd>input").eq(1).val("");
          $(".change-pwd>input").eq(2).val("");
          $(".change-pwd").hide();
          alert(res.msg);
        },
        error: function () {
          alert("修改密码出错了^.^");
        }
      });
    } else {
      alert("新密码与确认密码不一致！");
    }
  } else {
    alert("输入不能为空！");
  }
});

// 退出登录
$(".logout").click(function () {
  logout();
});
function logout() {
  localStorage.setItem("id", "");
  localStorage.setItem("sign_str", "");
  localStorage.setItem("nickname", "");
  localStorage.setItem("head_logo", "");
  location.replace("../login.html");
}

// 注销用户
$(".annul").click(function () {
  if (confirm("你确定要注销此账户吗？注销后将无法登录！")) {
    $.ajax({
      url: "http://127.0.0.1:5000/user-annul",
      type: "GET",
      data: {
        id: localStorage.getItem("id"),
        sign_str: localStorage.getItem("sign_str")
      },
      success: function (res) {
        if (res.msg === "注销成功") {
          logout();
        } else if (res.msg === "注销失败") {
          alert("注销失败");
        }
      },
      error: function () {}
    });
  }
});
