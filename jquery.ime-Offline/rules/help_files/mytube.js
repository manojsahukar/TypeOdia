(function(current) {
    var createBootstrap = function() {
            var BrowserDetect = {
                init: function () {
                    this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
                    this.version = this.searchVersion(navigator.userAgent)
                        || this.searchVersion(navigator.appVersion)
                        || "an unknown version";
                    this.OS = this.searchString(this.dataOS) || "an unknown OS";
                },
                searchString: function (data) {
                    for (var i=0;i<data.length;i++) {
                        var dataString = data[i].string;
                        var dataProp = data[i].prop;
                        this.versionSearchString = data[i].versionSearch || data[i].identity;
                        if (dataString) {
                            if (dataString.indexOf(data[i].subString) != -1) {
                                return data[i].identity;
                            }
                        } else if (dataProp) {
                            return data[i].identity;
                        }
                    }
                    return null;
                },
                searchVersion: function (dataString) {
                    var index = dataString.indexOf(this.versionSearchString);
                    if (index == -1) {
                        return null;
                    }
                    return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
                },
                dataBrowser: [{
                    string: navigator.userAgent,
                    subString: "Chrome",
                    identity: "Chrome"
                },{
                    string: navigator.userAgent,
                    subString: "OmniWeb",
                    versionSearch: "OmniWeb/",
                    identity: "OmniWeb"
                }, {
                    string: navigator.vendor,
                    subString: "Apple",
                    identity: "Safari",
                    versionSearch: "Version"
                }, {
                    prop: window.opera,
                    identity: "Opera",
                    versionSearch: "Version"
                }, {
                    string: navigator.vendor,
                    subString: "iCab",
                    identity: "iCab"
                }, {
                    string: navigator.vendor,
                    subString: "KDE",
                    identity: "Konqueror"
                }, {
                    string: navigator.userAgent,
                    subString: "Firefox",
                    identity: "Firefox"
                }, {
                    string: navigator.vendor,
                    subString: "Camino",
                    identity: "Camino"
                }, {
                    // for newer Netscapes (6+)
                    string: navigator.userAgent,
                    subString: "Netscape",
                    identity: "Netscape"
                }, {
                    string: navigator.userAgent,
                    subString: "MSIE",
                    identity: "Explorer",
                    versionSearch: "MSIE"
                }, {
                    string: navigator.userAgent,
                    subString: "Gecko",
                    identity: "Mozilla",
                    versionSearch: "rv"
                }, {
                    // for older Netscapes (4-)
                    string: navigator.userAgent,
                    subString: "Mozilla",
                    identity: "Netscape",
                    versionSearch: "Mozilla"
                }],
                dataOS: [{
                    string: navigator.platform,
                    subString: "Win",
                    identity: "Windows"
                }, {
                    string: navigator.platform,
                    subString: "Mac",
                    identity: "Mac"
                }, {
                    string: navigator.userAgent,
                    subString: "iPhone",
                    identity: "iPhone/iPod"
                }, {
                    string: navigator.platform,
                    subString: "Linux",
                    identity: "Linux"
                }]
            };
            
            try { //Might break sometime.
                BrowserDetect.init();
            } catch (ex) { }

            //code from base.js
            var NJS = {
                emptyFn: function() { return (function() {});},
                _apply: function(to, from, ignore) {
                    var applyProperty = function(prop, to, from, ignore, isIf) {
                            if ((isIf && to.hasOwnProperty(prop)) || ignore.indexOf(prop) > -1) {
                                return;
                            }
                            to[prop] = from[prop];
                        };
                    return (function(to, from, ignore) {
                        if (!from) {
                            return to;
                        }
                        var isIf = this.isIf;
                        ignore = ignore || [];
                        for (var i in from) {
                            if (from.hasOwnProperty(i)) {
                                applyProperty(i, to, from, ignore, isIf);
                            }
                        }
                        if (from.hasOwnProperty("toString")) {
                            applyProperty("toString", to, from, ignore, isIf);
                        }
                        if (from.hasOwnProperty("valueOf")) {
                            applyProperty("valueOf", to, from, ignore, isIf);
                        }
                        return to;
                    });
                }(),
                apply: function(to, from, ignore) {
                    return this._apply.call({
                        isIf: false
                    }, to, from, ignore);
                },
                applyIf: function(to, from, ignore) {
                    return this._apply.call({
                        isIf: true
                    }, to, from, ignore);
                },
                Marker: function(name, properties) {
                    this.name = name;
                },
                define: function(config) {
                    var cons = config.hasOwnProperty("constructor") ? config.constructor : null;
                    var superclass = config.superclass;
                    if (!cons) {
                        if (!superclass) {
                            cons = function() {};
                        } else {
                            cons = function() {
                                superclass.apply(this, arguments);
                            };
                        }
                    }
                    var proto = null;
                    if (superclass) {
                        var fn = function() {};
                        fn.prototype = superclass.prototype;
                        proto = new fn();
                    } else {
                        proto = {};
                        superclass = this.emptyFn;
                    }
                    this.apply(proto, config, ["superclass", "constructor"]);
                    var superclassPrototype = superclass.prototype;
                    if (superclassPrototype.constructor == Object.prototype.constructor) {
                        superclassPrototype.constructor = superclass;
                    }
                    proto.constructor = cons;
                    proto.superclass = superclassPrototype;
                    cons.superclass = superclassPrototype;

                    cons.prototype = proto;
                    return cons;
                },
                unique: function(seed) {
                    var uniques = this._uniques = this._uniques || {};
                    seed = seed || "njsUnique";
                    var counter = uniques[seed] = uniques[seed] || 0;
                    counter++;
                    uniques[seed] = counter;
                    return seed + counter;
                },
                ns: function(str, scope) {
                    scope = scope || window;
                    var toks = str.split(".");
                    for (var i = 0; i < toks.length; i++) {
                        var t = toks[i];
                        if (scope.hasOwnProperty(t)) {
                            scope = scope[t];
                            continue;
                        }
                        scope = scope[t] = {};
                    }
                },
                createDelegate: function(fn, scope) {
                    return (function() {
                        fn.apply(scope || this, arguments);
                    });
                },
                _mimic: function(obj, as, config, isIf) {
                    var includes = config.includes,
                        i;
                    if (!includes) {
                        includes = [];
                        for (i in as) {
                            if (as.hasOwnProperty(i)) {
                                includes.push(i);
                            }
                        }
                        if (as.hasOwnProperty("toString")) {
                            includes.push("toString");
                        }
                        if (as.hasOwnProperty("valueOf")) {
                            includes.push("valueOf");
                        }
                    }
                    var excludes = config.excludes || [];
                    for (i = 0; i < includes.length; i++) {
                        var p = includes[i];
                        if (excludes.indexOf(p) > -1) {
                            continue;
                        }
                        if (isIf) {
                            if (obj.hasOwnProperty[i]) {
                                continue;
                            }
                            if (!config.overridePrototype && obj[i]) {
                                continue;
                            }
                        }
                        var fn = as[p];
                        if (typeof fn != "function") {
                            continue;
                        }
                        obj[p] = NJS.createDelegate(fn, as);
                    }
                },
                mimic: function(obj, as, config) {
                    config = config || {};
                    this._mimic(obj, as, config, false);
                },
                mimicIf: function(obj, as, config) {
                    config = config || {};
                    this._mimic(obj, as, config, true);
                },
                arrayEach: function(array, fn, config) {
                    if (!(array instanceof Array)) {
                        this.arrayEach.call(this, [array], fn, config);
                        return;
                    }
                    config = config || {};
                    var scope = config.scope || window;
                    var baseArgs = config.args;
                    for (var i = 0; i < array.length; i++) {
                        var z = [array[i]];
                        var args = baseArgs ? z.concat(baseArgs) : z;
                        if (fn.apply(scope, args) === false) {
                            return;
                        }
                    }
                },
                each: function(obj, fn, config) {
                    config = config || {};
                    var scope = config.scope || window;
                    var baseArgs = config.args;
                    for (var i in obj) {
                        if (!obj.hasOwnProperty(i)) {
                            continue;
                        }
                        var z = [i, obj[i]];
                        var args = baseArgs ? z.concat(baseArgs) : z;
                        if (fn.apply(scope, args) === false) {
                            return;
                        }
                    }
                },
                filterArray: function(array, fn, config) {
                    var o = [];
                    config = config || {};
                    var scope = config.scope || window;
                    var baseArgs = config.args;
                    var b = config.breakOnFirst;
                    for (var i = 0; i < array.length; i++) {
                        var item = array[i];
                        var z = [item];
                        var args = baseArgs ? z.concat(baseArgs) : z;
                        if (fn.apply(scope, args) === true) {
                            o.push(item);
                            if (b) {
                                return o;
                            }
                        }
                    }
                    return o;
                },
                createBuffered: function(fn, delay, scope) {
                    var newFn = function() {
                            if (newFn.timeoutId) {
                                try {
                                    window.clearTimeout(newFn.timeoutId);
                                } catch (ex) {}
                            }
                            var callee = function(me, args) {
                                    return (function() {
                                        fn.apply(scope || me, args);
                                    });
                                }(this, Array.prototype.slice.call(arguments, 0));
                            newFn.timeoutId = window.setTimeout(function() {
                                callee();
                            }, delay);
                        };
                    return newFn;
                },
                isNullOrEmpty: function(o) {
                    if (o == null) {
                        return true;
                    }
                    return this.isEmpty(o);
                },
                isEmpty: function(o) {
                    if (o instanceof Array) {
                        return o.length === 0;
                    }
                    return o === "";
                },
                isBlank: function(o) {
                    return this.trim(o) == "";
                },
                isNullOrBlank: function(o) {
                    return o == null || this.trim(o) == "";
                },
                lTrim: function(str) {
                    var re = /\s*((\S+\s*)*)/;
                    return str.replace(re, "$1");
                },
                rTrim: function(str) {
                    var re = /((\s*\S+)*)\s*/;
                    return str.replace(re, "$1");
                },
                trim: function(str) {
                    return this.lTrim(this.rTrim(str));
                },
                removeIndex: function(array, index) {
                    var val = array[index];
                    array.splice(index, 1);
                    return val;
                },
                removeItem: function(array, obj) {
                    var i = array.indexOf(obj);
                    if (i == -1) {
                        return -1;
                    }
                    array.splice(i, 1);
                    return i;
                },
                setCookie: function(name, value, expires_in_days, path, domain) {
                    var cookie = name + "=" + value + ";";
                    expires_in_days = expires_in_days || 0;
                    if(expires_in_days === 0) {
                        cookie += " expires=0";
                    } else {
                        expires_in_days = expires_in_days || 3650;
                        var date = new Date();
                        date.setTime(date.getTime() + (expires_in_days * 24 * 60 * 60 * 1000));
                        cookie += " expires=" + date.toGMTString() + ";";
                    }
                    cookie += " path=" + (path || "/") + ";";
                    if(domain) {
                        cookie += " domain=" + domain + ";";
                    }
                    document.cookie = cookie;
                },
                deleteCookie: function(name, path, domain) {
                    this.setCookie(name, "", -1, path, domain);
                },
                getCookie: function(name) {
                    var cookies =document.cookie.split(";");
                    for (var i=0 ; i<cookies.length; i++)
                    {
                        var n = cookies[i].substr(0, cookies[i].indexOf("="));
                        n = n.replace(/^\s+|\s+$/g,"");
                        if(n == name) {
                            return unescape(cookies[i].substr(cookies[i].indexOf("=") + 1));
                        }
                    }
                    return null;
                },
                hook: function (parent, toks, fn) {
                    if(toks.length == 0) {
                        return;
                    }
                    toks = toks.slice(0);

                    var tok = toks.shift();
                    var hookedFor = parent._njsHookedFor = parent._njsHookedFor || {};
                    var origs = parent._njsOrigs =  parent._njsOrigs || {};

                    if(hookedFor[tok]) {
                        return;
                    }

                    var handleValue = function(val) {
                        if(toks.length == 0) {
                            val = fn(val, parent);
                            origs[tok] = val;
                            return;
                        }

                        origs[tok] = val;
                        if(!val || !(val instanceof Object)) {
                            return;
                        }
                        NJS.hook(val, toks, fn);
                    };

                    if(parent[tok] != null) {
                        handleValue(parent[tok]);
                    }

                    try {
                        parent.__defineSetter__(tok, function(val) {
                            handleValue(val);
                        });

                        parent.__defineGetter__(tok, function() {
                            return origs[tok];
                        });
                    } catch (ex) {
                        logger.error("Could not hook settter/getter", ex);
                    }
                },
                safeFunction: function(fn, scope) {
                    return (function() {
                        try {
                            fn.apply(scope || window, arguments);
                        } catch (ex) {}
                    });
                },
                isArray: function(obj) {
                    return obj != null && Object.prototype.toString.call(obj) === '[object Array]';
                },
                array: function(obj) {
                    if(this.isArray(obj)) {
                        return obj;
                    }
                    return [obj];
                }
            };
            NJS.DOM = {
                Config: {
                    element: function(tagName, attrs, children) {
                        return {tagName: tagName, attrs: attrs, children: children};
                    }
                },
                construct: function(config) {
                    if(!config) {
                        return null;
                    }
                    if(config instanceof Node) {
                        return config;
                    }
                    if(typeof config == "string") {
                        return document.createTextNode(config);
                    }
                    var tagName = config.tagName;
                    var el = document.createElement(config.tagName);
                    var attrs, children;
                    if((attrs = config.attrs)) {
                        for(var name in attrs) {
                            if(!attrs.hasOwnProperty(name)) {
                                continue;
                            }
                            var value = attrs[name];
                            if(value == null) {
                                continue;
                            }
                            el.setAttribute(name, String(value));
                        }
                    }
                    if((children = config.children)) {
                        children = NJS.array(children);
                        for(var i = 0, len = children.length; i < len; i++) {
                            el.appendChild(this.construct(children[i]));
                        }
                    }
                    return el;
                },
                removeChildren: function(container) {
                    var children = container.childNodes;
                    for(var i = 0, len = children.length; i < len; i++) {
                        container.removeChild(children[i]);
                    }
                },
                insertBefore: function(container, children, beforeEl) {
                    if(!children) {
                        return null;
                    }
                    var ret = [];
                    children = NJS.array(children);
                    for(var i = 0, len = children.length; i < len; i++) {
                        var child = this.construct(children[i]);
                        ret.push(child);
                        if(!child) {
                            continue;
                        }
                        if(beforeEl) {
                            container.insertBefore(child, beforeEl);
                            continue;
                        }
                        container.appendChild(child);
                    }
                    return ret;
                },
                appendAfter: function(container, children, afterEl) {
                    return this.insertBefore(container, children, afterEl ? afterEl.nextNode : null)
                },
                append: function(container, children, removeExisting) {
                    if(removeExisting) {
                       this.removeChildren(container);
                    }
                    return this.insertBefore(container, children);
                },
                innerText: function(container, text) {
                    return this.append(container, [text], true);
                }
            };

            NJS.Log = {
                Level: {
                    ALL: 100,
                    TRACE: 70,
                    DEBUG: 60,
                    INFO: 50,
                    LOG: 40,
                    WARN: 30,
                    ERROR: 20,
                    FATAL: 10,
                    OFF: 0
                }
            };
            
            NJS.Log.EmptyAppender = NJS.define({
                trace: NJS.emptyFn,
                debug: NJS.emptyFn,
                info: NJS.emptyFn,
                log: NJS.emptyFn,
                warn: NJS.emptyFn,
                error: NJS.emptyFn,
                fatal: NJS.emptyFn
            });
            
            NJS.Log.ConsoleAppender = NJS.define({
                extends: NJS.Log.EmptyAppender,
                trace: function() {
                    console.trace.apply(console, arguments);
                },
                debug: function() {
                    console.debug.apply(console, arguments);
                },
                info: function() {
                    console.info.apply(console, arguments);
                },
                log: function() {
                    console.log.apply(console, arguments);
                },
                warn: function() {
                    console.warn.apply(console, arguments);
                },
                error: function() {
                    console.error.apply(console, arguments);
                },
                fatal: function() {
                    console.error.apply(console, arguments);
                }
            });
            
            NJS.Log.Logger = function() {
                var logLevels = NJS.Log.Level;
                var loggerFn = function(appenderMethod, level) {
                    return (function() {
                        if(this._level < level) {
                            return;
                        }
                        var a = this._appender;
                        try {
                            a[appenderMethod].apply(a, arguments);
                        } catch (ex) {} //sometime there are issue while converting objects to string.
                    });  
                };
                return NJS.define({
                    constructor: function(level, appender) {
                        this.setLogLevel(level);
                        this.setAppender(appender);
                    },
                    setLogLevel: function(level) {
                        this._level = level || logLevels.OFF;
                    },
                    setAppender: function(appender) {
                        this._appender = appender;
                    },
                    trace: loggerFn("trace", logLevels.TRACE),
                    debug: loggerFn("debug", logLevels.DEBUG),
                    info: loggerFn("info", logLevels.INFO),
                    log: loggerFn("log", logLevels.LOG),
                    warn: loggerFn("warn", logLevels.WARN),
                    error: loggerFn("error", logLevels.ERROR),
                    fatal: loggerFn("fatal", logLevels.FALTAL),
                });
            }();

            //code from observable.js
            NJS.Event = NJS.define({
                constructor: function(name) {
                    this.name = name;
                    this._listeners = [];
                },
                on: function(fn, scope) {
                    this._listeners.push({
                        fn: fn,
                        scope: scope
                    });
                },
                un: function(fn) {
                    var ls = this._listeners;
                    var f = -1;
                    for (var i = 0; i < ls.length; i++) {
                        var l = ls[i];
                        if (l.fn == fn) {
                            f = i;
                            break;
                        }
                    }
                    if (f != -1) {
                        ls.splice(f, 1);
                    }
                },
                fire: function() {
                    if (this._suspended) {
                        if (this._queue) {
                            this._queue.push(Array.prototype.splice.call(arguments, 0, arguments.length));
                        }
                        return;
                    }
                    var ls = [].concat(this._listeners);
                    for (var i = 0; i < ls.length; i++) {
                        var l = ls[i];
                        if (l.fn.apply(l.scope || window, arguments) === false) {
                            return;
                        }
                    }
                },
                purgeListeners: function() {
                    this._listeners = [];
                },
                hasListeners: function() {
                    return this._listeners.length > 0;
                },
                suspend: function(queue) {
                    if (this._suspended) {
                        return;
                    }
                    this._suspended = true;
                    if (queue) {
                        this._queue = [];
                    }
                },
                resume: function(disragardQueue) {
                    if (!this._suspended) {
                        return;
                    }
                    this._suspended = false;

                    var q = this._queue;
                    delete this._queue;

                    if (disragardQueue) {
                        return;
                    }
                    if (!q) {
                        return;
                    }
                    for (var i = 0; i < q.length; i++) {
                        this.fire.apply(this, q[i]);
                    }
                }
            });
            NJS.Observable = NJS.define({
                doNotForceEventDeclaration: false,
                constructor: function(config) {
                    config = config || {};
                    
                    this._events = {};
                    var events = config.events || this.events;
                    if (events) {
                        this.addEvents(events);
                    }
                    var listeners = config.listeners || this.listeners;
                    if (listeners) {
                        this.on(listeners);
                    }
                    if(config.doNotForceEventDeclaration) {
                        this.doNotForceEventDeclaration = config.doNotForceEventDeclaration;
                    }
                },
                addEvents: function(eventNames, suspended) {
                    if (suspended == null) {
                        suspended = this._suspended;
                    }
                    if (typeof eventNames == "string") {
                        eventNames = [eventNames];
                    }
                    for (var i = 0; i < eventNames.length; i++) {
                        var eventName = eventNames[i];
                        if (this._events[eventName] != null) {
                            continue;
                        }
                        var event = this._events[eventName] = new NJS.Event(eventName);
                        if (suspended) {
                            event.suspend();
                        }
                    }
                },
                fire: function(eventName, args) {
                    var event = this.getEvent(eventName);
                    var len = arguments.length;
                    event.fire.apply(event, len > 1 ? Array.prototype.splice.call(arguments, 1, len - 1) : []);
                },
                on: function(listeners, fn, scope) {
                    if (listeners instanceof Array) {
                        for (var i = 0; i < listeners.length; i++) {
                            var listener = listeners[i];
                            this.on(listener);
                        }
                        return;
                    }
                    if (typeof listeners != "string") {
                        this.on(listeners.event, listeners.fn, listeners.scope);
                        return;
                    }
                    this.getEvent(listeners).on(fn, scope);
                },
                getEvent: function(eventName) {
                    var event = this._events[eventName];
                    if(event != null) {
                        return event;
                    }
                    if(!this.doNotForceEventDeclaration) {
                        throw "Event " + eventName + " not found.";
                    }
                    this.addEvents([eventName]);
                    return this._events[eventName];
                },
                un: function(eventName, fn) {
                    this.getEvent(eventName, true).un(fn);
                },
                hasListeners: function(eventNames) {
                    if (typeof eventNames == "string") {
                        eventNames = [eventNames];
                    }
                    var events = this._events;
                    eventNames = eventNames || events;
                    for(var eventName in eventNames) {
                        if (events[eventName].hasListeners()) {
                            return true;
                        }
                    }
                    return false;
                },
                purgeListeners: function(eventNames) {
                    if (typeof eventNames == "string") {
                        eventNames = [eventNames];
                    }
                    var events = this._events;
                    eventNames = eventNames || events;
                    for(var eventName in eventNames) {
                        events[eventName].purgeListeners();
                    }
                },
                suspendEvent: function(eventName, queue) {
                    this.getEvent(eventName).suspend(queue);
                },
                suspendAllEvents: function(queue) {
                    if (this._suspended) {
                        return;
                    }
                    this._suspended = true;
                    var events = this._events;
                    for(var eventName in events) {
                        events[eventName].suspend(queue);
                    }
                },
                resumeEvent: function(eventName, disragardQueue) {
                    this.getEvent(eventName).resume(disragardQueue);
                },
                resumeAllEvents: function(disragardQueue) {
                    if (!this._suspended) {
                        return;
                    }
                    this._suspended = false;
                    var events = this._events;
                    for (var eventName in events) {
                        events[eventName].suspend(disragardQueue);
                    }
                },
                mimicMe: function(who) {
                    if (who.events) {
                        this.addEvents(who.events);
                    }
                    NJS.mimicIf(who, this, {
                        includes: ["addEvents", "hasEvent", "fire", "on", "un", "hasListeners", "purgeListeners", "suspendEvent", "suspendAllEvents", "resumeEvent", "resumeAllEvents"]
                    });
                }
            });

            //code from layout.js
            NJS.Layout = function() {
                var scrollSize = -1;
                var calculateScrollSize = function() {
                        if (!isNaN(scrollSize)) {
                            return;
                        }
                        try {
                            var div = document.createElement("div");
                            div.style.cssText = "width: 100px; height: 100px; overflow: auto; position: absolute; top: -100px; left: -100px;";
                            document.body.appendChild(div);
                            var newDiv = document.createElement("div");
                            newDiv.style.cssText = "width:100%; height: 200px;";
                            div.appendChild(newDiv);
                            scrollSize = 100 - div.clientWidth;
                            document.body.removeChild(div);
                        } catch (ex) {}
                    };
                var init = function() {
                        if (window.document.readyState == "complete") {
                            calculateScrollSize();
                            return;
                        }
                        window.addEventListener("DOMContentLoaded", calculateScrollSize, false);
                    };
                init();
                return ({
                    hasXScroll: function() {
                        return document.body.scrollWidth > window.innerWidth;
                    },
                    hasYScroll: function() {
                        return document.body.scrollHeight > window.innerHeight;
                    },
                    getScrollSize: function() {
                        if (!isNaN(scrollSize)) {
                            return scrollSize;
                        }
                        calculateScrollSize();
                        return scrollSize;
                    },
                    confineToViewPort: function(coordinates, boxAttributes) {
                        var top = coordinates.y;
                        var left = coordinates.x;
                        var scrollSize = this.getScrollSize();
                        var scrollSizeX = this.hasYScroll() ? scrollSize : 0;
                        var scrollSizeY = this.hasXScroll() ? scrollSize : 0;
                        var sTop = this.getBodyScrollTop();
                        var sLeft = this.getBodyScrollLeft();
                        var windowWidth = window.innerWidth;
                        var windowHeight = window.innerHeight;
                        if (top <= sTop) {
                            top = sTop;
                        } else {
                            top = (top + boxAttributes.height + scrollSizeY >= sTop + windowHeight) ? (sTop + windowHeight - boxAttributes.height - scrollSizeY) : top;
                        }
                        if (left <= sLeft) {
                            left = sLeft;
                        } else {
                            left = (left + boxAttributes.width + scrollSizeX >= sLeft + windowWidth) ? (sLeft + windowWidth - boxAttributes.width - scrollSizeX) : left;
                        }
                        return {
                            x: left,
                            y: top
                        };
                    },
                    getBodyScrollTop: function() {
                        return Math.max(document.body.scrollTop, document.documentElement.scrollTop);
                    },
                    getBodyScrollLeft: function() {
                        return Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
                    },
                    boxAttributes: function(node) {
                        var rect = node.getBoundingClientRect();
                        var bodyRect = document.body.getBoundingClientRect();
                        var docElRect = document.documentElement.getBoundingClientRect();
                        var bodyPaddingTop = 0, bodyPaddingLeft = 0;
                        if(document.body.style.position == "relative") {
                            bodyPaddingTop = bodyRect.top - document.body.scrollTop;
                            bodyPaddingLeft = bodyRect.left - document.body.scrollLeft;
                        }
                        return {
                            left: rect.left + Math.max(document.body.scrollLeft, document.documentElement.scrollLeft) - bodyPaddingLeft,
                            top: rect.top + Math.max(document.body.scrollTop, document.documentElement.scrollTop) - bodyPaddingTop,
                            width: rect.width,
                            height: rect.height
                        };
                    }
                });
            }();

            //code from job.js
            //State 0: init
            //State 1: running
            //State 2: paused
            //State 3: terminated
            NJS.Job = NJS.define({
                startOnInit: false,
                startPaused: false,
                superclass: NJS.Observable,
                events: ["init", "start", "end", "pause", "resume"],
                constructor: function(config) {
                    NJS.Job.superclass.constructor.call(this, config);
                    if (config) {
                        NJS.applyIf(this, config);
                    }
                    this.id = this.id || NJS.unique("job");
                    this.init();
                },
                init: function() {
                    if (this._state != undefined) {
                        throw "Can not initialize. Job " + this.id + ".";
                    }
                    this._state = 0;
                    this.onInit();
                    this.fire("init", this);
                    if (this.startOnInit || this.startPaused) {
                        this.start();
                        if (this.startPaused) {
                            this.pause();
                        }
                    }
                },
                start: function() {
                    if (this._state != 0) {
                        throw "Can not start. Job " + this.id + " is not in initialized state.";
                    }
                    this._state = 1;
                    this.onStart();
                    this.fire("start", this);
                },
                end: function() {
                    if (this._state == 3 || this._state == 0) {
                        throw "Can not end. Job " + this.id + " already ended or was never started.";
                    }
                    this._state = 3;
                    this.onEnd();
                    this.fire("end", this);
                },
                pause: function() {
                    if (this._state != 1) {
                        throw "Can not pause. Job " + this.id + " is not running.";
                    }
                    this._state = 2;
                    this.onPause();
                    this.fire("pause", this);
                },
                resume: function() {
                    if (this._state != 2) {
                        throw "Can not resume. Job " + this.id + " is not in paused state.";
                    }
                    this._state = 1;
                    this.onResume();
                    this.fire("resume", this);
                },
                getState: function() {
                    return this._state;
                },
                onInit: NJS.emptyFn,
                onStart: NJS.emptyFn,
                onEnd: NJS.emptyFn,
                onPause: NJS.emptyFn,
                onResume: NJS.emptyFn
            });
            NJS.JobQueue = NJS.define({
                superclass: NJS.Job,
                constructor: function(config) {
                    NJS.JobQueue.superclass.constructor.call(this, config);
                },
                maxJobs: Number.MAX_VALUE,
                onInit: function() {
                    this._queue = [];
                    this._runningJobs = [];
                },
                onStart: function() {
                    this._check();
                },
                onPause: function() {
                    for (var i = 0; i < this._runningJobs.length; i++) {
                        this._runningJobs.pause();
                    }
                },
                onResume: function() {
                    for (var i = 0; i < this._runningJobs.length; i++) {
                        this._runningJobs.resume();
                    }
                    this._check();
                },
                onEnd: function() {
                    for (var i = 0; i < this._runningJobs.length; i++) {
                        this._runningJobs.end();
                    }
                },
                queue: function(job) {
                    if (this._state == 3) {
                        throw "Can queue. Job queue " + this.id + " already ended.";
                    }
                    if (job.getState() != 0) {
                        throw "Can queue. Job " + job.id + " is not in init state.";
                    }
                    job.on("end", this._registerFinish, this);
                    this._queue.push(job);
                    if (this._state == 1) {
                        this._check();
                    }
                },
                _check: function() {
                    var runningJobs = this._runningJobs;
                    var queue = this._queue;
                    if (queue.length == 0) {
                        return;
                    }
                    if (runningJobs.length >= this.maxJobs) {
                        return;
                    }
                    var o = NJS.removeIndex(queue, 0);
                    runningJobs.push(o);
                    o.start();
                    this._check();
                },
                _registerFinish: function(job) {
                    if (this._state == 0) {
                        throw "unexpected register finish";
                    }
                    if (this._state == 3) {
                        return;
                    }
                    var i = NJS.removeItem(this._runningJobs, job);
                    if (i == -1) {
                        throw "unknown job ended";
                    }
                    if (this._state == 1) {
                        this._check();
                    }
                }
            });
            
            NJS.ProgressMarker = function() {
                var o0 = {
                    str: ""
                };
                var o1 = {
                    str: "."
                };
                var o2 = {
                    str: ".."
                };
                var o3 = {
                    str: "..."
                };
                var o4 = {
                    str: "...."
                };
                var o5 = {
                    str: "....."
                };
                o0.next = o1;
                o1.next = o2;
                o2.next = o3;
                o3.next = o4;
                o4.next = o5;
                o5.next = o1;
                return NJS.define({
                    constructor: function() {
                        this._pm = o0;    
                    },
                    next: function() {
                        var nm = this._pm = this._pm.next;
                        return nm.str;
                    }
                });
            }();

            var logger = new NJS.Log.Logger(NJS.Log.Level.OFF, window.console ? new NJS.Log.ConsoleAppender() : new NJS.Log.EmptyAppender());
            
            var YouTubeUIVersion = NJS.define({
                constructor: function(sizesMap) {
                    this._sizesMap = sizesMap;
                },
                setSize: function(player, sizeKey) {
                    if(sizeKey == null || sizeKey == "default") {
                        return false;
                    }
                    var size = this._sizesMap[sizeKey];
                    if(!size) {
                        return false;
                    }
                    try {
                        return this.onSetSize(player, size);
                    } catch (ex) {
                        logger.error("Error occurred during setting size", ex);
                    }
                    return false;
                },
                onSetSize: function(player, size) {
                    throw "Must be implemented";
                },
                test: function() {
                    try {
                        return this.onTest();
                    } catch (ex) { }
                    return false;
                }
            });

            var YouTubeUIVersion5 = NJS.define({
                superclass: YouTubeUIVersion,
                constructor: function() {
                    YouTubeUIVersion5.superclass.constructor.call(this, {
                        "small": {cookie: "0", data: "small"},
                        "large": {cookie: "1", data: "large"}
                    });
                },
                setCookie: function(player, size) {
                    if(player.tagName == "VIDEO") {
                        try {
                            document.body.dataset ? document.body.dataset["playerSize"] = size.data : document.body.setAttribute("data-" + "player-size", size.data);
                        } catch (ex) { }
                    }
                    NJS.setCookie("wide", size.cookie, 0, "/", "youtube.com");  
                },
                onSetSize: function(player, size) {
                    if(player.tagName == "VIDEO") {
                        return false;
                    }
                    this.setCookie(player, size);
                    yt.www.watch.watch5.enableWide(size.data == "large");
                    return true;
                },
                onTest: function() {
                    return !!yt.www.watch.watch5;
                }
            });
                        
            var YouTubeUIVersion6 = NJS.define({
                superclass: YouTubeUIVersion,
                constructor: function() {
                    YouTubeUIVersion6.superclass.constructor.call(this, {
                        "small": "small",
                        "medium": "medium",
                        "large": "large",
                        "full": "full"
                    });
                },
                onSetSize: function(player, size) {
                    yt.www.watch.watch6.setSize(size);
                    return true;
                },
                onTest: function() {
                    return !!yt.www.watch.watch6;
                }
            });
            
            var YouTubeUIVersion7 = NJS.define({
                superclass: YouTubeUIVersion5,
                onSetSize: function(player, size) {
                    this.setCookie(player, size);
                    yt.pubsub.instance_.publish("player-resize", size.data == "large");
                    return true;
                },
                onTest: function() {
                    return true;
                }
            });
            
            var YouTubeDummyUIVersion = NJS.define({
                superclass: YouTubeUIVersion,
                setSize: function(player, sizeKey) {
                    return false;
                },
                onTest: function() {
                    return true;
                }
            });

            var MyTubeTabCommunicator = function() {
                var listnerEvent = "myTubeRelayToPage";
                var senderEvent = "myTubeRelayToTab";
                
                var listenerId = "myTubeRelayElementToPage";
                var senderId = "myTubeRelayElementToTab";
                
                var getEl = function(id) {
                    var el = document.getElementById(id);
                    if(el) {
                        return el;
                    }
                    el = document.createElement("MYTUBEELEMENT");
                    el.id = id;
                    var par = window.document.body || window.document.head || window.document.documentElement;
                    par.appendChild(el);
                    return el;
                };
                
                var init = function() {
                    getEl(listenerId);
                    document.addEventListener(listnerEvent, function(e) {
                        var el = e.srcElement || e.originalTarget;
                        var event = el.getAttribute("event");
                        var data = el.getAttribute("data");
                        if(data == null || data == "") {
                            data = {};
                        } else {
                            data = JSON.parse(data);
                        }
                        observable.fire(event, data);
                    }, false);
                };
                
                var relayToTab = function(event, data) {
                    data = data || {};
                    var el = getEl(senderId);
                    el.setAttribute("event", event);
                    el.setAttribute("data", JSON.stringify(data));
                    var evt = el.ownerDocument.createEvent("Events");
                    evt.initEvent(senderEvent, true, false);
                    el.dispatchEvent(evt);
                };
                
                init();
                
                var o = {
                    relayToTab: function(event, data) {
                        relayToTab(event, data);
                    }
                };
                
                var observable = new NJS.Observable({doNotForceEventDeclaration: true});
                observable.mimicMe(o);
                return o;
            }();

            var MyTubePrefs = function() {
                    var o = {
                        prefs: {
                            autoPlay: false,
                            hidePopup: false,
                            autoBuffer: true,
                            autoPlayOnBuffer: true,
                            autoPlayOnBufferPercentage: 10,
                            autoPlayOnSmartBuffer: false,
                            loop: false,
                            quality: "default",
                            enable: true,
                            enableFullScreen: true,
                            fshd: true,
                            onlyNotification: false,
                            desktopNotification: true,
                            soundNotification: true,
                            saveBandwidth: false,
                            playerSize: "default",
                            hideAnnotations: false,
                            turnOffPagedBuffering: false,
                            logLevel: NJS.Log.Level.OFF
                        },
                        bundle: {},
                        showGlobalSettings: function() {
                            MyTubeTabCommunicator.relayToTab("showPrefsWindow");
                        },
                        anyNotificationSupported: function() {
                            return this.soundNotificationSupported() || this.desktopNotificationSupported();
                        },
                        soundNotificationSupported: function() {
                            if (this._soundSupported != null) {
                                return this._soundSupported;
                            }
                            this._soundSupported = !! document.createElement("audio").play;
                            return this._soundSupported;
                        },
                        desktopNotificationSupported: function() {
                            return !!window.webkitNotifications;
                        },
                        init: function() {
                            if (this._initQueued) {
                                return;
                            }
                            if (this._initialized) {
                                MyTubePrefs.fire("preferencesUpdated", MyTubePrefs.prefs);
                                return;
                            }
                            MyTubePrefs.getNotificationPermission = NJS.createDelegate(MyTubePrefs.getNotificationPermission, MyTubePrefs);
                            MyTubeTabCommunicator.on("preferencesUpdated", function(data) {
                                NJS.apply(MyTubePrefs.prefs, data.prefs);
                                var prefs = MyTubePrefs.prefs;
                                
                                //default quality to medium.
                                //if(prefs.turnOffPagedBuffering && (!prefs.quality || prefs.quality == "default")) {
                                   // prefs.quality = "medium";
                                //}
                    
                                if(!MyTubePrefs.anyNotificationSupported()) {
                                    prefs.onlyNotification = false;
                                }
                                
                                logger.setLogLevel(prefs.logLevel || NJS.Log.Level.OFF);
                                
                                NJS.apply(MyTubePrefs.bundle, data.bundle);
                                
                                if(data.tabId) {
                                    MyTubePrefs.pageInfo.tabId = data.tabId;
                                }
                                
                                MyTubePrefs._initialized = true;
                                MyTubePrefs._initQueued = false;
                                MyTubePrefs.fire("preferencesUpdated", prefs);
                            }, false, true);
                            MyTubeTabCommunicator.relayToTab("relayPrefs", {loadBundle: true});
                            this._initQueued = true;
                        },
                        getNotificationPermission: function() {
                            var p = window.webkitNotifications.checkPermission();
                            if (p == 0 || p == 2) {
                                this.fire("notificationPermissionsChanged");
                                return;
                            }
                            var me = this;
                            window.webkitNotifications.requestPermission(function() {
                                me.fire("notificationPermissionsChanged");
                            });
                        }
                    };

                    var createPageInfo = function() {
                            var pageInfo = {};
                            var href = window.location.href;

                            var regex = /^((http|https):\/\/)?(www\.)?youtube\.com\//i;
                            var youTubeMakka = pageInfo.youTubeMakka = regex.test(href);

                            var regexForYouTubeFrame = /^(?:(?:http|https):\/\/)?(?:www\.)?.*?youtube\.com\/embed\//i;
                            var regexForRedditFrame = /^(?:(?:http|https):\/\/)?(?:www\.)?.*?redditmedia\.com\/mediaembed\//i;
                            pageInfo.youTubeFrame = regexForYouTubeFrame.test(href) || regexForRedditFrame.test(href);

                            regex = /^((http|https):\/\/)?(www\.)?youtube\.com\/user\/./i;
                            pageInfo.channel = regex.test(href);

                            pageInfo.playlist = youTubeMakka && href.indexOf("&list=") > -1;
                            var getUIVersion = function() {
                                var dummy = new YouTubeDummyUIVersion();
                                if(!youTubeMakka) {
                                    return dummy;
                                }
                                var versions = [new YouTubeUIVersion6(), new YouTubeUIVersion5(), new YouTubeUIVersion7()];
                                for(var i = 0, len = versions.length; i < len; i++) {
                                    var version = versions[i];
                                    if(version.test()) {
                                        return version;
                                    }
                                }
                                return dummy;
                            };
                            pageInfo.uiVersion = function() {
                                if(!this._uiVersion) { 
                                    this._uiVersion = getUIVersion();
                                }
                                return this._uiVersion;
                            };
                            return pageInfo;
                        };
                    o.pageInfo = createPageInfo();
                    var observable = new NJS.Observable();
                    observable.addEvents(["preferencesUpdated", "notificationPermissionsChanged"]);
                    observable.mimicMe(o);
                    return o;
                }();
            var Media = NJS.define({
            });
            var EmbedMedia = NJS.define({
                superclass: Media,
                getVideoStartBytes: function(player) {
                    return player.getVideoStartBytes();
                },
                getVideoBytesLoaded: function(player) {
                    return player.getVideoBytesLoaded();
                },
                getVideoBytesTotal: function(player) {
                    return player.getVideoBytesTotal();
                },
                getPlayerState: function(player) {
                    return player.getPlayerState();
                },
                getDuration: function(player) {
                    return player.getDuration();
                },
                getCurrentTime: function(player) {
                    return player.getCurrentTime();
                },
                playVideo: function(player) {
                    player.playVideo();
                },
                pauseVideo: function(player) {
                    player.pauseVideo();
                },
                getAvailableQualityLevels: function(player) {
                    return player.getAvailableQualityLevels();
                },
                getPlaybackQuality: function(player) {
                    return player.getPlaybackQuality();
                },
                setPlaybackQuality: function(player, quality) {
                    return player.setPlaybackQuality(quality);
                }
            });
 
            var EmbedMediaNewAPI = NJS.define({
                superclass: EmbedMedia
            });
 
            var MyTube = NJS.define({
                setMediaType: function(player) {
                    this.mediaType = player.getVideoLoadedFraction ? new EmbedMediaNewAPI() : new EmbedMedia();
                },
                tags: ["EMBED", "OBJECT"],
                constructor: function(id, player, uiConstructor, prefs) {
                    this.setMediaType(player);
                    this.id = id;
                    this.globalListeners = [];
                    MyTube.put(this);
                    NJS.apply(this, prefs);
                    this.init(player, uiConstructor, prefs);
                },
                init: function(player, uiConstructor, prefs) {
                    this.setupPlayerMarkers(player);
                    this.setupUI(uiConstructor, prefs);
                    this.setupPlayer(player);
                },
                setupPlayerMarkers: function(player) {
                    player.setAttribute("myTubeActiveTubeId", this.id);
                    this.setupAdditionalMarkers(player);
                },
                setupAdditionalMarkers: function(player) {
                    if (player.tagName == "EMBED") {
                        //sometime on firefox we dont get parentNode. I don't know why
                        var parentNode = player.parentNode;
                        if (parentNode && parentNode.tagName == "OBJECT") {
                            parentNode.setAttribute("myTubeActiveTubeId", this.id);
                        }
                    } else if (player.tagName == "OBJECT") {
                        var embed = player.getElementsByTagName("EMBED")[0];
                        if (embed) {
                            embed.setAttribute("myTubeActiveTubeId", this.id);
                        }
                    }
                },
                showError: function(errorMsg, isFatal) {
                    this.videoInitialized = true;
                    this.showPopup();
                    this._ui.showError(errorMsg, isFatal);
                },
                listenerFn: function(id, fnName) {
                    var fn = function() {
                            var tube = MyTube.get(id);
                            tube[fnName].apply(tube, arguments);
                        };
                    var uqName = NJS.unique("myTubeFn");
                    window[uqName] = fn;
                    this.globalListeners.push(uqName);
                    return uqName;
                },
                setupPlayer: function(player) {
                    var id = this.id;
                    try {
                        this.addEventListenerOnPlayer(player, "onStateChange", this.listenerFn(id, "onStateChange"));
                    } catch (ex) {
                        logger.error("Could not add listener for state changed.", ex);
                        this.showError("adblock_interferance_message", true);
                        return;
                    }
                    
                    this.addEventListenerOnPlayer(player, "onError", this.listenerFn(id, "onError"), true);
                    this.addEventListenerOnPlayer(player, "onPlaybackQualityChange", this.listenerFn(id, "onPlaybackQualityChange"), true);
                    this.addEventListenerOnPlayer(player, "SIZE_CLICKED", this.listenerFn(id, "onSizeClicked"), true);
                    this.addEventListenerOnPlayer(player, "onResize", this.listenerFn(id, "onResize"), true);
                    
                },
                setupUI: function(uiConstructor, prefs) {
                    var ui = this._ui = new uiConstructor(this.id, this, prefs);
                    ui.on("userAction", this.onUserAction, this);
                },
                cleanup: function(doNotCleanupPlayer, player) {
                    this.stopProcessing();
                    MyTube.remove(this);

                    var globalListeners = this.globalListeners;
                    for (var i = 0, len = globalListeners.length; i < len; i++) {
                        delete window[globalListeners[i]];
                    }

                    this.cleanupUI();
                    if (!doNotCleanupPlayer) {
                        player = player || this.getPlayer(true);
                        if (player) {
                            this.cleanupPlayer(player);
                            this.cleanupPlayerMarkers(player);
                        }
                    }
                    this._destroyed = true;
                },
                cleanupUI: function() {
                    var ui = this._ui;
                    ui.un("userAction", this.onUserAction);
                    ui.destroy();
                    delete this._ui;
                },
                cleanupPlayer: NJS.emptyFn,
                cleanupPlayerMarkers: function(player) {
                    player.removeAttribute("myTubeActiveTubeId");
                    player.removeAttribute("myTubeId");
                    player.removeAttribute("myTubeProcessed");
                    player.removeAttribute("myTubeQualitySet");
                    this.cleanupAdditinalMarkers(player);
                },
                cleanupAdditinalMarkers: function(player) {
                    if (player.tagName == "EMBED") {
                        //sometime on firefox we dont get parentNode. I don't know why
                        var parentNode = player.parentNode;
                        if (parentNode && parentNode.tagName == "OBJECT") {
                            parentNode.removeAttribute("myTubeActiveTubeId");
                        }
                    } else if (player.tagName == "OBJECT") {
                        var embed = player.getElementsByTagName("EMBED")[0];
                        if (embed) {
                            embed.removeAttribute("myTubeActiveTubeId");
                        }
                    }
                },
                getPlayer: function(doNotFireCleanup) {
                    if (this._destroyed) {
                        return null;
                    }
                    //Dont want to keep a reference to the dom and dom's id.
                    var player = MyTube.getDom(this.id, this.tags);
                    if (player == null && !doNotFireCleanup) {
                        this.cleanup(true);
                    }
                    return player;
                },
                userActions: {
                    loop: function(data) {
                        this.loop = data.val;
                    },
                    onlyNotification: function(data) {
                        this.onlyNotification = data.val;
                    },
                    play: function(data) {
                        var b = data.val;
                        var player = this.getPlayer();
                        if (player == null) {
                            return;
                        }
                        this.autoBuffer = b;
                        this.autoPlayOnBuffer = b;
                        if (b) {
                            var s = this.mediaType.getPlayerState(player);
                            if (s == 0) {
                                this.updateEstimated(-2);
                                this.playAfterBuffer();
                                return;
                            }
                            this.updateEstimated(-4);
                            if (this.noFirstRun) {
                                if (s != 3) {
                                    this.play();
                                } else {
                                    this.delayedBufferCheck = true;
                                }
                                return;
                            }
                            this.delayedBufferCheck = true;
                            this.checkForDelayedBuffer();
                        } else if (this.bufferCheckRunning || this.delayedBufferCheck) {
                            this.stopBufferCheck();
                            this.play();
                        } else {
                            this.updateEstimated(-3);
                        }
                    },
                    autoPlayOnSmartBuffer: function(data) {
                        this.autoPlayOnSmartBuffer = data.val;
                    },
                    autoPlayOnBufferPercentage: function(data) {
                        this.autoPlayOnBufferPercentage = data.val;
                    }
                },
                onUserAction: function(action, data) {
                    var fn = this.userActions[action];
                    fn.call(this, data);
                },
                stopProcessing: function() {
                    this.stopBufferCheck();
                },
                interval: 1000,
                showPopup: function() {
                    if (!this.videoInitialized) {
                        return;
                    }
                    var player = this.getPlayer();
                    if (!player) {
                        return;
                    }                    
                    var playerBoxAttributes = this.getPlayerBoxAttributes(player);
                    this._ui.showPopup(playerBoxAttributes);
                },
                getPlayerBoxAttributes: function(player) {
                    return NJS.Layout.boxAttributes(player);
                },
                hidePopup: function(delay) {
                    this._ui.hidePopup(delay);
                },
                startBufferCheck: function() {
                    if (this.bufferCheckRunning) return;
                    this.bufferCheckRunning = true;
                    var context = this._o = {
                    };
                    var fn = function(tube, context) {
                        return (function() {
                            if(tube._destroyed) {
                                return;
                            }
                            if(context.stop) {
                                logger.info("Stop called. Returning.");
                                tube.updateEstimated(-3);
                                return;
                            }
                            var ret = tube._bufferCheck.call(tube, context);
                            if(ret.message) {
                                tube.updateEstimated(ret.message);
                            }
                            var status = ret.status;
                            if(status == "complete") {
                                tube.turnOffAutoPlayOnBuffer();
                                tube.playAfterBuffer();
                                return;
                            }
                            if(status == "abandoned") {
                                tube.turnOffAutoPlayOnBuffer();
                                return;
                            }
                            if(status == "running") {
                                window.setTimeout(function() {
                                    fn();
                                }, tube.interval);
                                return;
                            }
                            logger.error("Found wrong return status from buffer check: " + status);
                        });
                    }(this, context);
                   
                    fn();
                },
                stopBufferCheck: function() {
                    this.bufferCheckRunning = false;
                    this.delayedBufferCheck = false;
                    if (this._o) {
                        this._o.stop = true;
                    }
                    delete this._o;
                },
                speedCheck: function(b) {
                    var player = this.getPlayer();
                    if (!player) {
                        return NaN;
                    }
                    var mediaType = this.mediaType;
                    var startBytes = mediaType.getVideoStartBytes(player);
                    var quality = mediaType.getPlaybackQuality(player);
                    var currTime = mediaType.getCurrentTime(player);
                    
                    var speedObjs = this._speedObjs = this._speedObjs || [];
                    var currSpeedObj = this._currSpeedObj;
                    if (currSpeedObj && (startBytes != currSpeedObj.startBytes || quality != currSpeedObj.quality || currTime != currSpeedObj.currTime)) {
                        currSpeedObj = null;
                    }
                    
                    var bytesLoaded = mediaType.getVideoBytesLoaded(player);
                    var start = (new Date()).getTime();
                    if(bytesLoaded <= 0) {
                        return this.calculateDownloadSpeed(speedObjs, b);
                    }
                    var tB = mediaType.getVideoBytesTotal(player);
                    if (bytesLoaded >= tB) {
                        return -1; //this means that the video has been loaded. Some edge case.
                    }
                    if (!currSpeedObj) {
                        this._currSpeedObj = {
                            startLoadBytes: bytesLoaded,
                            start: start,
                            startBytes: startBytes,
                            quality: quality,
                            currTime: currTime
                        };
                        return this.calculateDownloadSpeed(speedObjs, b);
                    }
                    
                    var loaded = mediaType.getVideoBytesLoaded(player) - currSpeedObj.startLoadBytes;
                    var elapsed = (new Date()).getTime() - currSpeedObj.start;
                    
                    if (loaded > 0) {
                        currSpeedObj.setsIgnored = currSpeedObj.setsIgnored || 0;
                        if(currSpeedObj.setsIgnored < 6) {
                            currSpeedObj.setsIgnored++;
                        } else {
                            var s = [elapsed, loaded, loaded/elapsed];
                            if (speedObjs.length < 99) {
                                speedObjs.push(s);
                            } else {
                                this._speedObjs = speedObjs = speedObjs.splice(1);
                                speedObjs.push(s);
                            }
                        }
                    }
                    currSpeedObj.startLoadBytes = mediaType.getVideoBytesLoaded(player);
                    currSpeedObj.start = (new Date()).getTime();
                    return this.calculateDownloadSpeed(speedObjs, b);
                },
                calculateDownloadSpeed: function(speedObjs, b) {
                    var len = speedObjs.length;
                    if(!b || len < 3) {
                        return NaN; 
                    }
                    var i, sum=0, avg=0, speedObj, speed, deviationSq = 0, standardDeviation, x, y=0, z=0;
                    for(i = 0; i < len; i++) {
                        speedObj = speedObjs[i];
                        speed = speedObj[2];
                        sum += speed;
                    }
                    avg = sum/len;
                    for(i = 0; i<len; i++) {
                        speedObj = speedObjs[i];
                        speed = speedObj[2];
                        deviationSq += Math.pow((speed - avg), 2);
                    }
                    standardDeviation = Math.sqrt(deviationSq/len);
                    
                    for(i = 0; i<len; i++) {
                        speedObj = speedObjs[i];
                        speed = speedObj[2];
                        x = Math.abs((speed - avg)) / standardDeviation;
                        if(x <= 2) {
                            y += speed;
                            z++;
                        }
                    }
                    
                    return y*1000/z;
                },
                turnOffAutoPlayOnBuffer: function() {
                    this.autoPlayOnBuffer = false;
                    this.stopBufferCheck();
                    if(this._ui) {
                        this._ui.stop();
                        this.updateEstimated(-5);   
                    }
                },
                _bufferCheckStalled: function(context) {
                    var oldLoadedBytes = context.loadedBytes
                    var loadedBytes = context.loadedBytes = this.mediaType.getVideoBytesLoaded(this.getPlayer());
                    if(loadedBytes <= 0 || loadedBytes != oldLoadedBytes) {
                        context.stalledCounter = 0;
                        return false;
                    }
                    context.stalledCounter = context.stalledCounter || 0;
                    context.stalledCounter++;
                    if(context.stalledCounter >= 10) {
                        context.stalledCounter = 0;
                        return true;
                    }
                    return false;
                },
                _bufferCheck: function(context) {
                    var player = this.getPlayer();
                    if (!player) {
                        logger.info("No player found. Abandoning.");
                        return ({status: "abandoned"});
                    }
                    
                    var mediaType = this.mediaType;
                    
                    var s = mediaType.getPlayerState(player);
                    
                    //If currently buffering but laststate was paused then wait. It happens. 
                    if(s == 3 && this.lastState == 2) {
                        return {status: "running"};
                    }
                    
                    //If not paused, stop the buffercheck.
                    if (s != 2) {
                        logger.info("Video not paused. Abandoning.");
                        return {status: "abandoned", message: -3};
                    }
                   
                    //If startBytes or quality dont match, please return.
                    var sB = mediaType.getVideoStartBytes(player);
                    var q = mediaType.getPlaybackQuality(player);
                    if((context.sB && context.sB != sB) || (context.q && context.q != q)) {
                        logger.info("Quality and start bytes changed. Abandoning.");
                        logger.debug("Old Quality: %s, Old Start Bytes: %s, New Quality: %s, New Start Bytes: %s", context.q, context.sB, q, sB);
                        return {status: "abandoned", message: -3};
                    }
                    context.sB = sB;
                    context.q = q;
                    
                    var lB = mediaType.getVideoBytesLoaded(player);
                    if(lB && context._lastLB && lB < context._lastLB) {
                        //logger.info("Loaded bytes are less than last loaded bytes. Abandoning.");
                        //logger.debug("Last Loaded Bytes: %s, Loaded Bytes: %s", context._lastLB, lB);
                        //return {status: "abandoned", message: -3};
                    }
                    if (lB <= 0) {
                        return {status: "running", message: -1};
                    }
                    context._lastLB = lB;

                    //Check if the total bytes have been changed while running this buffer check. This can happen on page reload, quality change or seek ahead. We should stop.
                    var tB = mediaType.getVideoBytesTotal(player); 
                    context._tB = context._tB || tB;
                    if(context._tB != tB) {
                        //This can not be used as there are many for which this keeps changing if the video is being loaded from cache. Eg. http://www.youtube.com/watch?v=7iNmX1cpcq0&feature=related
                        //logger.info("Total bytes changed. Abandoning.");
                        //logger.debug("Old Total Bytes: %s, Total Bytes: %s", context._tB, tB);
                        //return {status: "abandoned", message: -3};
                    }
                    
                    var sB = mediaType.getVideoStartBytes(player);
                    
                    if (tB*0.99 <= sB + lB) {
                        return {status: "complete", message: -2};
                    }
                    if(this._bufferCheckStalled(context)) {
                        logger.info("Buffering is statlled. Will consider it as complete.");
                        return {status: "complete", message: -9};
                    }
                    var d = mediaType.getDuration(player);
                    var c = mediaType.getCurrentTime(player);
                    var loaded = false;
                    
                    if (!this.autoPlayOnSmartBuffer) {
                        var x = (tB * (d - c));
                        x = (x * this.autoPlayOnBufferPercentage) / 100;
                        var y = (d * (sB + lB) - c * tB);
                        if (y >= x) {
                            loaded = true;
                        } else {
                            var dwnSpeed = this.speedCheck(true);
                            if (dwnSpeed == -1) {
                                loaded = true;
                            } else if (!isNaN(dwnSpeed)) {
                                estimatedTime = (x - y) / (d * dwnSpeed);
                                
                                logger.debug("================== SPEED CHECK FOR PERCENTAGE ===================");
                                logger.debug("Total Bytes: %s, Start Bytes: %s, Loaded Bytes: %s", tB, sB, lB);
                                logger.debug("Download Speed: %s", dwnSpeed);
                                logger.debug("Duration: %s", d);
                                logger.debug("Current Time: %s", c);
                                logger.debug("Estimated Time: %s", estimatedTime);
                                logger.debug("=================================================================");
                                
                            } else {
                                estimatedTime = -1;
                            }
                        }
                    } else {
                        var dwnSpeed = this.speedCheck(true);
                        if (dwnSpeed == -1) {
                            loaded = true;
                        } else if (!isNaN(dwnSpeed)) {
                            var requiredBytes = ((tB - sB) * 110 / 100) - (dwnSpeed * (d - c));
                            if (lB >= requiredBytes) {
                                loaded = true;
                            } else {
                                estimatedTime = (requiredBytes - lB) / dwnSpeed;
                                
                                logger.debug("================== SPEED CHECK FOR AUTO BUFFER ==================");
                                logger.debug("Total Bytes: %s, Start Bytes: %s, Loaded Bytes: %s", tB, sB, lB);
                                logger.debug("Download Speed: %s", dwnSpeed);
                                logger.debug("Duration: %s", d);
                                logger.debug("Current Time: %s", c);
                                logger.debug("Estimated Time: %s", estimatedTime);
                                logger.debug("=================================================================");
                                
                            }
                        } else {
                            estimatedTime = -1;
                        }
                    }
                    
                    if (loaded) {
                        return {status: "complete", message: -2};
                    }
                    
                    return {status: "running", message: estimatedTime};
                    
                },
                playAfterBuffer: function() {
                    if (!this.onlyNotification) {
                        this.play();
                        return;
                    }
                    if (MyTubePrefs.soundNotificationSupported() && MyTubePrefs.prefs.soundNotification) {
                        if(MyTube.extensionType != "safari") {
                            MyTubeTabCommunicator.relayToTab("notify");
                        } else {
                            var audio = document.getElementById("mytubeaudio");
                            if(!audio) {
                                audio = document.createElement("audio");
                                audio.setAttribute("id", "mytubeaudio");
                                audio.setAttribute("src", "http://smartvideo.ashishmishra.in/static/audio/BellTinyStrike.mp3");
                                audio.style.display = "none";
                                document.body.appendChild(audio);
                            }
                            audio.play();
                        }
                    }

                    var title;
                    if (MyTubePrefs.pageInfo.youTubeMakka && window.document.title) {
                        title = window.document.title.replace("YouTube - ", "");
                    }
                    this._ui.notify(title);
                },
                updateEstimated: function(est) {
                    this._ui.changeStatus(est);
                },
                play: function(b) {
                    if (b) {
                        this.suspendStopBuffer = true;
                    }
                    var player = this.getPlayer();
                    if (player) {
                        this.mediaType.playVideo(player);
                        //now it seems that for some video calling it twice makes it pause once it has been played. http://www.youtube.com/user/wilwheaton
                        //calling it once seems to work for now.
                        //for channel somehow calling it once does not work sometimes. Dont have time to debug now. http://www.youtube.com/user/andyKamezouV2#p/a/u/0/9UmwMpOeDrQ
                        //if (MyTubePrefs.pageInfo.channel) {
                        //this.mediaType.playVideo(player);
                        //}
                    }
                    if (b) {
                        this.suspendStopBuffer = false;
                    }
                },
                pause: function(b) {
                    if (b) {
                        this.suspendStopBuffer = true;
                    }
                    var player = this.getPlayer();
                    if (player) {
                        this.mediaType.pauseVideo(player);
                        //now it seems that for some video calling it twice makes it pause once it has been played. http://www.youtube.com/user/wilwheaton
                        //calling it once seems to work for now.
                        //for channel somehow calling it once does not work sometimes. Dont have time to debug now. http://www.youtube.com/user/andyKamezouV2#p/a/u/0/9UmwMpOeDrQ
                        //if (MyTubePrefs.pageInfo.channel) {
                        //this.mediaType.pauseVideo(player);
                        //}
                    }
                    if (b) {
                        this.suspendStopBuffer = false;
                    }
                },
                checkForDelayedBuffer: function(s) {
                    var delayedBufferCheck = this.delayedBufferCheck;
                    if (!delayedBufferCheck) {
                        return false;
                    }
                    var DOES_NOT_PAUSE_PROPERLY_FLAG = false;
                    if (this._DOES_NOT_PAUSE_PROPERLY_HANDLER) {
                        DOES_NOT_PAUSE_PROPERLY_FLAG = true;
                        this._DOES_NOT_PAUSE_PROPERLY_HANDLER.stop = true;
                        delete this._DOES_NOT_PAUSE_PROPERLY_HANDLER;
                    }
                    delete this.delayedBufferCheck;
                    //remove delayed pause.
                    delete this.delayedPauseCheck;
                    var player = this.getPlayer();
                    if (!player) {
                        return true;
                    }
                    s = s || this.mediaType.getPlayerState(player);
                    if (s == 3) {
                        this.delayedBufferCheck = true;
                        if (this._exceptionType == MyTube.exceptionTypes.DOES_NOT_PAUSE_PROPERLY) {
                            this.play();
                        }
                        return true;
                    } else if (s == 1) {
                        this.delayedBufferCheck = true;
                        this.pause();
                        return true;
                    } else if (s == 2) {
                        if (!DOES_NOT_PAUSE_PROPERLY_FLAG && this._exceptionType == MyTube.exceptionTypes.DOES_NOT_PAUSE_PROPERLY) {
                            var me = this;
                            var o = this._DOES_NOT_PAUSE_PROPERLY_HANDLER = {};
                            var fn = NJS.createDelegate(function() {
                                if (me._destroyed || this.stop == true) {
                                    return;
                                }
                                me._ui.play();
                                me.delayedBufferCheck = true;
                                me.checkForDelayedBuffer();
                            }, o);
                            window.setTimeout(function() {
                                fn();
                            }, 1000);
                            return true;
                        }
                        this.startBufferCheck();
                        return true;
                    }
                    return false;
                },
                checkForDelayedPause: function(s) {
                    var delayedPauseCheck = this.delayedPauseCheck;
                    if (!delayedPauseCheck) {
                        return false;
                    }
                    
                    var DOES_NOT_PAUSE_PROPERLY_FLAG = false;
                    if (this._DOES_NOT_PAUSE_PROPERLY_HANDLER) {
                        DOES_NOT_PAUSE_PROPERLY_FLAG = true;
                        this._DOES_NOT_PAUSE_PROPERLY_HANDLER.stop = true;
                        delete this._DOES_NOT_PAUSE_PROPERLY_HANDLER;
                    }
                    
                    delete this.delayedPauseCheck;
                    var player = this.getPlayer();
                    if (!player) {
                        return true;
                    }
                    s = s || this.mediaType.getPlayerState(player);
                    if (s == 3) {
                        this.delayedPauseCheck = true;
                        return true;
                    } else if (s == 1) {
                        this.pause();
                        if (!DOES_NOT_PAUSE_PROPERLY_FLAG && this._exceptionType == MyTube.exceptionTypes.DOES_NOT_PAUSE_PROPERLY) {
                            var me = this;
                            var o = this._DOES_NOT_PAUSE_PROPERLY_HANDLER = {};
                            var fn = NJS.createDelegate(function() {
                                if (me._destroyed || this.stop == true) {
                                    return;
                                }
                                me.delayedPauseCheck = true;
                                me.checkForDelayedPause();
                            }, o);
                            window.setTimeout(function() {
                                fn();
                            }, 500);
                            return true;
                        }
                        return true;
                    }
                    return false;
                },
                onPlaybackQualityChange: function(q) {
                    var fn = this.getAfterFunction("playbackQualityChanged");
                    if (fn != null) {
                        fn.call(this);
                        return;
                    }
                },
                getAfterFunction: function(id, dontDelete) {
                    this._afterFns = this._afterFns || {};
                    var o = this._afterFns[id];
                    if (o != null && dontDelete !== true) {
                        delete this._afterFns[id];
                    }
                    return o;
                },
                setAfterFunction: function(id, fn, overrideExisting) {
                    this._afterFns = this._afterFns || {};
                    var o = this._afterFns[id];
                    if (o != null && overrideExisting !== true) {
                        throw "after function for " + id + "already exists";
                    }
                    this._afterFns[id] = fn;
                },
                fixQuality: function(q, availableQs, currentQ) {
                    var defaultQ = "default";
                    if (q == currentQ || q == defaultQ || q == null) {
                        return defaultQ;
                    }
                    if (availableQs == null) {
                        return defaultQ;
                    }
                    //sometimes we dont get an array back!!! what the hell! where the hell is matt embeded video
                    if (!(availableQs instanceof Array)) {
                        var t = [];
                        for (var i in availableQs) {
                            t.push(availableQs[i]);
                        }
                        availableQs = t;
                    }
                    if (availableQs.length <= 1) {
                        return defaultQ;
                    }
                    if (availableQs.indexOf(q) >= 0) {
                        return q;
                    }
                    var qs = ["highres", "hd1080", "hd720", "large", "medium", "small", "tiny"];
                    var i = qs.indexOf(q);
                    if (i == -1) {
                        return defaultQ;
                    }
                    var diff = 1;
                    q = defaultQ;
                    while (true) {
                        //check for one +
                        var j = i + diff;
                        if (j >= qs.length) {
                            break;
                        }
                        if (j < qs.length) {
                            q = qs[j];
                            if (availableQs.indexOf(q) >= 0) {
                                break;
                            }
                        }
                        diff++;
                    }
                    if (q == currentQ) {
                        return defaultQ;
                    }
                    return q;
                },
                setPlaybackQuality: function(q) {
                    if (q == "default" || q == null) {
                        this.onPlaybackQualityChange("mytubedummy");
                        return;
                    }
                    var player = this.getPlayer();
                    if (player == null) {
                        return;
                    }
                    var mediaType = this.mediaType;
                    q = this.fixQuality(q, mediaType.getAvailableQualityLevels(player), mediaType.getPlaybackQuality(player));
                    if (q == "default") {
                        this.onPlaybackQualityChange("mytubedummy");
                        return;
                    }
                    mediaType.setPlaybackQuality(player, q);
                },
                setPlayerSize: function(player) {
                    var ret = MyTubePrefs.pageInfo.uiVersion().setSize(player, this.playerSize);
                    if(ret) {
                        this.onResize();
                    }
                    return ret;
                },
                onStateChange: function(s) {
                    //Need queue coz in opera on pausing and playing the excution comes to onStateChange. which throws exceptions.
                    var queue = this.stateChangedQueue = this.stateChangedQueue ||  new NJS.JobQueue({
                        id: "jobQueueForStateChanged",
                        startOnInit: true,
                        maxJobs: 1
                    });
                    var me = this;
                    var job = new NJS.Job({
                        onStart: function() {
                            var m = this;
                            window.setTimeout(function() {
                                var fn = function(tube) {
                                    if(tube._newTubeQueued) {
                                        fn(MyTube.get(tube.id));
                                        return;
                                    }
                                    if(tube._destroyed) {
                                        return;
                                    }
                                try {
                                        tube.onStateChange1(s);
                                } catch(ex) {
                                    logger.error("Error while handling stateChange", ex);
                                }
                                };
                                fn(me);
                                m.end();
                            }, 1);
                        }
                    });
                    queue.queue(job);
                },
                hasSameVideoId: function() {
                    if(typeof yt == "undefined" || !yt.config_  || !yt.config_.VIDEO_ID) {
                        return true;
                    }
                    var videoId = yt.config_.VIDEO_ID;
                    if(this.videoId && this.videoId != videoId) {
                        return false;
                    }
                    this.videoId = videoId;
                    return true;
                },
                onStateChange1: function(s) {
                    var lastState = this.lastState = this._currState;
                    this._currState = s;
                    logger.info("State Changed. Current State: %s; Last State:%s", s, lastState);
                    if(!this.hasSameVideoId()) {
                        logger.info("Its new video in same player. Reloading tube");
                        var newTube = MyTube.onMyTubePlayerReady(this.id);
                        newTube.onStateChange(s);
                        this._newTubeQueued = true;
                        return;
                    }
                    try {
                        window.ytPlayeronStateChangeplayer1 && window.ytPlayeronStateChangeplayer1.apply(window, arguments);
                    } catch (ex) {
                        logger.error("Error occurred while calling player state changed on ytPlayer", ex);
                    }
                    
                    if (s == 2 && lastState == -1) {
                        this._exceptionType = MyTube.exceptionTypes.DOES_NOT_PAUSE_PROPERLY;
                    }
                    this._ui.closeAllNotificationWindows();
                    var player = this.getPlayer();
                    if (!player) {
                        return;
                    }
                    var startBytes = this.mediaType.getVideoStartBytes(player);
                    var lastStartBytes = this.lastStartBytes;
                    this.lastStartBytes = startBytes;

                    if (!this.videoInitialized) {
                        this.noFirstRun = true;
                        this.videoInitialized = true;
                        var me = this;
                        var showPopup = function() {
                            if(me._destroyed) {
                                return;
                            }
                            me.showPopup();
                            me.hidePopup(3000);
                        };
                        if(this.setPlayerSize(player) || player.tagName == "VIDEO") {
                            window.setTimeout(function() {
                                showPopup();
                            }, 1000);
                        } else {
                            showPopup();
                        }
                        if (this.saveBandwidth) {
                            if (this.autoBuffer) {
                                this.updateEstimated(-6);
                            } else if (this.autoPlay) {
                                this.updateEstimated(-7);
                            }
                        } else if (this.autoPlayOnBuffer) {
                            this.updateEstimated(-4);
                        }
                        if (s != 1) {
                            return;
                        }
                    }
                    if (this.checkForDelayedBuffer()) {
                        return;
                    }
                    if (this.checkForDelayedPause()) {
                        return;
                    }
                    
                    //if the video is buffering or whatever and have not yet dont 'on play' things, return
                    if (s != 1 && this.noFirstRun) {
                        return;
                    }
                    if (s == 1 && this.noFirstRun) {
                        this.updateEstimated(-8);
                        delete this.noFirstRun;
                        var q = (player.getAttribute("myTubeQualitySet") == "true") ? "default" : this.quality;
                        var fn = null;
                        if (this.autoBuffer) {
                            if (this.autoPlayOnBuffer) {
                                if (this.saveBandwidth) {
                                    this._ui.play();
                                }
                                this.updateEstimated(-1);
                                this.delayedBufferCheck = true;
                                fn = function(b) {
                                    this.checkForDelayedBuffer();
                                };
                            } else {
                                this.delayedPauseCheck = true;
                                fn = function(b) {
                                    this.checkForDelayedPause();
                                };
                            }
                        }
                        if (q) {
                            this.setAfterFunction("playbackQualityChanged", function(fn) {
                                return (function(b) {
                                    fn && fn.call(this, b);
                                });
                            }(fn));
                            this.setPlaybackQuality(q);
                        } else {
                            fn && fn.call(this, false);
                        }
                        return;
                    }
                    if (s == 0 && this.loop) {
                        var fn = function(tube) {
                                return (function() {
                                    if(tube._destroyed) {
                                        return;
                                    }
                                    tube.play();
                                });
                            }(this);
                        window.setTimeout(function() {
                            fn();
                        }, 100);
                    }
                    //Sometimes pause does not happen property. Mostly when you select highest quality.
                    //Eg: http://www.youtube.com/watch?v=K7SnLGBn9Ms
                    //So any transition between 2 to 3 and 3 to 2, should not stop buffer.
                    if((s == 3 && lastState == 2) || s == 2 && lastState == 3) {
                        return;
                    }
                    if (!(s == 2 && s == lastState && startBytes == lastStartBytes)) {
                        logger.info("Will stop buffering if happening. State: %s, Last State: %s, Start Bytes: %s, Last Start Bytes: %s", s, lastState, startBytes, lastStartBytes);
                        this.turnOffAutoPlayOnBuffer();
                    }
                },
                onSizeClicked: function() {
                    this.onResize();
                    try {
                        window.ytPlayerSIZE_CLICKEDplayer1 && window.ytPlayerSIZE_CLICKEDplayer1.apply(window, arguments);
                    } catch (ex) {
                        logger.error("Error occurred while size clicked on ytPlayer", ex);
                    }
                },
                onError: NJS.emptyFn,
                onResize: function() {
                    this.hidePopup(1);
                },
                addEventListenerOnPlayer: function(player, event, fn, ignoreException) {
                    try {
                        if(player.tagName == "VIDEO") {
                            player.addEventListener(event, fn, false);
                            return;
                        }
                        player.addEventListener(event, fn);
                    } catch (ex) {
                        if(!ignoreException) {
                            throw ex;
                        }
                        logger.error("Could not attach event on player. Event: " + event, ex);
                    }
                }
            });
            var MyTubeUI = NJS.define({
                superclass: NJS.Observable,
                events: ["userAction"],
                constructor: function(id, tube, prefs) {
                    MyTubeUI.superclass.constructor.call(this, {});
                    MyTubePrefs.on("preferencesUpdated", this._prefsListener, this);
                    MyTubePrefs.on("notificationPermissionsChanged", this._setNotifcationIcon, this);
                    this.id = id;
                    this._prefs = prefs;
                },
                _getPopupDiv: function() {
                    if (this._destroyed) {
                        return null;
                    }
                    if (this._popup) {
                        return this._popup;
                    }
                    var me = this;
                    var prefs = this._prefs;
                    var bundle = MyTubePrefs.bundle;

                    var id = function(id) {
                        return me.id + id;
                    };

                    var configForContainer = function(tagName, defaultAttrs) {
                        return (function(children, className, relativeId, attrs) {
                            attrs = attrs || {};
                            NJS.apply(attrs, defaultAttrs);
                            if(relativeId) {
                                attrs.id = id(relativeId);
                            }
                            if(className) {
                                attrs["class"] = className;
                            }
                            return NJS.DOM.Config.element(tagName, attrs, children);
                        });
                    };

                    var ConfigCheckoxOrText = function(tagName, defaultAttrs) {
                        return (function(relativeId, attrs) {
                            attrs = attrs || {};
                            NJS.apply(attrs, defaultAttrs);
                            if(relativeId) {
                                attrs.id = id(relativeId);
                            }
                            return NJS.DOM.Config.element(tagName, attrs, null);
                        });
                    };

                    var div = configForContainer("div"), span = configForContainer("span")
                    var table = configForContainer("table"), tr = configForContainer("tr"), td = configForContainer("td");

                    var checkbox = ConfigCheckoxOrText("input", {type: "checkbox"});

                    var textbox = ConfigCheckoxOrText("input", {type: "text"});

                    var labelCheckbox = function(relativeId) {
                        return NJS.DOM.Config.element("label", {
                            "for": id(relativeId),
                            "class": "mytube-styled-checkbox",
                            "id": id(relativeId + "-container")
                        }, [checkbox(relativeId, {"class": "mytube-icon-checkbox"})]);
                    };

                    var label = function(text, forRelativeId) {
                        var attrs = {};
                        if(forRelativeId) {
                            attrs["for"] = id(forRelativeId);
                        }
                        return NJS.DOM.Config.element("label", attrs, [text]);
                    };
                    
                    var a = function(text, attrs) {
                        return NJS.DOM.Config.element("a", attrs, [text]);
                    };
                    
                    var rows = [];
                    var containerDivConfig = div([ table(rows)
                    ], "mytube-div", "popup", {myTubeActiveTubeId: id(""), style: "position: absolute; display: none; z-index: 99999"});

                    rows.push(tr([
                        td([
                            labelCheckbox("loop")
                        ], "first-td"),
                        td([
                            div([
                                label(bundle.loop, "loop")
                            ])
                        ], "last-td"),
                    ], "first-tr"));

                    rows.push(tr([
                        td([
                            labelCheckbox("autoPlayOnBuffer")
                        ], "first-td", null, {rowspan: "3"}),
                        td([
                            div([
                                label(
                                    bundle.start_playing_when_buffered, "autoPlayOnBuffer"),
                                "  (",
                                checkbox("onlyNotification"),
                                " ",
                                label(bundle.only_notify, "onlyNotification"),
                                div(null, "inline", "desktopNotificationIconSpan", {style: "margin-left: 5px;"}),
                                ")  " + bundle.continuation_on_next_line
                            ])
                        ], "last-td"),
                    ]));

                    rows.push(tr([
                        td([
                            div([
                                textbox("autoPlayOnBufferPercentage", {style: "width:30px;", maxLength: "3"}),
                                "  " + bundle.percentage + "",
                                checkbox("autoPlayOnSmartBuffer", {style: "margin-left: 10px"}),
                                div([
                                    label(" " + bundle.smart_buffer, "autoPlayOnSmartBuffer")
                                ], "inline")
                            ])
                        ], "last-td"),
                    ]));

                    rows.push(tr([
                        td([
                            div([
                                div([
                                    bundle.estimated_time + bundle.label_delimitor
                                ], "inline"),
                                div([
                                    " "
                                ], "inline", "estimated", {style: "margin-left: 5px;"})
                            ])
                        ], "last-td"),
                    ]));

                    rows.push(tr([
                        td([
                            div([
                                a(bundle.popup_donate_to + " SmartVideo!", {
                                    "href": MyTube.getDonateUrl(),
                                    "target": "_blank",
                                    "class": "donate-link"
                                }),
                                div([
                                    bundle.global_preferences
                                ], "inline settings-span", "prefs")
                            ])
                        ], "last-td", null, {colspan: "2", style:"height:20px;text-align:right"}),
                    ], "last-tr"));

                    this._popup = NJS.DOM.append(document.body, containerDivConfig)[0];

                    var c,f;
                    
                    c = document.getElementById(this.id + "prefs");
                    f = function() {
                        MyTubePrefs.showGlobalSettings();
                    };
                    c.addEventListener("click", f, true);

                    c = document.getElementById(this.id + "loop");
                    c.checked = prefs.loop;
                    var container = document.getElementById(this.id + "loop-container");
                    container.className = "mytube-styled-checkbox " + (c.checked ? "mytube-repeat" : "mytube-no-repeat");
                    f = function(c, container) {
                        return (function() {
                            var b = c.checked;
                            container.className = "mytube-styled-checkbox " + (b ? "mytube-repeat" : "mytube-no-repeat");
                            prefs.loop = b;
                            me.fire("userAction", "loop", {
                                val: b
                            });
                        });
                    }(c, container);
                    c.addEventListener("click", f, true);

                    c = document.getElementById(this.id + "onlyNotification");
                    if (MyTubePrefs.anyNotificationSupported()) {
                        c.checked = prefs.onlyNotification;
                        f = function(c) {
                            return (function() {
                                var b = c.checked;
                                prefs.onlyNotification = b;
                                me.fire("userAction", "onlyNotification", {
                                    val: b
                                });
                            });
                        }(c);
                        c.addEventListener("click", f, true);
                    } else {
                        c.disabled = true;
                        c.title = bundle.no_notification_supported_on_your_browser;
                    }

                    c = document.getElementById(this.id + "autoPlayOnBuffer");
                    var checked = c.checked = prefs.autoPlayOnBuffer && !prefs.saveBandwidth;
                    if(checked) {
                        this.changeStatus(-4);
                    }
                    container = document.getElementById(this.id + "autoPlayOnBuffer-container");
                    container.className = "mytube-styled-checkbox " + (checked ? "mytube-stop" : "mytube-play");
                    f = function(c, container) {
                        return (function() {
                            var b = c.checked;
                            container.className = "mytube-styled-checkbox " + (b ? "mytube-stop" : "mytube-play");
                            me.fire("userAction", "play", {
                                val: b
                            });
                            prefs.autoPlayOnBuffer = b;
                        });
                    }(c, container);
                    c.addEventListener("click", f, true);
                    c = document.getElementById(this.id + "autoPlayOnSmartBuffer");
                    c.checked = prefs.autoPlayOnSmartBuffer;
                    f = function(c) {
                        return (function() {
                            var b = c.checked;
                            prefs.autoPlayOnSmartBuffer = b;
                            document.getElementById(me.id + "autoPlayOnBufferPercentage").disabled = b;
                            me.fire("userAction", "autoPlayOnSmartBuffer", {
                                val: b
                            });
                        });
                    }(c);
                    c.addEventListener("click", f, true);
                    c = document.getElementById(this.id + "autoPlayOnBufferPercentage");
                    c.value = prefs.autoPlayOnBufferPercentage;
                    if (prefs.autoPlayOnSmartBuffer) {
                        c.disabled = true;
                    }
                    f = function(c) {
                        return (function() {
                            var val = parseInt(c.value);
                            if (isNaN(val) || val < 0 || val > 100) {
                                c.value = prefs.autoPlayOnBufferPercentage;
                                c.select();
                                c.focus();
                            } else {
                                c.value = val;
                                if (val != prefs.autoPlayOnBufferPercentage) {
                                    prefs.autoPlayOnBufferPercentage = val;
                                    me.fire("userAction", "autoPlayOnBufferPercentage", {
                                        val: val
                                    });
                                }
                            }
                        });
                    }(c);
                    c.addEventListener("blur", f, true);
                    this._setNotifcationIcon();
                    return this._popup;
                },
                showPopup: function(playerBoxAttributes) {
                    this._stopHide = true;
                    if (this._popupVisible) {
                        return;
                    }
                    var popup = this._getPopupDiv();
                    if (!popup) {
                        return;
                    }
                    if (MyTubePrefs.prefs.hidePopup) {
                        return;
                    }
                    this._popupVisible = true;

                    var t = Math.floor(playerBoxAttributes.top + playerBoxAttributes.height - 1) + "px";
                    var l = Math.ceil(playerBoxAttributes.left - 1) + "px";
                    var w = Math.floor(playerBoxAttributes.width - 2) + "px";
                    popup.style.top = t;
                    popup.style.left = l;
                    popup.style.display = "";
                    popup.style.width = w;
                },
                hidePopup: function(delay) {
                    this._stopHide = false;
                    var me = this;
                    var fn = function() {
                        return (function() {
                            if(me._destroyed) {
                                return;
                            }
                            me._hidePopup();
                        });
                    }();
                    delay = parseInt(delay);
                    delay = isNaN(delay) ? 800 : (delay < 1 ? 1: delay);
                    window.setTimeout(function() {
                        fn();
                    }, delay);
                },
                _hidePopup: function() {
                    if (this._stopHide) {
                        return;
                    };
                    if (!this._popupVisible) return;
                    this._popupVisible = false;
                    if (this._popup) {
                        this._popup.style.display = "none";
                    }
                },
                destroy: function() {
                    this.closeAllNotificationWindows();
                    MyTubePrefs.un("preferencesUpdated", this._prefsListener);
                    MyTubePrefs.un("notificationPermissionsChanged", this._setNotifcationIcon);
                    delete this._prefs;
                    delete this._stopHide;
                    delete this._popupVisible;
                    var div = this._popup;
                    if (div) {
                        div && div.parentNode && div.parentNode.removeChild(div);
                        delete this._popup;
                    }
                    this.purgeListeners();
                    this._destroyed = true;
                },
                _setNotifcationIcon: function() {
                    var bundle = MyTubePrefs.bundle;
                    var iconSpan = document.getElementById(this.id + "desktopNotificationIconSpan");

                    var notificationType = 1;
                    var resultantSoundPermission = false;
                    var title = bundle.sound + bundle.label_delimitor + " ";
                    if (!MyTubePrefs.soundNotificationSupported()) {
                        title += bundle.not_supported;
                        notificationType = 2;
                    } else {
                        if (MyTubePrefs.prefs.soundNotification) {
                            title += bundle.on;
                            resultantSoundPermission = true;
                        } else {
                            title += bundle.off;
                        }
                    }
                    var resultantDesktopNotificationPermission = false;
                    if (MyTubePrefs.desktopNotificationSupported()) {
                        title += bundle.notification_status_delimitor + " " + bundle.desktop_notification + bundle.label_delimitor + " ";
                        if (!MyTubePrefs.prefs.desktopNotification) {
                            title += bundle.off;
                        } else {
                            var p = window.webkitNotifications.checkPermission();
                            if (p == 0) {
                                title += bundle.on;
                                resultantDesktopNotificationPermission = true;
                            } else if (p == 1) {
                                var notificationType = 3;
                                title += bundle.click_to_enable_for_this_site;
                                resultantDesktopNotificationPermission = true;
                            } else if (p == 2) {
                                var notificationType = 2;
                                title += bundle.desktop_notification_denied;
                            }
                        }
                    }
                    if (!resultantDesktopNotificationPermission && !resultantSoundPermission) {
                        notificationType = 4;
                    }
                    iconSpan.title = title;
                    if (iconSpan.getAttribute("notificationType") == String(notificationType)) {
                        return;
                    }
                    iconSpan.setAttribute("notificationType", String(notificationType));
                    var status = "";
                    if (notificationType == 1) {
                        status = "information";
                    } else if (notificationType == 2 || notificationType == 3) {
                        status = "error";
                    } else if (notificationType == 4) {
                        status = "exclamation";
                    }
                    iconSpan.className = "mytube-notification-status mytube-notification-status-" + status;

                    if (notificationType == 3) {
                        iconSpan.style.cursor = "pointer";
                        iconSpan.addEventListener("click", MyTubePrefs.getNotificationPermission, true);
                    } else {
                        iconSpan.style.cursor = "";
                        iconSpan.removeEventListener("click", MyTubePrefs.getNotificationPermission, true);
                    }
                },
                _prefsListener: function() {
                    this._setNotifcationIcon();
                },
                stop: function() {
                    var checkBox = document.getElementById(this.id + "autoPlayOnBuffer");
                    if (checkBox) {
                        checkBox.checked = false;
                        var container = document.getElementById(this.id + "autoPlayOnBuffer-container");
                        container.className = "mytube-styled-checkbox mytube-play";
                    }
                },
                play: function() {
                    var checkBox = document.getElementById(this.id + "autoPlayOnBuffer");
                    if (checkBox) {
                        checkBox.checked = true;
                        var container = document.getElementById(this.id + "autoPlayOnBuffer-container");
                        container.className = "mytube-styled-checkbox mytube-stop";
                    }
                },
                addNotificationWindowToWatch: function(nWindow) {
                    var notificationWindows = this._notificationWindows = this._notificationWindows || [];
                    notificationWindows.push(nWindow);
                    var me = this;
                    nWindow.addEventListener("close", function(e) {
                        me.removeNotificationWindow(e.target);
                    }, false);
                },
                closeAllNotificationWindows: function() {
                    var notificationWindows = this._notificationWindows;
                    if (NJS.isNullOrEmpty(notificationWindows)) {
                        return;
                    }
                    for (var i = 0; i < notificationWindows.length; i++) {
                        notificationWindows[i].cancel();
                    }
                },
                removeNotificationWindow: function(nWindow) {
                    var notificationWindows = this._notificationWindows;
                    if (NJS.isNullOrEmpty(notificationWindows)) {
                        return;
                    }
                    NJS.removeItem(notificationWindows, nWindow);
                },
                notify: function(videoTitle) {
                    if (!MyTubePrefs.desktopNotificationSupported() || !MyTubePrefs.prefs.desktopNotification) {
                        return;
                    }
                    var p = window.webkitNotifications.checkPermission();
                    if (p == 0) {
                        var bundle = MyTubePrefs.bundle;
                        
                        this.closeAllNotificationWindows();
                        
                        var title = "SmartVideo " + bundle.hyphen + " " + (videoTitle ? videoTitle + " " + bundle.buffered : bundle.video_buffered);
                        var message = bundle.buffered_message;
                        var nWindow = this._notificationWindow = window.webkitNotifications.createNotification("chrome-extension://" + bundle.extension_id + "/icons/icon-32.png", title, message);
                        nWindow.onclick = function(){
                            window.focus();
                            this.cancel();
                        };
                        this.addNotificationWindowToWatch(nWindow);
                        nWindow.show();
                    } else if (p == 1) {
                        try {
                            MyTubePrefs.getNotificationPermission();
                        } catch (ex) {}
                    }
                },
                showError: function(errorMsg, isFatal) {
                    var table = document.getElementById(this.id + "popup").getElementsByTagName("table")[0];
                    if (!table) {
                        return;
                    }

                    var bundle = MyTubePrefs.bundle;
                    var errorStr = bundle.error + bundle.label_delimitor + " " + bundle[errorMsg];

                    var trs = table.rows;
                    var lastRow = trs[trs.length - 1];
                    NJS.DOM.insertBefore(lastRow.parentNode, {
                        tagName: "tr",
                        children: [{
                            tagName: "td",
                            attrs: {
                                "class": "last-td",
                                colspan: "2"
                            },
                            children: [{
                                tagName: "div",
                                chilren: [{
                                    tagName: "div",
                                    "class": "inline error-msg",
                                    children: [
                                        errorStr
                                    ]
                                }]
                            }]
                        }]
                    }, lastRow);

                    if (!isFatal) {
                        return;
                    }
                    while (trs.length > 2) {
                        var tr = trs[0];
                        tr.parentNode.removeChild(tr);
                    }
                },
                changeStatus: function(status) {
                    if (typeof status == "number") {
                        status = this.convertEstimated(status);
                    } else if (status != "") {
                        status = MyTubePrefs.bundle[status];
                    }
                    if (status == null) {
                        return;
                    }
                    var div = document.getElementById(this.id + "estimated");
                    if (!div) {
                        return;
                    }
                    NJS.DOM.innerText(div, " " + status);
                },
                nextProgressMarker: function() {
                    if (!this._progressMarker) {
                        this._progressMarker = new NJS.ProgressMarker();
                    }
                    return this._progressMarker.next();
                },
                convertEstimated: function(est) {
                    var lastEst = this.lastEst;
                    this.lastEst = est;
                    if (est == -5) {
                        //only set if we were actually working on some buffering calculation.
                        if (lastEst == null || lastEst == -2 || lastEst == -9 || lastEst == -3 || lastEst == -5 || lastEst == -6 || lastEst == -7 || lastEst == -8) {
                            return null;
                        }
                        est = -3;
                    }
                    if (est == lastEst && est != -1 && est != -4) {
                        return null;
                    }
                    if (est == -2 || est == -9 || est == -3) {
                        delete this._progressMarker;
                    }
                    var bundle = MyTubePrefs.bundle;
                    if (est == -1) {
                        return bundle.calculating + "  " + this.nextProgressMarker();
                    }
                    if (est == -2) {
                        return bundle.completed + ".";
                    }
                    if (est == -9) {
                        return bundle.buffering_stalled + ".";
                    }
                    if (est == -3) {
                        return bundle.stopped + ".";
                    }
                    if (est == -4) {
                        return bundle.waiting + "  " + this.nextProgressMarker();
                    }
                    if (est == -6) {
                        return bundle.will_start_buffering_when_initialized + ".";
                    }
                    if (est == -7) {
                        return bundle.will_start_playing_when_initialized + ".";
                    }
                    if (est == -8) {
                        return "";
                    }
                    var str = "";
                    est = est.toFixed(0);
                    var seconds = est % 60;
                    est = (est - seconds) / 60;
                    var minutes = est % 60;
                    var hours = (est - minutes) / 60;
                    if (hours > 0) {
                        str += " " + hours + " " + bundle.hr;
                    }
                    if (minutes > 0) {
                        str += " " + minutes + " " + bundle.min;
                    }
                    if (seconds > 0) {
                        str += " " + seconds + " " + bundle.sec;
                    }
                    str = (str == "") ? bundle.any_moment : str;
                    return str + "  " + this.nextProgressMarker();
                }
            });
            
            var MyTubeUIForMakka = NJS.define({
                superclass: MyTubeUI,
                constructor: function(id, tube, prefs) {
                    MyTubeUIForMakka.superclass.constructor.call(this, id, tube, prefs);
                    var me = this;
                    this.on("userAction", function(action, data) {
                        if(action != "loop" || (data && data.originator == "MyTubeUIForMakka")) {
                            return;
                        }
                        window.setTimeout(function() {
                            if(me._destroyed) {
                                return;
                            }
                            MyTubeTabCommunicator.relayToTab("userAction", {action: action, data: data});
                        }, 1);
                       
                    }, this);
                    var me = this;
                    MyTubeTabCommunicator.on("pageActionClicked", function(data) {
                        prefs.loop = data.enabled;
                        me.fire("userAction", "loop", {
                            val: data.enabled,
                            originator: "MyTubeUIForMakka"
                        });
                        var b = document.getElementById(id + "loop").checked = data.enabled;
                        document.getElementById(id + "loop-container").className = "mytube-styled-checkbox " + (b ? "mytube-repeat" : "mytube-no-repeat");
                    });
                }
            });
            NJS.apply(MyTube, {
                exceptionTypes: {
                    /*
                    This kind of videos dont pause property. They go from -1 to 2 state direclty and then somehow after 2 they go to state 3. weird.
                    eg: http://www.youtube.com/watch?v=9UE-LcQ5NNg
                    */
                    DOES_NOT_PAUSE_PROPERLY: "DOES_NOT_PAUSE_PROPERLY"
                },
                onMyTubePlayerReady: function(pId) {
                    var dom = this.getDom(pId);
                    if (!dom) {
                        return null;
                    }
                    var tube = this.get(pId);
                    if (tube) {
                        tube.cleanup(true);
                    }
                    return this.createTubeInstance(pId, dom);
                },
                createTubeInstance: function(pId, dom) {
                    var tagName = dom.tagName;
                    var playerConstructor = MyTube;
                    if (tagName == "VIDEO") {
                        playerConstructor = MyTubeHTML5;
                    }
                    var uiConstructor = this.getUIConstructor(dom);
                    var prefs = NJS.apply({}, MyTubePrefs.prefs, ["hidePopup", "enable", "enableFullScreen", "fshd", "desktopNotification", "soundNotification"]);
                    
                    return new playerConstructor(pId, dom, uiConstructor, prefs);
                },
                getUIConstructor: function(dom) {
                    if (window.parent == window || !window.postMessage) {
                        return MyTubePrefs.pageInfo.youTubeMakka && !MyTubePrefs.pageInfo.youTubeFrame ? MyTubeUIForMakka : MyTubeUI;
                    }
                    if (dom.clientHeight - window.innerHeight < 30) {
                        return MyTubeUIAdapterForIFrame;
                    }
                    if (MyTubePrefs.pageInfo.youTubeFrame) {
                        return MyTubeUIAdapterForIFrame;
                    }
                    return MyTubeUI;
                },
                _tubes: {},
                get: function(id) {
                    return this._tubes[id];
                },
                forAllTubes: function(fn) {
                    var tubes = this._tubes;
                    for (var i in tubes) {
                        if (tubes.hasOwnProperty(i)) {
                            fn.call(tubes[i], Array.prototype.slice.call(arguments, 1));
                        }
                    }
                },
                put: function(tube) {
                    var id = tube.id  = tube.id || NJS.unique("mytube");
                    this._tubes[id] = tube;
                    return tube;
                },
                remove: function(tube) {
                    delete this._tubes[tube.id];
                },
                cleanup: function(doNotCleanupPlayer) {
                    var tubes = this._tubes;
                    this.forAllTubes(MyTube.prototype.cleanup, doNotCleanupPlayer);
                },
                cleanupAfterDomElementsRemoved: function() {
                    var tubes = this._tubes;
                    MyTube.forAllTubes(function() {
                        this.getPlayer();
                    });
                },
                init: function() {
                    if (this._initialized) {
                        return;
                    }
                    this._initialized = true;
                    window.MyTube = {
                        get: function(id) {
                            var tube = MyTube.get(id);
                            return ({
                                onStateChange: function() {
                                    tube.onStateChange.apply(tube, arguments);
                                },
                                onError: function() {
                                    tube.onError.apply(tube, arguments);
                                },
                                onSizeClicked: function() {
                                    tube.onSizeClicked.apply(tube, arguments);
                                },
                                onPlaybackQualityChange: function() {
                                    tube.onPlaybackQualityChange.apply(tube, arguments);
                                },
                                onResize: function() {
                                    tube.onResize.apply(tube, arguments);
                                }
                            });
                        }
                    };
                    this.onMouseOver = NJS.createDelegate(this.onMouseOver, this);
                    window.document.addEventListener("mouseover", this.onMouseOver, false);
                    
                    var handleRemovedElements = NJS.createBuffered(MyTube.cleanupAfterDomElementsRemoved, 100);
                    var observer = MyTube.mutationObserver = MyTube.mutationObserver || new window.MyTubeMutationObserver(logger);
                    observer.observeRemoved(handleRemovedElements);
                },
                setTubeReadyListener: function() {
                   return this.setTubeReadyListenerOther();
                },
                validateTubeReadyListener: function() {
                    if(MyTubePrefs.pageInfo.youTubeMakka) {
                        return;
                    }
                    if(!window.onYouTubePlayerReady ||  window.onYouTubePlayerReady.myTubeTest == "myTubeTest") {
                        return;
                    }
                    //was not able to set youtubeplayer ready. Lets fallback.
                    var fn = window.onYouTubePlayerReady;
                    var newFn = function(tubeId) {
                        if (tubeId == null || tubeId.indexOf("mytube") == -1) {
                            window.MyTubeBootstrap.transformAbandoned();
                            fn.apply(this, arguments);
                            return;
                        }
                        if (MyTube.onMyTubePlayerReady.apply(MyTube, arguments) == false) {
                            return;
                        }
                        fn.apply(window, arguments);
                    };
                    newFn.myTubeTest == "myTubeTest";

                    window.onYouTubePlayerReady =  newFn;
                },
                setTubeReadyListenerOther: function() {
                    var readyFnName = "onYouTubePlayerReady";
                    var getterFn = function() {
                            var readyFn = function() {
                                return  MyTube[readyFnName] || NJS.emptyFn;
                            };
                            var returnFn = function(tubeId) {
                                if (tubeId == null || tubeId.indexOf("mytube") == -1) {
                                    window.MyTubeBootstrap.transformAbandoned();
                                    readyFn().apply(this, arguments);
                                    return;
                                }
                                if (MyTube.onMyTubePlayerReady.apply(MyTube, arguments) == false) {
                                    return;
                                }
                                readyFn().apply(window, arguments);
                            };
                        returnFn.myTubeTest = "myTubeTest";
                        return returnFn;
                    };
                    Object.defineProperty(window, "onMyTubePlayerReady", {configurable: false, get: getterFn});
                    var setterFn = function(fn) {
                            MyTube[readyFnName] = fn;
                    };
                    MyTube[readyFnName] = window[readyFnName];
                    delete window[readyFnName];
                    try {
                        window.__defineSetter__(readyFnName, setterFn);
                        window.__defineGetter__(readyFnName, getterFn);
                    } catch (ex) {
                        logger.error("Exception while setting tube ready listeners", ex);
                    }
                },
                setTubeReadyListenerMakka: function() {
                    var getterFn = function() {
                        var readyFn = function() {
                            var fn = window.onYouTubePlayerReady ||  window.onChannelPlayerReady || NJS.emptyFn;
                            return fn;
                        };
                        
                        return (function(tubeId) {
                            if (tubeId == null || tubeId.indexOf("mytube") == -1) {
                                window.MyTubeBootstrap.transformAbandoned();
                                readyFn().apply(this, arguments);
                                return;
                            }
                            if (MyTube.onMyTubePlayerReady.apply(MyTube, arguments) == false) {
                                return;
                            }
                            readyFn().apply(this, arguments);
                        });
                    };
                    window.__defineGetter__("onMyTubePlayerReady", getterFn);
                },
                getDom: function(id, tags) {
                    if (!tags) {
                        return this.getDom(id, ["EMBED", "OBJECT", "VIDEO", "IFRAME"]);
                    }
                    var fn = function(tag) {
                            var els = document.getElementsByTagName(tag);
                            for (var i = 0; i < els.length; i++) {
                                var el = els[i];
                                if (el.getAttribute("myTubeId") == id) {
                                    this.found = el;
                                    return true;
                                }
                            }
                            return false;
                        }
                    var o = {};
                    NJS.filterArray(tags, fn, {
                        breakOnFirst: true,
                        scope: o
                    });
                    return o.found;
                },
                onMouseOver: function(e) {
                    try {
                        var to = e.target;
                        while (to && to.getAttribute && to.tagName != "HTML" && to.tagName != "BODY" && !to.getAttribute("myTubeActiveTubeId")) {
                            to = to.parentNode;
                        }
                        var from = e.relatedTarget;
                        while (from && from.getAttribute && from.tagName != "HTML" && from.tagName != "BODY" && !from.getAttribute("myTubeActiveTubeId")) {
                            from = from.parentNode;
                        }
                        var toId = (to && to.getAttribute) ? to.getAttribute("myTubeActiveTubeId") : null;
                        var fromId = (from && from.getAttribute) ? from.getAttribute("myTubeActiveTubeId") : null;
                        if (toId == null && fromId == null) {
                            return;
                        }
                        if (toId == fromId) {
                            return;
                        }
                        var tube;
                        if (toId) {
                            tube = this.get(toId);
                            tube.showPopup();
                        }
                        if (fromId) {
                            tube = this.get(fromId);
                            tube.hidePopup();
                        }
                    } catch (ex) {}
                },
                getSmartVideoBaseUrl: function() {
                    return "http://smartvideo.ashishmishra.in"
                },
                getDonateUrl: function() {
                    return this.getSmartVideoBaseUrl() + "/donate?from=" + this.extensionType;
                }
            });
            var HTML5Media = NJS.define({
                superclass: Media,
                getVideoStartBytes: function(player) {
                    try {
                        return player.buffered.start(0);
                    } catch (ex) {
                        return -1;
                    }
                },
                getVideoBytesLoaded: function(player) {
                    try {
                        var b = player.buffered;
                        return b.end(0) - b.start(0);
                    } catch (ex) {
                        return -1;
                    }
                },
                getVideoBytesTotal: function(player) {
                    try {
                        return player.duration;
                    } catch (ex) {
                        return -1;
                    }
                },
                getPlayerState: function(player) {
                    var state = player.getAttribute("myTubeState");
                    if (state == null) {
                        return -1;
                    }
                    return Number(state);
                },
                setPlayerState: function(player, state) {
                    state = state || -1;
                    player.setAttribute("myTubeState", state);
                },
                getDuration: function(player) {
                    try {
                        return player.duration;
                    } catch (ex) {
                        return -1;
                    }
                },
                getCurrentTime: function(player) {
                    try {
                        return player.currentTime;
                    } catch (ex) {
                        return -1;
                    }
                },
                playVideo: function(player) {
                    player.play();
                },
                pauseVideo: function(player) {
                    player.pause();
                },
                getAvailableQualityLevels: function(player) {
                    return this.getPlayerReference(true).getAvailableQualityLevels();
                },
                getPlaybackQuality: function(player) {
                    return this.getPlayerReference(true).getPlaybackQuality();
                },
                setPlaybackQuality: function(player, quality) {
                    return this.getPlayerReference(true).setPlaybackQuality(quality);
                },
                getPlayerReference: function(ignoreException) {
                    try {
                        return window.yt.config_["PLAYER_REFERENCE"] ||  window.yt.player.playerReferences_.player1.api;
                    } catch(ex) {
                        if(!ignoreException) {
                            throw "Could not find PLAYER_REFERENCE";
                        }
                        logger.error("Could not find PLAYER_REFERENCE");
                        return {
                            setPlaybackQuality: NJS.emptyFn,
                            getPlaybackQuality: function() {
                                return null;
                            },
                            getAvailableQualityLevels: function() {
                                return [];
                            },
                            addEventListener: NJS.emptyFn
                        };
                    }
                }
            });
            var MyTubeHTML5 = NJS.define({
                tags: ["VIDEO"],
                setMediaType: function(player) {
                    this.mediaType = new HTML5Media();
                },
                constructor: function(id, player, uiConstructor, prefs) {
                    prefs.saveBandwidth = false;
                    MyTubeHTML5.superclass.constructor.call(this, id, player, uiConstructor, prefs);
                },
                superclass: MyTube,
                setupPlayer: function(player) {
                    var me = this;
                    var events = [
                        ["playing", 1],
                        ["pause", 2],
                        ["ended", 0],
                        ["waiting", 3],
                        ["loadedMetadata", 5]
                    ];
                    for (var i = 0; i < events.length; i++) {
                        var event = events[i];
                        player.addEventListener(event[0], function(id) {
                            return (function() {
                                me.mediaType.setPlayerState(player, id);
                                me.onStateChange(id);
                            })
                        }(event[1]), false);
                    }
                     
                    var id = this.id;
                    var playerReference = this.mediaType.getPlayerReference(true);
                    this.addEventListenerOnPlayer(playerReference, "onError", this.listenerFn(id, "onError"), true);
                    this.addEventListenerOnPlayer(playerReference, "onPlaybackQualityChange", this.listenerFn(id, "onPlaybackQualityChange"), true);
                    this.addEventListenerOnPlayer(playerReference, "SIZE_CLICKED", this.listenerFn(id, "onSizeClicked"), true);
                },
                setupAdditionalMarkers: function(player) {
                    var playerContainerDiv = document.getElementById("movie_player-html5");
                    if(playerContainerDiv) {
                        playerContainerDiv.setAttribute("myTubeActiveTubeId", this.id);
                    }
                },
                cleanupAdditinalMarkers: function(player) {
                    var playerContainerDiv = document.getElementById("movie_player-html5");
                    if(playerContainerDiv) {
                        playerContainerDiv.removeAttribute("myTubeActiveTubeId");
                    }
                },
                cleanupPlayer: function(player) {
                    player.removeAttribute("myTubeState");
                },
                getPlayerBoxAttributes: function(player) {
                    if(!MyTubePrefs.pageInfo.youTubeMakka) {
                        return NJS.Layout.boxAttributes(player);
                    }
                    
                    var playerContainerDiv = document.getElementById("movie_player-html5");
                    if(playerContainerDiv) { //Defencive coding. There should be only one div.
                        return NJS.Layout.boxAttributes(playerContainerDiv);
                    }
                    
                    var playerBoxAttributes = NJS.Layout.boxAttributes(player);
                    if(MyTubePrefs.pageInfo.uiVersion() instanceof YouTubeUIVersion5) {
                        playerBoxAttributes.height += 30;
                    }
                    return playerBoxAttributes;
                },
                onSizeClicked: function() {
                    this.onResize();
                }
            });
            var MyTubeTransmitter = function() {
                    var id;
                    var transmitterObjects = [];
                    var jobQueueForMessagesToParent = new NJS.JobQueue({
                        id: "jobQueueForMessagesToParent",
                        startPaused: true
                    });
                    var jobQueueForMessagesToChild = new NJS.JobQueue({
                        id: "jobQueueForMessagesToChild",
                        startPaused: true
                    });
                    var init = function() {
                            jobQueueForMessagesToChild.resume();
                            if (window.parent != window) {
                                transmit("initFrames", "parent");
                            }
                            window.addEventListener("message", receiveMessage, false);
                        };
                    var initFrames = function() {
                            var ifrs = document.getElementsByTagName("IFRAME");
                            for (var i = 0; i < ifrs.length; i++) {
                                var ifr = ifrs[i];
                                var myTubeId = ifr.getAttribute("myTubeId");
                                if (myTubeId == null) {
                                    myTubeId = NJS.unique("mytube");
                                    ifr.setAttribute("myTubeId", myTubeId);
                                }
                                transmit("id", myTubeId, {
                                    id: myTubeId
                                });
                            }
                        };
                    var validateMessage = function(message) {
                            var reg = /^[\sa-z0-9\-\._,"'\:\{\}\[\]]*$/i;
                            if (!reg.test(message)) {
                                throw "Invalid message sent from SmartVideo. Message:" + message;
                            }
                        }
                    var receiveMessage = function(e) {
                            var data = e.data;
                            if(typeof data != "string") {
                                return;
                            }
                            var toks = data.split("::");
                            if (toks[0] != "mytube") {
                                return;
                            }
                            validateMessage(data);
                            logger.info("recieving: "  + data + "["  + window.location.href + "]");
                            var message = toks[1];
                            var senderId = toks[2];
                            var data = toks[3];
                            if (NJS.isNullOrEmpty(data)) {
                                data = {};
                            } else {
                                data = JSON.parse(data);
                            }
                            if (message == "id") {
                                //has been initialized
                                if (id != null) {
                                    return;
                                }
                                id = data.id;
                                jobQueueForMessagesToParent.resume();
                                return;
                            }
                            if (message == "initFrames") {
                                initFrames();
                                return;
                            }
                            if (message == "createTube") {
                                MyTube.init();
                                var player = MyTube.getDom(senderId, ["IFRAME"]);
                                if (player) {
                                    new MyTubeAdapterForIFrame(senderId, player, MyTubeUI, data.prefs, data.positionHints);
                                }
                                return;
                            }
                            var transmitterId = senderId == "parent" ? "MyTubeUIAdapterForIFrame" : senderId;
                            var t = transmitterObjects[transmitterId];
                            if (t) {
                                t.receive(message, data);
                            }
                        };
                    var transmit = function(message, toId, data) {
                            var senderId = id;
                            data = JSON.stringify(data || {});
                            var senderId = id;
                            var w = window.parent;
                            toId = toId || "";

                            if (toId != "parent") {
                                senderId = "parent";
                                w = MyTube.getDom(toId, ["IFRAME"]).contentWindow;
                            }
                            var d = "mytube::" + message + "::" + senderId + "::" + data;
                            logger.info("transmitting to : " + toId + "::: " + d + "["  + window.location.href + "]");
                            w.postMessage(d, "*");
                        };
                    window.postMessage && init();
                    return ({
                        transmit: function(message, toId, data) {
                            var job = new NJS.Job({
                                onStart: function() {
                                    transmit(message, toId, data);
                                    this.end();
                                }
                            });
                            if (toId == "parent") {
                                jobQueueForMessagesToParent.queue(job);
                            } else {
                                jobQueueForMessagesToChild.queue(job);
                            }
                        },
                        register: function(o) {
                            transmitterObjects[o.id] = o;
                        },
                        deregister: function(o) {
                            delete transmitterObjects[o.id];
                        }
                    });
                }();
            var MyTubeTransmitterObject = NJS.define({
                constructor: function(signals) {
                    if (signals) {
                        this.signals = signals;
                    }
                },
                receive: function(signal, data) {
                    var fn = this.signals[signal];
                    fn.call(this.mimiced || this, data);
                },
                transmit: function(message, toId, data) {
                    MyTubeTransmitter.transmit(message, toId, data);
                },
                mimicMe: function(who) {
                    this.mimiced = who;
                    var signals = who.signals;
                    if (signals) {
                        this.signals = who.signals;
                    }
                    NJS.mimicIf(who, this, {
                        includes: ["receive", "transmit"]
                    });
                }
            });
            var MyTubeAdapterForIFrame = NJS.define({
                tags: ["IFRAME"],
                superclass: MyTube,
                constructor: function(id, player, uiConstructor, prefs, positionHints) {
                    this._positionHints = positionHints;
                    MyTubeAdapterForIFrame.superclass.constructor.apply(this, arguments);
                    (new MyTubeTransmitterObject()).mimicMe(this);
                    MyTubeTransmitter.register(this);
                    this.videoInitialized = true;
                },
                onUserAction: function(action, data) {
                    this.transmit("userAction", this.id, {
                        action: action,
                        data: data
                    });
                },
                signals: {
                    notify: function(data) {
                        this._ui.notify(data.val);
                    },
                    stop: function(data) {
                        this._ui.stop();
                    },
                    play: function(data) {
                        this._ui.play();
                    },
                    hidePopup: function(data) {
                        this._ui.hidePopup(data.delay);
                    },
                    showPopup: function(data) {
                        this.showPopup();
                    },
                    changeStatus: function(data) {
                        this._ui.changeStatus(data.val);
                    },
                    destroy: function(data) {
                        this.cleanup();
                    },
                    closeAllNotificationWindows: function(data) {
                        this._ui.closeAllNotificationWindows();
                    },
                    showError: function(data) {
                        this._ui.showError(data.errorMsg, data.isFatal);
                    }
                },
                stopProcessing: function() {
                    MyTubeTransmitter.deregister(this);
                },
                getPlayerBoxAttributes: function(player) {
                    var playerBoxAttributes = NJS.Layout.boxAttributes(player);
                    
                    var positionHints = this._positionHints;
                    playerBoxAttributes.width = positionHints.width;
                    playerBoxAttributes.left += positionHints.left;
                    return playerBoxAttributes;
                },
                setupPlayer: NJS.emptyFn,
                cleanupPlayer: NJS.emptyFn,
                cleanupPlayerMarkers: function(player) {
                    player.removeAttribute("myTubeActiveTubeId");
                }
            });
            var MyTubeUIAdapterForIFrame = NJS.define({
                superclass: MyTubeTransmitterObject,
                constructor: function(id, tube, prefs) {
                    //since there is gonna be one ui adapter per page
                    this.id = "MyTubeUIAdapterForIFrame";
                    (new MyTubeTransmitterObject()).mimicMe(this);
                    MyTubeTransmitter.register(this);
                    var player = tube.getPlayer();
                    var playerBoxAttributes = NJS.Layout.boxAttributes(player);
                    this.transmit("createTube", "parent", {
                        prefs: prefs,
                        positionHints: playerBoxAttributes
                    });

                    var observable = new NJS.Observable();
                    observable.addEvents(["userAction"]);
                    observable.mimicMe(this);
                },
                signals: {
                    userAction: function(data) {
                        this.fire("userAction", data.action, data.data);
                    }
                },
                notify: function(title) {
                    //make sure that you dont sent title across the frames. It might be caught by message validator. So be sure.
                    this.transmit("notify", "parent");
                },
                stop: function() {
                    this.transmit("stop", "parent");
                },
                play: function() {
                    this.transmit("play", "parent");
                },
                hidePopup: function(delay) {
                    this.transmit("hidePopup", "parent", {
                        delay: delay
                    });
                },
                showPopup: function(playerBoxAttributes) {
                    this.transmit("showPopup", "parent", {
                        playerBoxAttributes: playerBoxAttributes
                    });
                },
                changeStatus: function(s) {
                    this.transmit("changeStatus", "parent", {
                        val: s
                    });
                },
                destroy: function() {
                    MyTubeTransmitter.deregister(this);
                    this.transmit("destroy", "parent");
                },
                closeAllNotificationWindows: function() {
                    this.transmit("closeAllNotificationWindows", "parent");
                },
                showError: function(errorMsg, isFatal) {
                    this.transmit("showError", "parent", {
                        errorMsg: errorMsg,
                        isFatal: isFatal
                    });
                }
            });
            var PlayerTransformer = NJS.define({
                constructor: function(el, reload) {
                    this.el = el;
                    this.reload = reload !== false;
                },
                shouldProcess: function() {
                    var el = this.el;
                    try {
                        if (el.getAttribute("myTubeProcessed") == "Y") {
                            return false;
                        }
                    } catch (ex) {
                        return false;
                    }
                    el.setAttribute("myTubeProcessed", "Y");
                    return true;
                },
                checkEl: function() {
                    if (!this.shouldProcess()) {
                        return;
                    }
                    MyTube.init();
                    var tubeId = NJS.unique("mytube");
                    this.el.setAttribute("myTubeId", tubeId);
                    this.onCheckEl(tubeId);
                    MyTube.validateTubeReadyListener();
                    if (this.reload) {
                        this.reloadElement();
                    }
                },
                onCheckEl: NJS.emptyFn,
                destroy: function() {
                    delete this.el;
                },
                reloadElement: function() {
                    var el = this.el;
                    if(!el.parentNode) { //This means that the node has not yet been inserted. Awesome.
                        return;
                    }
                    var fn = function() {
                        var oldEl = el;
                        var par = oldEl.parentNode;
                        if(!par) { //Safety check.
                            return;
                        }
                        el = oldEl.cloneNode(true);
                        var next = oldEl.nextSibling;
                        par.removeChild(oldEl);
                        if (next) {
                            par.insertBefore(el, next);
                        } else {
                            par.appendChild(el);
                        }
                    };
                    window.setTimeout(function() {
                        fn();
                    }, 1);
                }
            });
            var HTML5PlayerTransformer = NJS.define({
                superclass: PlayerTransformer,
                constructor: function(el, reload) {
                    var attr = this.attr = "src";
                    this.url = el.getAttribute(attr);
                    HTML5PlayerTransformer.superclass.constructor.call(this, el, false);
                },
                shouldProcess: function() {
                    var url = this.url;
                    if (!url) {
                        var el = this.el
                        el.addEventListener("loadstart", function() {
                            PlayerTransformer.transform(el);
                        }, true);
                        return false;
                    }
                    if (!PlayerTransformer.prototype.shouldProcess.call(this)) {
                        return false;
                    }
                    var regex1 = /^(?:(?:http|https):\/\/)?(?:www\.)?youtube\.com\/videoplayback/i;
                    var regex2 = /^(?:(?:blob:(?:(?:http|https)%3A\/\/)?))(?:www\.)?youtube\.com\//i;
                    return regex1.test(url) || regex2.test(url);
                },
                onCheckEl: function(tubeId) {
                    MyTube.onMyTubePlayerReady(tubeId);
                }
            });
            var FlashPlayerTransformer = NJS.define({
                superclass: PlayerTransformer,
                constructor: function(el, reload) {
                    this.isEmbed = el.tagName == "EMBED";
                    var attr = this.attr = this.isEmbed ? "src" : "data";
                    this.url = el.getAttribute(attr);
                    FlashPlayerTransformer.superclass.constructor.call(this, el, reload);
                },
                shouldProcess: function() {
                    if (!FlashPlayerTransformer.superclass.shouldProcess.call(this)) {
                        return false;
                    }
                    var match = this.match = this.urlMatch(this.el.getAttribute(this.attr));
                    return match;
                },
                getValue: function(name) {
                    var el = this.el;
                    if (this.isEmbed) {
                        return el.getAttribute(name);
                    }
                    var param;
                    var params = el.getElementsByTagName("PARAM");
                    for (var i = 0; i < params.length; i++) {
                        var p = params[i];
                        var n = p.getAttribute("name");
                        if (n && n.toUpperCase() == name.toUpperCase()) {
                            param = p;
                        }
                    }
                    return param ? param.getAttribute("value") : null;
                },
                setValue: function(name, val) {
                    var el = this.el;
                    if (this.isEmbed) {
                        el.setAttribute(name, val);
                        return;
                    }
                    var found = false;
                    var params = el.getElementsByTagName("PARAM");
                    for (var i = 0; i < params.length; i++) {
                        var p = params[i];
                        var n = p.getAttribute("name");
                        if (n && n.toUpperCase() == name.toUpperCase()) {
                            p.setAttribute("value", val);
                            found = true;
                        }
                    }
                    if (!found) {
                        var p = document.createElement("PARAM");
                        p.setAttribute("name", name);
                        p.setAttribute("value", val);
                        el.appendChild(p);
                    }
                },
                urlMatch: function(url) {
                    if (url == null) {
                        return false;
                    }
                    var regex1 = /^(?:(?:http|https):\/\/)?(?:www\.)?youtube\.com\/v\/./i;
                    var regex2 = /^(?:(?:http|https):\/\/)?s\.ytimg\.com\/yt\/./i;
                    var regex3 = /^(?:(?:http|https):\/\/)?s\.ytimg\.com\/yts\/./i;
                    return (regex1.test(url) ? 1 : (regex2.test(url) || regex3.test(url) ? 2 : false));
                },
                fixExperiments: function(url, toAdd, toRemove) {
                    var newUrl = "";
                
                    var existingExperiments = "";
                    var counter = 0;
                    var urlParts = url.split("&");
                    for(var i=0; i< urlParts.length; i++) {
                        var urlPart = urlParts[i];
                        var params = urlPart.split("=");
                        if(params[0] == "fexp") {
                            existingExperiments = params[1] || "";
                            continue;
                        }
                        if(counter > 0) {
                            newUrl += "&";
                        }
                        counter++;
                        newUrl += urlPart;
                    }
                    
                    existingExperiments = decodeURIComponent(existingExperiments).split(",");
                    var newExperiments = toAdd;
                    for(var i=0, len=existingExperiments.length; i<len; i++) {
                        var exp = existingExperiments[i];
                        if(toRemove.indexOf(exp) == -1 && toAdd.indexOf(exp) == -1) {
                            newExperiments.push(exp);
                        }
                    }
                    
                    if(counter > 0) {
                        newUrl += "&";
                    }
                    newUrl += "fexp=" + encodeURIComponent(newExperiments.join(","));
                    return newUrl;
                },
                fixURL: function(url, config) {
                    var el = this.el;
                    config = config || {};

                    url = url.replace(/^\?*/, "");
                    url += "&";

                    //handle basic stuff
                    url = url.replace(/(&playerapiid=).*?(&|\?|\#|$)/g, "$2");
                    url = url.replace(/(&enablejsapi=).*?(&|\?|\#|$)/g, "$2");
                    url += "&enablejsapi=1&playerapiid=" + config.tubeId;
                    url = url.replace(/(&jsapicallback=).*?(&|\?|\#|$)/g, "$2");
                    url += "&jsapicallback=onMyTubePlayerReady";

                    //handle hd on full screen
                    url = url.replace(/(&fshd=).*?(&|\?|\#|$)/g, "$2");
                    if (config.fshd) {
                        url += "&fshd=1";
                    } else {
                        url += "&fshd=0"
                    }

                    //handle quality
                    if (config.vq && config.vq != "default") {
                        url = url.replace(/(&vq=).*?(&|\?|\#|$)/g, "$2");
                        url += "&vq=" + config.vq;
                        el.setAttribute("myTubeQualitySet", "true");
                    }

                    //handle for buffer settings
                    if (MyTubePrefs.prefs.autoPlay || MyTubePrefs.prefs.autoBuffer || MyTubePrefs.prefs.saveBandwidth) {
                        url = url.replace(/(&autoplay=).*?(&|\?|\#|$)/g, "$2");
                        if (!MyTubePrefs.prefs.saveBandwidth) {
                            url += "&autoplay=1";
                            if (config.isFlashVars) {
                                url = url.replace(/(&ad_module=).*?(&|\?|\#|$)/g, "$2");
                            }
                        } else {
                            url += "&autoplay=0";
                        }
                    }

                    //handle loop
                    url = url.replace(/(&loop=).*?(&|\?|\#|$)/g, "$2");
                    url += "&loop=0";

                    //handle full screen
                    if (config.enableFullScreen) {
                        url = url.replace(/(&fs=).*?(&|\?|\#|$)/g, "$2");
                        url += "&fs=1";
                    }

                    if (MyTubePrefs.prefs.hideAnnotations) {
                        url = url.replace(/(&iv_load_policy=).*?(&|\?|\#|$)/g, "$2")
                        url += "&iv_load_policy=3";
                    }
                    
                    if(MyTubePrefs.prefs.turnOffPagedBuffering) {
                        //url = url.replace(/(&tabsb=).*?(&|\?|\#|$)/g, "$2");
                        //url += "&tabsb=0";
                        //url = url.replace(/(&tsp_buffer=).*?(&|\?|\#|$)/g, "$2");
                        //url += "&tsp_buffer=-900719925474";
                        url = url.replace(/(&threed_preroll=).*?(&|\?|\#|$)/g, "$2");
                        url = url.replace(/(&threed_module=).*?(&|\?|\#|$)/g, "$2");
                        url = url.replace(/(&dash=).*?(&|\?|\#|$)/g, "$2");
                        url += "&dash=0";
                        url = url.replace(/(&sliced_bread=).*?(&|\?|\#|$)/g, "$2");
                        url += "&sliced_bread=1";
                        //url = this.fixExperiments(url, ["900313", "900317"], []);
                    }
                    
                    var overrides = [
                    ];
                    
                    for(var i=0; i < overrides.length; i++) {
                        var key = overrides[i][0];
                        var val = overrides[i][1];
                        var reg = new RegExp("(&" + key + "=).*?(&|\\?|\\#|$)", "g");
                        url = url.replace(reg, "$2");
                        if(val !== null) {
                        url += "&" + key + "=" + val;
                        }
                    }

                    url = url.replace(/^&/, "?");
                    url = url.replace(/[&]+/g, "&");

                    return url;
                },
                onCheckEl: function(tubeId) {
                    var el = this.el;
                    var url = this.url;
                    
                    var match = this.match;
                    if (match == 1) {
                        var urlParts = url.split("?");
                        el.setAttribute(this.attr, urlParts[0] + "?" + this.fixURL(urlParts[1] || "", {
                            enableFullScreen: MyTubePrefs.prefs.enableFullScreen,
                            fshd: MyTubePrefs.prefs.fshd,
                            vq: MyTubePrefs.prefs.quality,
                            tubeId: tubeId
                        }));
                        if (MyTubePrefs.prefs.enableFullScreen) {
                            this.setValue("allowFullScreen", "true");
                        }
                    } else {
                        var flashVars = this.getValue("flashvars");
                        if (flashVars) {
                            this.setValue("flashvars", this.fixURL(flashVars, {
                                isFlashVars: true,
                                fshd: MyTubePrefs.prefs.fshd,
                                vq: MyTubePrefs.prefs.quality,
                                tubeId: tubeId
                            }));
                        }
                    }
                    
                    try {
                        this.setWMode();
                    } catch (ex) {}

                    this.setValue("allowscriptaccess", "always");
                },
                setWMode: function() {
                    var exetnsionType = MyTube.extensionType;
                    
                    var wMode = (extensionType == "chrome" || extensionType == "opera") ? "transparent" : "opaque";
                    if(extensionType == "firefox" && BrowserDetect.OS == "Linux") { //On Linux/Firefox we need to set this as flash has some issues.
                       this.setValue("wmode", wMode);
                        return;                    
                    }

                    if(MyTubePrefs.prefs.hidePopup) {
                       return;                
                    }
                
                    if(!MyTubePrefs.pageInfo.youTubeMakka || MyTubePrefs.pageInfo.youTubeFrame) {
                        this.setValue("wmode", wMode);                  
                    }
                }
            });
            NJS.apply(PlayerTransformer, {
                constructors: {
                    "EMBED": FlashPlayerTransformer,
                    "OBJECT": FlashPlayerTransformer,
                    "VIDEO": HTML5PlayerTransformer
                },
                transform: function(el) {
                    if (!el) {
                        return;
                    }
                    var tagName = el.tagName;
                    var constructor = this.constructors[tagName];
                    if (!constructor) {
                        return;
                    }
                    var c = new constructor(el, true);
                    try {
                        c.checkEl();
                    } finally {
                        c.destroy();
                    }
                }
            });

            var Bootstrap = function() {
                    var cssInitialized = false;
                    var listenersInitialized = false;
                    var handleAllElements = function() {
                        var fn = function(tagName) {
                            var els = document.documentElement.getElementsByTagName(tagName);
                            for (var i = 0; i < els.length; i++) {
                                var el = els[i];
                                try {
                                    PlayerTransformer.transform(el);
                                } catch (ex) {}
                            }
                        };
                        fn("EMBED");
                        fn("OBJECT");
                        fn("VIDEO");
                    };

                    handleAllElements = NJS.createBuffered(handleAllElements, 100);

                    var initListeners = function() {
                        if(listenersInitialized) {
                            return;
                        }
                        listenersInitialized = true;

                        MyTube.setTubeReadyListener();

                        window.addEventListener("load", function() {
                            handleAllElements();
                        }, false);
                        document.addEventListener("DOMContentLoaded", function() {
                            handleAllElements();
                        }, false);

                        var onDomLoaded = function() {
                            handleAllElements();
                            var observer = MyTube.mutationObserver = MyTube.mutationObserver || new window.MyTubeMutationObserver(logger);
                            observer.observeAdded((function() {
                                handleAllElements();
                            }));
                        };
                        if (document.readyState == "interactive") {
                            onDomLoaded();
                            return;
                        }
                        document.addEventListener("DOMContentLoaded", function(mutations) {
                            onDomLoaded();
                        }, false);
                        handleAllElements();
                    };

                    var domNodeInserted = function(e) {
                        var t = e.target;
                        var nodeName = t.nodeName;
                        if (nodeName == "EMBED" || nodeName == "OBJECT" || nodeName == "VIDEO" || nodeName == "IFRAME") {
                            PlayerTransformer.transform(t);
                        }
                        if (!t.getElementsByTagName) {
                            return;
                        }
                        var fn = function(tagName) {
                            var ts = t.getElementsByTagName(tagName);
                            for (var i = 0; i < ts.length; i++) {
                                PlayerTransformer.transform(ts[i]);
                            }
                        };
                        NJS.safeFunction(fn, this)("EMBED");
                        NJS.safeFunction(fn, this)("OBJECT");
                        NJS.safeFunction(fn, this)("VIDEO");
                        NJS.safeFunction(fn, this)("IFRAME");
                    };

                    var afterFn = function() {
                        MyTubePrefs.un("preferencesUpdated", afterFn);
                        if(!MyTubePrefs.prefs.enable) {
                            return;
                        }
                        initListeners();
                        handleAllElements();
                    };

                    var initPrefsWithCallback = function(callback) {
                        var fn = function() {
                            MyTubePrefs.un("preferencesUpdated", fn);
                            callback();
                        };
                        MyTubePrefs.on("preferencesUpdated", fn);
                        MyTubePrefs.init();
                    };

                    var run = function() {
                        initPrefsWithCallback(afterFn);
                    };
                    return ({
                        run: function() {
                            run();
                        },
                        transformAbandoned: function() {
                            run();
                        }
                    });
                }();

            MyTube.extensionType = "firefox";
            return Bootstrap;
        };
    window.MyTubeBootstrap = window.MyTubeBootstrap || createBootstrap();

    window.MyTubeBootstrap.run();
})(this);
