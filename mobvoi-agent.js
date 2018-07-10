/**
 * Not support IE8
 */
(function() {
    try {
        var bugTrackerUrl = "http://localhost:8088/log";
        var ipUrl = "https://freegeoip.net/json/";
        var serviceName = "ticbuy";
        var modelAjaxError = "ajax-error";
        var modelJsError = "js-error";
        var test = false;

        function extend(destination, source) {
            for (var property in source) {
                destination[property] = source[property];
            }
            return destination;
        }

        var filterUtil = {
            "suffix": [
                "cloudfornt.net/ticbuy/js/agent.min.js"
            ],
            "prefix": [
                "https://bat.bing.com/bat.js",
                "https://api.weglot.com",
                "https://freegeoip.net",
                "https://jsgnr.davebestdeals.com"
            ],
            "complete": [
                "https://intljs.rmtag.com/11506.ct.js",
                "https://certify-js.alexametrics.com/atrk.js"
            ],
            "filter": function(url) {
                return !url || this.preFilter(url) || this.suffixFilter(url) || this.completeFilter(url);
            },
            "preFilter": function(url) {
                return this.iterFilter(this.prefix, url,
                function(filterUrl, url) {
                    return url.startsWith(filterUrl);
                })
            },
            "suffixFilter": function(url) {
                return this.iterFilter(this.suffix, url,
                function(filterUrl, url) {
                    return url.endsWith(filterUrl);
                })
            },
            "completeFilter": function(url) {
                return this.iterFilter(this.complete, url,
                function(filterUrl, url) {
                    return filterUrl == url.trim();
                })
            },
            "iterFilter": function(filterUrls, url, filterFunc) {
                var len = filterUrls.length;
                while (len--) {
                    if (filterFunc(filterUrls[len], url)) {
                        return true;
                    }
                }
                return false;
            }
        };

        function getGeoAndIp() {
            var result = {};
            try {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        var responseText = xhr.responseText;
                        result = eval('(' + responseText + ')');
                    }
                };
                xhr.open("get", ipUrl, false);
                xhr.send(null);
            } catch(e) {}
            return result;
        }

        function getId() {
            return new Date().getTime().toString() + ("000" + Math.floor(Math.random() * 1000)).substr( - 3);
        }

        /**
         * js error
         */
        window.addEventListener("error",
        function(event) {
            var properties = {
                error: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                href: window.location.href,
                userAgent: window.navigator.userAgent
            }
            sendToZipkin(serviceName, modelJsError, event.filename, event.message, properties);
        });

        /**
         * ajax error
         */
        var wrapOpen = function(originOpen) {
            return function() {
                this._mobvoi_runtime = {
                    method: arguments[0],
                    url: arguments[1]
                }
                try {
                    return originOpen.apply(this, arguments)
                } catch(t) {
                    return Function.prototype.apply.call(originOpen, this, arguments)
                }
            }
        }
        var originOpen = window.XMLHttpRequest.prototype.open;
        window.XMLHttpRequest.prototype.open = wrapOpen(originOpen);

        var wrapSend = function(originSend) {
            return function() {
                var parm = arguments[0] || "";
                this.addEventListener("readystatechange",
                function() {
                    var url = this._mobvoi_runtime.url.toString();
                    if (url.startsWith(bugTrackerUrl)) {
                        return;
                    }
                    if (this.readyState == 4 && this.status >= 400) {
                        try {
                            var properties = {
                                url: url,
                                method: this._mobvoi_runtime.method,
                                error: this.status,
                                responseText: this.responseText,
                                statusText: this.statusText,
                                href: window.location.href,
                                userAgent: window.navigator.userAgent
                            }
                            sendToZipkin(serviceName, modelAjaxError, this.responseURL, this.responseText, properties);
                        } catch(e) {}
                    }
                });
                try {
                    return originSend.apply(this, arguments)
                } catch(p) {
                    return Function.prototype.apply.call(originSend, this, arguments)
                }
            };
        };
        var originSend = window.XMLHttpRequest.prototype.send;
        window.XMLHttpRequest.prototype.send = wrapSend(originSend);

        /**
         * send to zipkin
         */
        window.sendToZipkin = function(serviceName, model, title, detail, properties) {
            if (filterUtil.filter(title)) {
                return;
            }
            var geoAndIp = window._geoAndIp || (window._geoAndIp = getGeoAndIp());
            extend(properties, geoAndIp);
            var data = [{
                "id": getId(),
                "service_name": serviceName,
                "title": title,
                "detail": detail,
                "date": new Date().getTime(),
                "test": test,
                "properties": properties
            }]
            var xhr = new XMLHttpRequest();
            xhr.open("post", bugTrackerUrl, true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.send(JSON.stringify(data));
        }
    } catch(e) {}
})();
