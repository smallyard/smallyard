---
layout:     post
title:      "一个简单js select插件"
subtitle:   "hongselect开发笔记"
date:       2015-08-04
author:     "Hux"
tags:
    - 前端开发
    - JavaScript
---



> 现在，通过一个select插件，来介绍一下js插件的构建过程。

## 先上效果图

![hongselect](http://images0.cnblogs.com/blog2015/463864/201508/041646179237937.png)

## 目录构建

1.  这个select插件，我给它起名叫`hongselect`，所以呢，首先建个`hongselect`的文件夹。
2.  接着建一个src目录来放源码。
3.  我想把源代码托管到`github`上，所以呢，再建一个`README.md`文件，来写这个插件的一个说明文档。
4.  然后建一个`.gitignore`文件，来说明那些文件或文件夹是不需要加入代码版本管理的。
5.  该插件依赖于`jQuery`，我们要下载它，对于js依赖，我们可以使用`bower`来管理，并使用`bower`来发布我们的插件。
6.  使用`bower`，新建一个`bower.json`来配置。
7.  最后代码的打包工作，使用`grunt`来对js，css，和img文件进行压缩。
8.  使用`grunt`，新建一个`package.json`来配置。

最终的目录结构如下（上面没提到的文件接下来会介绍）：

![dir](http://images0.cnblogs.com/blog2015/463864/201508/041320328143905.png)

## 源码书写

在src中，再建两个文件夹，一个`css`文件夹，用来放样式文件；一个`img`文件夹，用来放图片文件。

### JavaScript部分

在src中，新建一个`hongselect.src.js`文件。

源码如下：

```
(function ($) {
    var defaultOptions = {
        theme: "default"
    };
 
    //select object
    var HongSelect = function (element, options) {
        var that = this;
        that.origin = $(element);
        that.origin.hide();
        that.options = $.extend({}, defaultOptions, options);
        that.render();
    };
 
    HongSelect.prototype = {
        render: function () {
            var that = this;
            var theme = that.options.theme;
            that.container = that.container || that.origin.after("<div>").next();
            that.container.addClass(theme + "_hongselect");
            that.container.empty();
            var infoSpan = that.container.append("<span>").find("span");
            infoSpan.addClass(theme + "_info_span");
            var dl = that.container.append("<dl>").find("dl");
            dl.addClass(theme + "_dl");
            $(that.origin).find("option").each(function (i, option) {
                if (i == 0) {
                    infoSpan.text(option.text);
                }
                dl.append("<dd data-val=" + option.value + ">" + option.text + "</dd>");
            });
 
            //show selected value
            infoSpan.text($(that.origin).find('option:selected').text());
 
            //hide dd items
            dl.hide();
            var dd = dl.find("dd");
            dd.addClass(theme + "_dd");
            dd.hover(function () {
                $(this).addClass(theme + "_dd_hover");
            }, function () {
                $(this).removeClass(theme + "_dd_hover");
            });
 
            //show and hide
            infoSpan.click(function (e) {
                e.preventDefault();
                e.stopPropagation();
                dl.show();
            });
            dd.each(function () {
                $(this).click(function () {
                    infoSpan.text($(this).text());
                    $(that.origin).val($(this).attr("data-val"));
                    $(that.origin).trigger("change");
                });
            });
 
            //click blank hide
            $(document).click(function () {
                dl.hide();
            });
        },
        setSelectVal: function (value) {
            this.origin.val(value);
            this.render();
        },
        refresh: function () {
            this.render();
        }
    };
 
    $.fn.hongselect = function (option) {
        var args = Array.apply(null, arguments);
        args.shift();
        this.each(function () {
            var $this = $(this),
                data = $this.data('hongselect'),
                options = typeof option == 'object' && option;
            if (!data) {
                $this.data('hongselect', (data = new HongSelect(this, options)));
            }
            if (typeof option == 'string' && typeof data[option] == 'function') {
                data[option].apply(data, args);
            }
        });
        return this;
    };
 
})(jQuery);

```

扩展jQuery：

```
$.fn.hongselect = function (option) {
       var args = Array.apply(null, arguments);
       args.shift();
       this.each(function () {
           var $this = $(this),
               data = $this.data('hongselect'),
               options = typeof option == 'object' && option;
           if (!data) {
               $this.data('hongselect', (data = new HongSelect(this, options)));
           }
           if (typeof option == 'string' && typeof data[option] == 'function') {
               data[option].apply(data, args);
           }
       });
       return this;
   };

```

这个是个jQuery扩展一个hongselect的方法。$fn这个是什么呢？这个fn既是JavaScript中的prototype，jQuery只是用fn来替代prototype，这样你就能明白为什么$.fn.hongselect这样就能够使用$('选择器').hongselect()这样的方式来使用了。

### 接下来是写css了

在css中新建一个`hongselect.css`文件。

```
.default_hongselect {
    width: 150px;
    position: absolute;
}
 
.default_info_span {
    cursor: pointer;
    text-indent: 10px;
    color: #666;
    display: block;
    padding-right: 20px;
    height: 30px;
    line-height: 25px;
    background: url(../img/arrow.png) no-repeat right center;
    position: relative;
    border: 1px solid #ccc;
    text-overflow: ellipsis;
    overflow: hidden;
}
 
.default_dl {
 
    border-bottom: 1px solid #ccc;
    margin: 1px 0 0;
}
 
.default_dd {
    cursor: pointer;
    height: 30px;
    line-height: 25px;
    color: #666;
    white-space: normal;
    padding: 0 10px;
    background: #f1f1f1;
    margin: 0;
    border-left: 1px solid #ccc;
    border-top: 1px solid #ccc;
    border-right: 1px solid #ccc;
    text-overflow: ellipsis;
    overflow: hidden;
}
 
.default_dd_hover {
    background: #fff;
}

```

### 将图片放入`img`文件

OK，代码书写完毕。

##测试

配置bower.json

```
{
  "name": "hongselect",
  "version": "0.0.1",
  "homepage": "https://github.com/liuhongqiang/hongselect",
  "authors": [
    "liuhongqiang <liuhongqiang@live.cn>"
  ],
  "description": "A simple web select.",
  "main": "src/hongselect.src.js",
  "keywords": [
    "select"
  ],
  "license": "MIT",
  "ignore": [
    "node_modules",
    "bower_components"
  ],
  "devDependencies": {
    "jquery": "2.1.4"
  }
}
```

在命令行使用命令下载`jQuery`，具体使用方法见`bower`官网。

```
bower install
```

调用命令后，就会在当前目录下创建一个`bower_components`的文件夹，并将我们依赖的js下载到该目录。

然后我们就可以引用它来做测试了，我们建一个`doc/example`来放我们的测试文件。

```
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>HongSelect</title>
    <link rel="stylesheet" type="text/css" href="../../src/css/hongselect.src.css">
    <script type="text/javascript" src="../../bower_components/jquery/dist/jquery.min.js"></script>
    <script type="text/javascript" src="../../src/hongselect.src.js"></script>
    <script type="text/javascript">
        $(function(){
            $("#myselect").hongselect();
            $("#btn_setval").click(function(){
                $("#myselect").hongselect("setSelectVal","1");
            });
        });
    </script>
</head>
<body>
    <select id="myselect">
        <option value="1">one</option>
        <option value="2" selected>two</option>
        <option value="3">three</option>
        <option value="4">four</option>
        <option value="5">five</option>
    </select>
    <button id="btn_setval">set value = 1</button>
</body>
</html>
```

## 打包

好了，项目测试好之后我们就可以打包插件了。

我们用`grunt`来打包它，`grunt`配置如下，具体使用方法见官网。

### package.json

```
{
    "name": "hongselect",
    "version": "0.0.1",
    "description": "A simple web select.",
    "dependencies": {
        "grunt": "^0.4.5",
        "grunt-contrib-uglify": "~0.2.2",
        "grunt-contrib-clean":"~0.6.0",
        "grunt-contrib-cssmin":"~0.10.0",
        "grunt-contrib-imagemin": "~0.7.0"
    }
}

```

### Gruntfile.js

```
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        clean: {
            build: {
                src: ["dist/``"]
            }
        },
        uglify: {
            build: {
                src: "src/hongselect.src.js",
                dest: "dist/hongselect.min.js"
            }
        },
        cssmin: {
            build: {
                src: "src/css/hongselect.src.css",
                dest: "dist/css/hongselect.min.css"
            }
        },
        imagemin: {
            build: {
                src: "src/img/arrow.png",
                dest: "dist/img/arrow.png"
            }
        }
    });
 
    //注册插件
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-imagemin");
    // 默认被执行的任务列表。
    grunt.registerTask("default", ["clean", "uglify", "cssmin", "imagemin"]);
};

```

用命令行调用grunt就会将压缩好的js、css、img放入`dist`目录。

```
grunt

```

## 发布

通过`bower`命令发布

```
bower register <my-package-name> <git-endpoint>

```

发布后可以在bower.io上查找到：

![bower](http://images0.cnblogs.com/blog2015/463864/201508/041348353307752.png)

## 托管

通过git将代码托管到`github`上。

```
git add
git commit
git push

```

[https://github.com/liuhongqiang/hongselect](https://github.com/liuhongqiang/hongselect)
