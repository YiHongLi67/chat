var $name = $("#nickname");
var $pwd = $("#pwd");
$(".btn>span")
  .eq(0)
  .click(function () {
    $(".loginBtn").addClass("hidden");
    $(".registerBtn").removeClass("hidden");
    $(".confirm").removeClass("hidden");
    $(".registerSunmit").removeClass("hidden");
    $(".loginSubmit").addClass("hidden");
  });
$(".btn>span").eq(1).click(change);
function change() {
  $(".loginBtn").removeClass("hidden");
  $(".registerBtn").addClass("hidden");
  $(".confirm").addClass("hidden");
  $(".registerSunmit").addClass("hidden");
  $(".loginSubmit").removeClass("hidden");
}
//登录
$(".loginSubmit").click(function (event) {
  let name = $name.val();
  let pwd = $pwd.val();
  if (name && pwd) {
    $.get(
      "http://127.0.0.1:5000/login",
      {
        name: name,
        pwd: pwd
      },
      function (res) {
        console.log(res);
        if (res.msg == -1) {
          alert("用户名不存在！");
        } else if (res.msg == 0) {
          alert("密码不正确！");
        } else if (res.msg == 1) {
          localStorage.setItem("id", res.userMsg.id);
          localStorage.setItem("sign_str", res.userMsg.sign_str);
          localStorage.setItem("nickname", res.userMsg.nickname);
          localStorage.setItem("head_logo", res.userMsg.head_logo);
          window.location.replace(res.url);
        }
      },
      "json"
    );
  } else {
    alert("用户名和密码不能为空！");
  }
});

//注册
$(".registerSunmit").click(function () {
  let name = $name.val();
  let pwd = $pwd.val();
  let confirmPwd = $(".confirm").val();
  if (name && pwd && confirmPwd) {
    if (pwd === confirmPwd) {
      $.get(
        "http://127.0.0.1:5000/register",
        {
          name: name,
          pwd: pwd
        },
        function (res) {
          if (res.msg == 1) {
            alert("注册成功！");
            change();
          } else if (res.msg == -1) {
            alert("此用户已存在！请换一个~_^");
          }
        },
        "json"
      );
    } else {
      alert("密码与确认密码不一致！");
    }
  } else {
    alert("用户名和密码不能为空！！");
  }
});
