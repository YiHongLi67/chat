const { json } = require("express");
const express = require("express");
const app = express();
const mysql = require("mysql");

// 创建连接
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "0603",
  database: "chat"
});
db.connect((err) => {
  if (err) throw err;
  console.log("连接成功");
});

// 登录验证
app.all("/login", (req, res) => {
  //get
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  let sql = `SELECT * FROM usermsg WHERE sign_str = "${req.query.name}"`;
  let data = {};
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.length == 0) {
        //用户不存在
        data.msg = -1;
      } else if (result[0].pwd === req.query.pwd) {
        //密码正确可登录
        data.msg = 1;
        data.url = "./pages/chat.html";
        data.userMsg = result[0];
      } else if (result[0].pwd !== req.query.pwd) {
        //密码不正确
        data.msg = 0;
      }
      res.send(data);
    }
  });
});

// 注册
app.all("/register", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  let find = `SELECT * FROM usermsg WHERE sign_str = "${req.query.name}"`;
  let insert = `INSERT INTO usermsg (pwd, sign_str) VALUES("${req.query.pwd}", "${req.query.name}");`;
  let data = {};
  db.query(find, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.length == 0) {
        // 用户名在数据库中不存在，可注册
        db.query(insert, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            // 注册成功
            data.msg = 1;
            res.send(data);
          }
        });
      } else {
        // 用户名已存在
        data.msg = -1;
        res.send(data);
      }
    }
  });
});

// 获取好友列表
app.all("/get-friend", (req, res) => {
  // get
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  let final = {};
  let sql = `SELECT friend_id, sign_str, nickname, head_logo FROM friends f, usermsg u
    WHERE f.id = ${req.query.user_id} AND f.friend_id = u.id;`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      final.data = result;
    }
    res.send(final);
  });
});

// 搜索好友或群
app.all("/search-friend", (req, res) => {
  // get
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  let final = {};
  let sql = `SELECT * FROM usermsg WHERE id <> ${req.query.id} AND (nickname LIKE "%${req.query.search_text}%" OR sign_str LIKE "%${req.query.search_text}%");`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      final.data = result;
    }
    res.send(final);
  });
});

// 搜索用户（除自己和好友之外的用户）
app.all("/search-user", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  let final = {};
  let sql = `SELECT u.id, u.sign_str, u.nickname, u.head_logo FROM usermsg u WHERE u.id NOT IN
	(SELECT u.id FROM usermsg, apply a
	WHERE a.origin_str = "${req.query.sign_str}"
	AND a.friend_str IN
	(SELECT u.sign_str FROM usermsg WHERE u.id NOT IN
	(SELECT friend_id FROM usermsg, friends f WHERE f.id = ${req.query.id} AND f.friend_id = u.id)
	HAVING sign_str <> "${req.query.sign_str}"))
	AND u.id IN
	(SELECT u.id FROM usermsg WHERE u.id NOT IN
	(SELECT friend_id FROM usermsg, friends f WHERE f.id = ${req.query.id} AND f.friend_id = u.id)
	HAVING id <> ${req.query.id})
	AND (sign_str LIKE "%${req.query.search_text}%" OR nickname LIKE "%${req.query.search_text}%")`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      final.data = result;
    }
    res.send(final);
  });
});

// 修改昵称
app.all("/change-name", (req, res) => {
  // get
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  let sql = `update usermsg set nickname = "${req.query.newName}" where id = ${req.query.user_id}`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
    }
    res.send(result);
  });
});

// 发送好友申请
app.all("/add-friend", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  let data = {};
  let sql = `INSERT INTO apply(origin_str, origin_status, friend_str, friend_status) VALUES("${req.query.origin_str}", 1, "${req.query.friend_str}", 0)`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    }
    data.msg = "success";
    res.send(data);
  });
});

// 获取好友申请
app.all("/friend-apply", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  let final = {};
  let sql = `SELECT u.id, u.sign_str, u.nickname, u.head_logo FROM usermsg u, apply a
    WHERE a.friend_str = "${req.query.sign_str}"
    AND a.friend_status = 0
    AND a.origin_str = u.sign_str`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    }
    final.data = result;
    res.send(final);
  });
});

// 处理好友申请（同意添加）
app.all("/agree-apply", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  let data = {};
  data.id = {};
  data.msg = "success";
  let sql = `UPDATE apply SET friend_status = 1 WHERE origin_str="${req.query.friend_str}" AND friend_str="${req.query.user_str}"`;
  let id_sql = `SELECT id FROM usermsg WHERE sign_str = "${req.query.user_str}"`;
  let friend_id_sql = `SELECT id FROM usermsg WHERE sign_str = "${req.query.friend_str}"`;
  db.query(id_sql, (err, result) => {
    console.log(data.msg);
    if (err) {
      data.msg = "error";
      console.log(err);
    }
    if (data.msg == "success") {
      data.id.user_id = result[0].id;
      db.query(friend_id_sql, (err, result) => {
        console.log(data.msg);
        if (err) {
          data.msg = "error";
          console.log(err);
        }
        if (data.msg == "success") {
          data.id.friend_id = result[0].id;
          console.log(data.id);
          db.query(sql, (err, result) => {
            console.log(data.msg);
            if (err) {
              data.msg = "error";
              console.log(err);
            }
            if (data.msg == "success") {
              console.log("数据成功插入apply表");
              let own_insert_sql = `INSERT INTO friends(id, friend_id) VALUES("${data.id.user_id}", "${data.id.friend_id}")`;
              db.query(own_insert_sql, (err, result) => {
                if (err) {
                  data.msg = "error";
                  console.log(err);
                }
                if (data.msg == "success") {
                  console.log("数据成功插入friends表");
                  let oppo_insert_sql = `INSERT INTO friends(id, friend_id) VALUES("${data.id.friend_id}", "${data.id.user_id}")`;
                  db.query(oppo_insert_sql, (err, result) => {
                    if (err) {
                      data.msg = "error";
                      console.log(err);
                    }
                    if (data.msg == "success") {
                      console.log("数据成功插入friends表");
                      let friend_msg = `select id, sign_str, nickname, head_logo from usermsg where id = ${data.id.friend_id}`;
                      db.query(friend_msg, (err, result) => {
                        if (err) {
                          data.msg = "error";
                          console.log(err);
                        }
                        data.friend_msg = result;
                        res.send(data);
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});

// 处理好友申请（拒绝添加）
app.all("/refuse-apply", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  let sql = `UPDATE apply SET friend_status = -1 WHERE origin_str="${req.query.friend_str}" AND friend_str="${req.query.user_str}"`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});

// 修改密码
app.all("/change-pwd", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  let data = {
    msg: "密码更改失败"
  };
  let sql = `SELECT pwd FROM usermsg WHERE id = ${req.query.id}`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result[0].pwd === req.query.oldPwd) {
        let sql = `UPDATE usermsg SET pwd = "${req.query.newPwd}" WHERE id = ${req.query.id}`;
        db.query(sql, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            data.msg = "密码更改成功";
            res.send(data);
          }
        });
      } else {
        data.msg = "原密码不正确";
        res.send(data);
      }
    }
  });
});

// 注销用户
app.all("/user-annul", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  let data = {
    msg: "注销失败"
  };
  let sql = `DELETE FROM apply WHERE origin_str = "${req.query.sign_str}" OR friend_str = "${req.query.sign_str}"`;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      let sql = `delete from friends where id = ${req.query.id} or friend_id = ${req.query.id}`;
      db.query(sql, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          let sql = `delete from usermsg where id = ${req.query.id}`;
          db.query(sql, (err, result) => {
            if (err) {
              console.log(err);
            } else {
              data.msg = "注销成功";
              res.send(data);
            }
          });
        }
      });
    }
  });
});

app.listen(5000, () => {
  console.log("服务器开启在5000端口....");
});
