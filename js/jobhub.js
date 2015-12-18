var hasConnect = false;
var appkey = "567392ee4407a3cd028aacf6";
var yunba = new Yunba({server: 'sock.yunba.io', port: 3000, appkey: appkey});

// 连接服务器并发送消息
function connect(cmd, topic) {
    yunba.init(function (success) {
        if (success) {
            // 连接服务器
            yunba.connect_by_customid('jobhub-web', function (success, msg, sessionid) {
                if (success) {
                    hasConnect = true;
                    console.log('你已成功连接到消息服务器，会话ID：' + sessionid);
                    send(cmd, topic);
                } else {
                    console.log(msg);
                }
            });
            // 监听回传消息
            yunba.subscribe({'topic': topic + appkey},
            function (success, msg) {
                if (success) {
                    console.log('你已成功订阅频道' + topic);
                } else {
                    console.log(msg);
                }
            });

            yunba.set_message_cb(showMsg);
        }
    });
}

// 发送消息
function send(cmd, topic) {
    yunba.publish({'topic': topic, 'msg': cmd},
    function (success, msg) {
        if (success) {
            console.log('消息发布成功');
        } else {
            console.log(msg);
        }
    });
}

// 显示回传消息
function showMsg(data){
    console.log('Topic:' + data.topic + ',Msg:' + data.msg);
    var $divMsg = $("#div_msg");
    $divMsg.append("<p>" + data.msg + "</p>");
    // 滚动到最下方
    $divMsg.scrollTop($divMsg[0].scrollHeight );
}

$("#btnSubmit").click(function () {
    var $inputCmd = $("#inputCmd");
    var $inputTopic = $("#inputTopic");
    var $spanInfo = $("#spanInfo");
    var cmd = $inputCmd.val();
    var topic = $inputTopic.val();
    if (!cmd) {
        $spanInfo.text("命令不能为空");
        return;
    }
    if (!topic) {
        $spanInfo.text("密码不能为空");
        return;
    }

    if (hasConnect) {
        send(cmd, topic);
    } else {
        connect(cmd, topic)
    }

    $inputCmd.val("").focus();
    // $inputTopic.val("");
    $spanInfo.empty();
});

// 绑定回车事件
$(document).keydown(function(e){
    if(e.keyCode==13){
        $("#btnSubmit").click();
    }
});
