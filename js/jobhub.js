var hasConnect = false;
var yunba = new Yunba({server: 'sock.yunba.io', port: 3000, appkey: "567392ee4407a3cd028aacf6"});

function connect(cmd, topic) {
    yunba.init(function (success) {
        if (success) {
            yunba.connect_by_customid('jobhub-web', function (success, msg, sessionid) {
                if (success) {
                    hasConnect = true;
                    console.log('你已成功连接到消息服务器，会话ID：' + sessionid);
                    send(cmd, topic);
                } else {
                    console.log(msg);
                }
            });
        }
    });
}

function send(cmd, topic) {
    //yunba.subscribe({'topic': topic},
    //    function (success, msg) {
    //        if (success) {
    //            console.log('你已成功订阅频道' + topic);
    //        } else {
    //            console.log(msg);
    //        }
    //    }
    //);
    //
    //yunba.set_message_cb(function (data) {
    //    console.log('Topic:' + data.topic + ',Msg:' + data.msg);
    //});

    yunba.publish({'topic': topic, 'msg': cmd},
        function (success, msg) {
            if (success) {
                console.log('消息发布成功');
            } else {
                console.log(msg);
            }
        }
    );
}

$("#btnSubmit").click(function () {
	var $inputCmd = $("#inputCmd");
	var $inputTopic = $("#inputTopic");
	var $spanInfo = $("#spanInfo");
    var cmd = inputCmd.val();
    var topic = inputTopic.val();
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

    $inputCmd.val("");
    $inputTopic.val("");
    $spanInfo.empty();
});


