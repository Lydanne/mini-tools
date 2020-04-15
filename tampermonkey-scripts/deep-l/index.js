// ==UserScript==
// @name         deepL
// @name:zh      深度翻译器
// @name:en      deepL
// @namespace    https://github.com/WumaCoder/mini-tools.git
// @homepageURL  https://github.com/WumaCoder/mini-tools.git
// @version      1.0.1
// @description  基于deepL、google、youdao开发的第三方翻译插件，可以实现页面的智能自动翻译，最有特色的是他可以添加忽略翻译
// @description:en A third-party translation plugin based on deepL Translations
// @author       WumaCoder
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_openInTab
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        GM_listValues
// @grant        GM_deleteValue
// @connect      deepl.com
// @connect      cdn.jsdelivr.net
// @connect      cdn.bootcss.com
// @connect      translate.google.cn
// @connect      fanyi.youdao.com
// @connect      fanyi.baidu.com
// @license      GPL-3.0-only
// @require      https://cdn.bootcss.com/jquery/1.11.1/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/jquery.md5@1.0.2/index.min.js
// ==/UserScript==

(function () {

  //----------引用------------------
  /*
  * @name      menuCommand.js
  * @version   0.0.1
  * @author    Blaze
  * @date      2019/9/21 14:22
  * 来自 HTML5视频播放器增强脚本
 */
  const monkeyMenu = {
    on (title, fn, accessKey) {
      return window.GM_registerMenuCommand && window.GM_registerMenuCommand(title, fn, accessKey)
    },
    off (id) {
      return window.GM_unregisterMenuCommand && window.GM_unregisterMenuCommand(id)
    },
    /* 切换类型的菜单功能 */
    switch (title, fn, defVal) {
      const t = this;
      t.on(title, fn);
    }
  };

  //---以下这些代码来自https://github.com/zyufstudio/TM/tree/master/webTranslate
  /**
   * 字符串模板格式化
   * @param {string} formatStr - 字符串模板
   * @returns {string} 格式化后的字符串
   * @example
   * StringFormat("ab{0}c{1}ed",1,"q")  output "ab1cqed"
   */
  function StringFormat (formatStr) {
    var args = arguments;
    return formatStr.replace(/\{(\d+)\}/g, function (m, i) {
      i = parseInt(i);
      return args[i + 1];
    });
  }
  /**
   * 日期格式化
   * @param {Date} date - 日期
   * @param {string} formatStr - 格式化模板
   * @returns {string} 格式化日期后的字符串
   * @example
   * DateFormat(new Date(),"yyyy-MM-dd")  output "2020-03-23"
   * @example
   * DateFormat(new Date(),"yyyy/MM/dd hh:mm:ss")  output "2020/03/23 10:30:05"
   */
  function DateFormat (date, formatStr) {
    var o = {
      "M+": date.getMonth() + 1, //月份
      "d+": date.getDate(), //日
      "h+": date.getHours(), //小时
      "m+": date.getMinutes(), //分
      "s+": date.getSeconds(), //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(formatStr)) {
      formatStr = formatStr.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(formatStr)) {
        formatStr = formatStr.replace(
          RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      }
    }
    return formatStr;
  }
  /**
   * 生成Guid
   * @param {boolean} hasLine - guid字符串是否包含短横线
   * @returns {string} guid
   * @example 
   * Guid(false)  output "b72f78a6cb88362c0784cb82afae450b"
   * @example
   * Guid(true) output "67b25d43-4cfa-3edb-40d7-89961ce7f388"
   */
  function Guid (hasLine) {
    var guid = "";
    function S4 () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    if (hasLine) {
      guid = (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }
    else {
      guid = (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
    }
    return guid;
  }

  function ObjectToQueryString (object) {
    var querystring = Object.keys(object).map(function (key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(object[key])
    }).join('&');
    return querystring;
  }

  //谷歌翻译
  var googleTrans = {
    code: "ge",
    codeText: "谷歌",
    defaultOrigLang: "en",         //默认源语言
    defaultTargetLang: "zh-CN",      //默认目标语言
    langList: { "auto": "自动检测", "zh-CN": "中文简体", "zh-TW": "中文繁体", "en": "英文", "ja": "日文", "ko": "韩文", "fr": "法文", "es": "西班牙文", "pt": "葡萄牙文", "it": "意大利文", "ru": "俄文", "vi": "越南文", "de": "德文", "ar": "阿拉伯文", "id": "印尼文" },
    Execute: function (h_onloadfn) {
      var h_url = "";
      var googleTransApi = StringFormat("https://translate.google.cn/translate_a/single?client=gtx&dt=t&dj=1&sl={1}&tl={0}&hl=zh-CN", Trans.transTargetLang, Trans.transOrigLang);
      h_url = googleTransApi + "&q=" + encodeURIComponent(Trans.transText);

      GM_xmlhttpRequest({
        method: "GET",
        url: h_url,
        onload: function (r) {
          console.log(r)
          setTimeout(function () {
            var data = JSON.parse(r.responseText);
            var trans = [], origs = [], src = "";
            for (var i = 0; i < data.sentences.length; i++) {
              var getransCont = data.sentences[i];
              trans.push(getransCont.trans);
              origs.push(getransCont.orig);
            }
            src = data.src;
            Trans.transResult.trans = trans;
            Trans.transResult.orig = origs;
            Trans.transResult.origLang = src;
            h_onloadfn();
          }, 300);
        },
        onerror: function (e) {
          console.error(e);
        }
      });
    },
  };

  //有道翻译
  var youdaoTrans = {
    code: "yd",
    codeText: "有道",
    defaultOrigLang: "en",         //默认源语言
    defaultTargetLang: "ZH-CHS",     //默认目标语言
    langList: { "AUTO": "自动检测", "zh-CHS": "中文简体", "en": "英文", "ja": "日文", "ko": "韩文", "fr": "法文", "es": "西班牙文", "pt": "葡萄牙文", "it": "意大利文", "ru": "俄文", "vi": "越南文", "de": "德文", "ar": "阿拉伯文", "id": "印尼文" },
    Execute: function (h_onloadfn) {
      var h_url = "",
        h_headers = {},
        h_data = "";

      var youdaoTransApi = "http://fanyi.youdao.com/translate_o?client=fanyideskweb&keyfrom=fanyi.web&version=2.1&doctype=json";
      var tempsalt = "" + (new Date).getTime() + parseInt(10 * Math.random(), 10);
      var tempsign = $.md5("fanyideskweb" + Trans.transText + tempsalt + "Nw(nmmbP%A-r6U3EUn]Aj");
      h_url = youdaoTransApi;
      h_headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": "http://fanyi.youdao.com/"
      };
      h_data = StringFormat("from={0}&to={1}&salt={2}&sign={3}&i={4}", Trans.transOrigLang, Trans.transTargetLang, tempsalt, tempsign, Trans.transText);

      GM_xmlhttpRequest({
        method: "POST",
        url: h_url,
        headers: h_headers,
        data: h_data,
        onload: function (r) {
          console.log(r)
          setTimeout(function () {
            var data = JSON.parse(r.responseText);
            var trans = [],
              origs = [],
              src = "";
            if (data.errorCode == 0) {
              for (var j = 0; j < data.translateResult.length; j++) {
                var ydTransCont = data.translateResult[j];
                var ydtgt = "";
                var ydsrc = "";
                for (var k = 0; k < ydTransCont.length; k++) {
                  var ydcont = ydTransCont[k];
                  ydtgt += ydcont.tgt;
                  ydsrc += ydcont.src;
                }
                trans.push(ydtgt);
                origs.push(ydsrc);
              }
              src = data.type;
              Trans.transResult.trans = trans;
              Trans.transResult.orig = origs;
              Trans.transResult.origLang = src.split("2")[0];

            }
            h_onloadfn();
          }, 300);
        },
        onerror: function (e) {
          console.error(e);
        }
      });
    },
  };

  function a (r) {
    if (Array.isArray(r)) {
      for (var o = 0, t = Array(r.length); o < r.length; o++)
        t[o] = r[o];
      return t
    }
    return Array.from(r)
  }

  function n (r, o) {
    for (var t = 0; t < o.length - 2; t += 3) {
      var a = o.charAt(t + 2);
      a = a >= "a" ? a.charCodeAt(0) - 87 : Number(a),
        a = "+" === o.charAt(t + 1) ? r >>> a : r << a,
        r = "+" === o.charAt(t) ? r + a & 4294967295 : r ^ a;
    }
    return r
  }

  function e (r, gtk) {
    var i = null;
    var o = r.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g);
    if (null === o) {
      var t = r.length;
      t > 30 && (r = "" + r.substr(0, 10) + r.substr(Math.floor(t / 2) - 5, 10) + r.substr(-10, 10));
    } else {
      for (var e = r.split(/[\uD800-\uDBFF][\uDC00-\uDFFF]/), C = 0, h = e.length, f = []; h > C; C++)
        "" !== e[C] && f.push.apply(f, a(e[C].split(""))),
          C !== h - 1 && f.push(o[C]);
      var g = f.length;
      g > 30 && (r = f.slice(0, 10).join("") + f.slice(Math.floor(g / 2) - 5, Math.floor(g / 2) + 5).join("") + f.slice(-10).join(""));
    }
    var u = void 0
      ;
    u = null !== i ? i : (i = gtk || "") || "";
    for (var d = u.split("."), m = Number(d[0]) || 0, s = Number(d[1]) || 0, S = [], c = 0, v = 0; v < r.length; v++) {
      var A = r.charCodeAt(v);
      128 > A ? S[c++] = A : (2048 > A ? S[c++] = A >> 6 | 192 : (55296 === (64512 & A) && v + 1 < r.length && 56320 === (64512 & r.charCodeAt(v + 1)) ? (A = 65536 + ((1023 & A) << 10) + (1023 & r.charCodeAt(++v)),
        S[c++] = A >> 18 | 240,
        S[c++] = A >> 12 & 63 | 128) : S[c++] = A >> 12 | 224,
        S[c++] = A >> 6 & 63 | 128),
        S[c++] = 63 & A | 128);
    }
    for (var p = m, F = "" + String.fromCharCode(43) + String.fromCharCode(45) + String.fromCharCode(97) + ("" + String.fromCharCode(94) + String.fromCharCode(43) + String.fromCharCode(54)), D = "" + String.fromCharCode(43) + String.fromCharCode(45) + String.fromCharCode(51) + ("" + String.fromCharCode(94) + String.fromCharCode(43) + String.fromCharCode(98)) + ("" + String.fromCharCode(43) + String.fromCharCode(45) + String.fromCharCode(102)), b = 0; b < S.length; b++)
      p += S[b],
        p = n(p, F);
    return p = n(p, D),
      p ^= s,
      0 > p && (p = (2147483647 & p) + 2147483648),
      p %= 1e6,
      p.toString() + "." + (p ^ m)
  }

  /**
   * @param  {string} word
   * @param  {string} gtk
   * @return {string}
   */
  var calcSign = function (word, gtk) {
    return e(word, gtk);
  };

  //获取gtk和token
  function GetToken () {
    GM_xmlhttpRequest({
      method: "GET",
      url: "https://fanyi.baidu.com/",
      timeout: 5000,
      onload: function (r) {
        var gtkMatch = /window\.gtk = '(.*?)'/.exec(r.responseText);
        var commonTokenMatch = /token: '(.*?)',/.exec(r.responseText);
        if (!gtkMatch) {
          console.log("获取gtk失败！！！");
        }
        if (!commonTokenMatch) {
          console.log("获取token失败！！！");
        }
        var newGtk = gtkMatch[1];
        var newCommonToken = commonTokenMatch[1];

        if (typeof newGtk !== 'undefined') {
          baiduTrans.gtk = newGtk;
        }
        if (typeof newCommonToken !== 'undefined') {
          baiduTrans.token = newCommonToken;
        }
      },
      onerror: function (e) {
        console.error(e);
      }
    });
  }

  //百度翻译
  var baiduTrans = {
    code: "bd",
    codeText: "百度",
    gtk: "",
    token: "",
    defaultOrigLang: "en",         //默认源语言
    defaultTargetLang: "zh",         //默认目标语言
    langList: { "auto": "自动检测", "zh": "中文", "cht": "繁体中文", "en": "英语", "jp": "日语", "kor": "韩语", "fra": "法语", "spa": "西班牙语", "pt": "葡萄牙语", "it": "意大利语", "ru": "俄语", "vie": "越南语", "de": "德语", "ara": "阿拉伯语" },
    Execute: function (h_onloadfn) {
      if (Trans.transOrigLang == "auto")
        this.AutoTrans(h_onloadfn);
      else
        this.ExecTrans(h_onloadfn);

    },
    AutoTrans: function (h_onloadfn) {
      var self = this;
      var datas = {
        query: Trans.transText
      };
      GM_xmlhttpRequest({
        method: "POST",
        headers: {
          "referer": 'https://fanyi.baidu.com',
          "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        url: "https://fanyi.baidu.com/langdetect",
        data: ObjectToQueryString(datas),
        onload: function (r) {
          var data = JSON.parse(r.responseText);
          if (data.error === 0) {
            Trans.transOrigLang = data.lan;
            self.ExecTrans(h_onloadfn);
          }
        },
        onerror: function (e) {
          console.error(e);
        }
      });
    },
    ExecTrans: function (h_onloadfn) {
      var tempSign = calcSign(Trans.transText, this.gtk);
      var datas = {
        from: Trans.transOrigLang,
        to: Trans.transTargetLang,
        query: Trans.transText,
        transtype: "translang",
        simple_means_flag: 3,
        sign: tempSign,
        token: this.token
      };
      GM_xmlhttpRequest({
        method: "POST",
        headers: {
          "referer": 'https://fanyi.baidu.com',
          "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8',
          //"User-Agent": window.navigator.userAgent,
        },
        url: "https://fanyi.baidu.com/v2transapi",
        data: ObjectToQueryString(datas),
        onload: function (r) {
          setTimeout(function () {
            var result = JSON.parse(r.responseText);
            var trans_result = result.trans_result;
            var transDatas = trans_result.data;

            var trans = [], origs = [], src = "";
            for (var i = 0; i < transDatas.length; i++) {
              var getransCont = transDatas[i];
              trans.push(getransCont.dst);
              origs.push(getransCont.src);
            }
            src = trans_result.from;
            Trans.transResult.trans = trans;
            Trans.transResult.orig = origs;
            Trans.transResult.origLang = src;
            h_onloadfn();
          }, 300);
        },
        onerror: function (e) {
          console.error(e);
        }
      });
    },
    init: function () {
      GetToken();
    }
  };

  var Trans = {
    transEngineList: {},         //翻译引擎实例列表
    transEngine: "",             //当前翻译引擎。ge(谷歌)/yd(有道)
    transEngineObj: {},          //当前翻译引擎实例
    transTargetLang: "",         //目标语言。
    transOrigLang: "",           //源语言
    transType: "text",           //翻译类型。word(划词翻译)/text(输入文本翻译)/page(整页翻译)
    transText: "",               //被翻译内容
    transResult: {               //当前翻译内容
      //译文
      trans: [],
      //原文
      orig: [],
      //原文语言
      origLang: ""
    },
    Execute: function (h_onloadfn) {
      this.transResult.trans = [];
      this.transResult.orig = [];
      this.transResult.origLang = "";
      this.transEngineObj.Execute(h_onloadfn);
    },
    GetLangList: function () {
      var langList = {};
      langList = this.transEngineObj.langList;
      return langList;
    },
    Update: function () {
      this.transResult.trans = [];
      this.transResult.orig = [];
      this.transResult.origLang = "";
      this.transEngineObj = this.transEngineList[this.transEngine];
      this.transTargetLang = this.transEngineObj.defaultTargetLang;
      this.transOrigLang = this.transEngineObj.defaultOrigLang;
    },
    Clear: function () {
      this.transEngine = "";                //当前翻译引擎。ge(谷歌)/yd(有道)
      this.transTargetLang = "";            //目标语言。
      this.transOrigLang = "";             //源语言
      this.transText = "";                   //被翻译内容
      this.transResult.trans = [];
      this.transResult.orig = [];
      this.transResult.origLang = "";
    },
    //注册翻译引擎接口并执行翻译引擎的初始化接口
    RegisterEngine: function () {
      /**
       * 翻译引擎必须提供以下接口
          code:"",                    //代号
          codeText:"",                //代号描述
          defaultOrigLang:"",         //默认源语言
          defaultTargetLang:"",       //默认目标语言
          langList: {},               //支持翻译语言列表
          Execute: function (h_onloadfn) {},     //执行翻译
          init:function(){},          //可选，初始化接口，在脚本创建时立即执行
       */
      var transEngineListObj = {};
      transEngineListObj[googleTrans.code] = googleTrans;
      transEngineListObj[youdaoTrans.code] = youdaoTrans;
      transEngineListObj[baiduTrans.code] = baiduTrans;
      this.transEngineList = transEngineListObj;
      for (var key in this.transEngineList) {
        if (this.transEngineList.hasOwnProperty(key) && this.transEngineList[key].hasOwnProperty("init")) {
          this.transEngineList[key].init();
        }
      }
    }
  };

  //-------------初始化--------------
  let store = null;
  let config = null;
  function initData () {
    store = new Store({
      /**
       * 默认配置项
       * isAuto:Boolean = false           是否自动翻译
       * transEngine:String = 'ge'    翻译引擎
       * transOrigLang:String = '自动'    源语言
       * transTargetLang：String = '中文简体' 目标语言
       * ignoreWork:String[]      忽略的单词
       * allowUrl:String[]        允许自动翻译的URL
       * ignoreUrl:String[]       忽略自动翻译的URL（优先）
       * ignoreElement:String[]   忽略的元素（这里填的是定位这个元素的CSS选择器的格式）
       * replaceWork:Object[]     翻译之前替换的单词,Object:{match:RegExp|String,value:String}match是匹配，value是替换的值
       */
      config: {
        isAuto: false,
        transEngine: 'ge',
        transOrigLang: '自动',
        transTargetLang: '中文简体',
        ignoreWork: [
          'Express',
          'Fastify',
          'Nest',
          'node',
          'angular',
          'yarn'
        ],
        allowUrl:[
          'github.com',
          'nestjs.com',
          'apollographql.com'
        ],
        ignoreUrl: [
          'www.runoob.com',
        ],
        ignoreElement: [
          'code',
          '.cli',
          'style',
          'script',
          '.repository-topics-container',
          '.file-navigation',
          '#js-repo-pjax-container > div.container-lg.clearfix.new-discussion-timeline.px-3 > div > div.Box.mb-3.Box--condensed',
          '.highlight>pre',
          '#js-repo-pjax-container > div.pagehead.repohead.hx_repohead.readability-menu.bg-gray-light.pb-0.pt-3 > div',
          '.gatsby-highlight'
        ],
        replaceWork: []
      }
    });
    config = store.config;
  }

  /**
   * 初始化自定义样式
   */
  function initStyle () {
    const style = document.createElement("style");
    style.innerText = `
    
    `;
    document.body.appendChild(style);
  }
  /**
   * 初始化事件
   */
  function initEvent () {
    cliUI.on('conf set isAuto', '配置是否自动翻译,格式: conf set isAuto <0|1> ,0是关闭 1是开启', ([v]) => {
      config.isAuto = v * 1;
      console.log(config.isAuto)
      store.save();
    });
    cliUI.on('conf set transEngine', '配置翻译引擎,格式: conf set transEngine <ge> ,ge是谷歌', ([v]) => {
      config.transEngine = v;
      console.log(config.transEngine);
      store.save();
    });
    cliUI.on('conf set transOrigLang', '配置翻译源语言,格式: conf set transOrigLang <自动>', ([v]) => {
      config.transOrigLang = v;
      console.log(config.transOrigLang);
      store.save();
    });
    cliUI.on('conf set transTargetLang', '配置目标语言,格式: conf set transTargetLang <中文简体>', ([v]) => {
      config.transTargetLang = v;
      console.log(config.transTargetLang);
      store.save();
    });
    cliUI.on('conf set ignoreWork add', '添加忽略翻译的单词,格式: conf set ignoreWork add <单词>', ([v]) => {
      config.ignoreWork.push(v);
      console.log(config.ignoreWork);
      store.save();
    });
    cliUI.on('conf set ignoreWork del', '删除忽略翻译的单词,格式: conf set ignoreWork del <单词>', ([v]) => {
      const index = config.ignoreWork.findIndex(item => item.match == v);
      config.ignoreWork.splice(index, 1);
      console.log(config.ignoreWork);
      store.save();
    });
    cliUI.on('conf set ignoreElement add', '添加忽略翻译的元素（这里填的是定位这个元素的CSS选择器的格式）,格式: conf set ignoreElement add <元素选择器>', ([v]) => {
      config.ignoreElement.push(v);
      console.log(config.ignoreElement);
      store.save();
    });
    cliUI.on('conf set ignoreElement del', '删除忽略翻译的元素（这里填的是定位这个元素的CSS选择器的格式）,格式: conf set ignoreElement del <元素选择器>', ([v]) => {
      const index = config.ignoreElement.findIndex(item => item.match == v);
      config.ignoreElement.splice(index, 1);
      console.log(config.ignoreElement);
      store.save();
    });
    cliUI.on('conf set allowUrl add', '添加允许的自动翻译的URL,格式: conf set allowUrl add <url>', ([v]) => {
      if(!config.allowUrl){
        config.allowUrl = [];
      }
      config.allowUrl.push(v);
      console.log(config.allowUrl);
      store.save();
    });
    cliUI.on('conf set allowUrl del', '删除允许自动翻译的URL,格式: conf set allowUrl del <url>', ([v]) => {
      const index = config.allowUrl.findIndex(item => item.match == v);
      config.allowUrl.splice(index, 1);
      console.log(config.allowUrl);
      store.save();
    });
    cliUI.on('conf set ignoreUrl add', '添加忽略自动翻译的URL,格式: conf set ignoreUrl add <url>', ([v]) => {
      config.ignoreUrl.push(v);
      console.log(config.ignoreUrl);
      store.save();
    });
    cliUI.on('conf set ignoreUrl del', '删除忽略自动翻译的URL,格式: conf set ignoreUrl del <url>', ([v]) => {
      const index = config.ignoreUrl.findIndex(item => item.match == v);
      config.ignoreUrl.splice(index, 1);
      console.log(config.ignoreUrl);
      store.save();
    });
    cliUI.on('conf set replaceWork add', '添加翻译之前替换的单词,格式: conf set replaceWork add <匹配单词/替换单词>', ([v]) => {
      const arr = v.split('/');
      config.replaceWork.push({
        match: arr[0],
        value: arr[1]
      });
      console.log(config.replaceWork);
      store.save();

    });
    cliUI.on('conf set replaceWork del', '删除翻译之前替换的单词,格式: conf set replaceWork del <匹配单词>', ([v]) => {
      const index = config.replaceWork.findIndex(item => item.match == v);
      config.replaceWork.splice(index, 1);
      console.log(config.replaceWork);
      store.save();
    });
    cliUI.on('conf get all', '获取所有的配置', ([v]) => {
      console.log(config);
    });
    cliUI.on('conf init', '复位配置', ([v]) => {
      store.remove('config');
      initData();
      console.log(config);
    });
    document.body.addEventListener('mouseup', (e) => {
      const path = e.path;
      if (path.length && config.isAuto) {
        for (let i = 0; i < path.length; i++) {
          const item = path[i];
          if (item.nodeName === 'A') {
            setTimeout(exec, 1000)
            break;
          }
        }
      }
    });
  }

  /**
   * 初始化菜单
   */
  function initMenu () {
    monkeyMenu.on('打开命令', function () {
      cliUI.show();
    });
    monkeyMenu.on('翻译页面', async function () {
      let next = true;
      while (next) {
        next = await exec();
        await new Promise(resolve => {
          setTimeout(resolve, 300);
        })
      }
    });
    monkeyMenu.on('切换原文/翻译', function () {
      switchText();
    });
    monkeyMenu.on('更新脚本', function () {
      window.GM_openInTab('https://greasyfork.org/zh-CN/scripts/400334-deepl', {
        active: true,
        insert: true,
        setParent: true
      });
    });
    monkeyMenu.on('关于', function () {
      window.GM_openInTab('https://github.com/WumaCoder/mini-tools', {
        active: true,
        insert: true,
        setParent: true
      });
    });
    monkeyMenu.on('反馈', function () {
      window.GM_openInTab('https://github.com/WumaCoder/mini-tools/issues', {
        active: true,
        insert: true,
        setParent: true
      });
    });
  }
  let cliUI = null;
  function initView () {
    cliUI = new CLI();
  }

  /**
   * 节流函数
   * @param {Function} func 回调
   * @param {Number} wait 时间
   * @return {Function} 返回是执行函数
   */
  function throttle (func, wait) {
    let previous = 0;
    return function () {
      let now = Date.now();
      let context = this;
      let args = arguments;
      if (now - previous > wait) {
        func.apply(context, args);
        previous = now;
      }
    }
  }

  //----------------工具函数------------------
  /**
   * 防抖
   * @param {*} fn 
   * @param {*} wait 
   * @return {Function} 返回是执行函数
   */
  function debounce (fn, wait) {
    let timeout = null;
    return function () {
      if (timeout !== null) clearTimeout(timeout);
      timeout = setTimeout(fn, wait);
    }
  }

  /**
   * 将字符串转化为doument
   */
  function toDocument (str = "") {
    str = str.replace(/\r\n\f/igm, '');
    const dom = document.createElement('DOM');
    dom.innerHTML = str;
    return dom;
  }


  /**
   * 深度筛选DOM树
   * @param {Element | Node} node 一个节点
   */
  const resRules = [ //所有规则都为true才可以通过
    (el) => {
      return typeof el.nodeValue === 'string';
    },
    (el) => {
      return Boolean(el.nodeValue.replace(/[\W]+/igm, ''));
    },
  ];
  /**
   * 深度遍历body，检查出有文本的元素
   */
  let nodeList = []; //存储有文本的节点
  let _nodeList = [];//这个和上面一样，但是这个不会被清空
  let textCount = 0; //计数器
  let maxTextCount = 100;
  function deepFilterList (node) {
    const { ignoreElement } = config;
    switch (node.nodeName) {
      case '#text':
        for (let i = 0; i < resRules.length; i++) {
          const res = resRules[i];
          if (!res(node)) {
            return;
          }
        }
        if (!node['data-ok'] && maxTextCount > (textCount+node.nodeValue.length)) {
          textCount+=node.nodeValue.length;
          nodeList.push(node);
        }
      default:
        for (let i = 0; i < node.childNodes.length; i++) {
          const el = node.childNodes[i];
          let f = false;
          for (let j = 0; j < ignoreElement.length; j++) {
            const item = ignoreElement[j];
            const temp = document.querySelector(item);

            if (temp && temp.nodeName == el.nodeName && temp.className == el.className) {
              f = true;
              break;
            }
          }
          if (f) {
            continue;
          }
          deepFilterList(el);
        }
        break;
    }
  }

  function transformToDLJobs (nodeList = []) {
    const tempList = [];
    for (let i = 0; i < nodeList.length; i++) {
      const item = nodeList[i];
      const preItem = i !== 0 ? [nodeList[i - 1].nodeValue] : [];
      const nextItem = i !== nodeList.length - 1 ? [nodeList[i + 1].nodeValue] : [];
      tempList.push({
        "kind": "default",
        "raw_en_sentence": item.nodeValue,
        "raw_en_context_before": preItem,
        "raw_en_context_after": nextItem,
        "preferred_num_beams": 1
      });
    }
    return tempList;
  }

  // 将nodeList内的英文转化为字符串
  function transformToString (nodeList) {
    let str = ""
    for (let i = 0; i < nodeList.length; i++) {
      const item = nodeList[i];
      str += item.nodeValue.trim();
      str += ". _SPT_ "
    }
    return str;
  }
  //上面的反向
  function reTransformToString (arr) {
    const str = arr.map(item => item.replace(/[。 ]+$/igm, ' ')).join('');
    return reTransformIgnoreWork(str).split('_SPT_');
  }
  /**
   * 为字符串添加忽略标记
   * @param {*} str 字符串
   */
  function transformIgnoreWork (str) {
    const { ignoreWork, replaceWork } = config;
    replaceWork.forEach(item => {
      str = str.replace(new RegExp(item.match,'gm'), item.value);
    });
    ignoreWork.forEach((item, index) => {
      str = str.replace(new RegExp(item, 'igm'), '%' + index + '%')
    });
    return str;
  }

  /**
   * 将反义反转
   * @param {*} str 字符串
   */
  function reTransformIgnoreWork (str) {
    const { ignoreWork } = config;
    str = str.replace(/％/gm,'%');
    ignoreWork.forEach((item, index) => {
      str = str.replace(new RegExp('%' + index + '%', 'gm'), item)
    });
    return str;
  }

  /**
   * 最后的操作
   * @param {*} arr dom
   * @param {*} arr2 fanyi
   */
  function replaceNodeValue (arr, arr2) {
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      item['data-text'] = item.nodeValue;
      item['data-ok'] = 1;
      _nodeList.push(item);
      item.nodeValue = arr2[i];
    }
  }
  /**
   * 原文切换
   * @param {*} arr nodeList
   */
  function switchText () {
    let arr = _nodeList;

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      const temp = item['data-text'];
      item['data-text'] = item.nodeValue;
      item.nodeValue = temp;
    }
  }

  async function exec () {
    nodeList = [];
    textCount = 0;
    deepFilterList(document.body);
    if (nodeList.length === 0) {
      return false;
    }
    let str = transformToString(nodeList);
    str = transformIgnoreWork(str);
    Trans.RegisterEngine();
    Trans.transEngine = config.transEngine;
    Trans.Update();
    Trans.transText = str;//'Updating vue-cli-plugin-apollo will also update both Apollo Client and its configuration for you!';
    await new Promise(resolve => {
      Trans.Execute(() => {
        const arr2 = reTransformToString(Trans.transResult.trans);
        replaceNodeValue(nodeList, arr2);
        resolve();
      });
    });
    return true;
  }

  function isFanyi () {
    // deepFilterList(document.body);
    let f = false;
    for (let i = 0; i < config.allowUrl.length; i++) {
      if (window.location.href.match(new RegExp(config.allowUrl[i], 'igm'))) 
        f=true;
    }
    for (let i = 0; i < config.ignoreUrl.length; i++) {
      if (window.location.href.match(new RegExp(config.ignoreUrl[i], 'igm'))) 
        f=false;
    }
    return f;
  }
  //------------------操作类--------------------------
  /**
   * 永久保存的数据类
   */
  class Store {
    constructor(obj) {
      this._keys = Object.keys(obj);
      this._keys.forEach(key => {
        obj[key] = GM_getValue(key, obj[key]);
      });
      Object.assign(this, obj);
    }
    save () {
      this._keys.forEach(key => {
        GM_setValue(key, this[key]);
      })
    }
    remove (key) {
      GM_deleteValue(key);
    }
  }
  class CLI {
    constructor() {
      this.cmds = [];
      this.initStyle();
      this.initView();
      this.initEvent();
      this.hide();
    }
    initStyle () {
      const style = document.createElement('style');
      style.innerText = `.cli{
        position: fixed;
        top: 0;
        width: 50vw;
        margin: 0 25vw;
      background: #fff;
      border: 1px solid gainsboro;
      border-top: 0;
      padding: 10px;
      box-shadow: #ddd 0 0 5px 5px;
      font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
      user-select: none;
      z-index:1000000000000000;
    }
    .cli-top{
      width: 100%;
    }
    .cli-input{
      display: block;
      height: 40px;
      width: 98%;
      font-size: 25px;
      padding:0 5px;
      font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
    }
    .cli-tip{
      color: grey;
      margin-top: 5px;
    }
    .cli-list{
      border-top:1px solid #ddd;
      margin-top: 10px;
      max-height:500px;
      overflow-y:auto;
    }
    .cli-item{
      font-size: 20px;
      border-bottom: 1px solid #ddd;
      padding: 5px 10px;
    }
    .cli-item:hover{
      background-color: #ddd;
    }
    .cli-info{
      font-size: 14px;
      color: gray;
    }`;
      document.body.appendChild(style)
    }

    initView () {
      this.main = document.createElement('DIV');
      this.main.innerHTML = `
      <div class="cli">
        <div class="cli-top">
          <input class="cli-input" type="text" value=">">
          </div>
          <div>
            </div>
    <div class="cli-tip">
      <span>Please press [ESC] to exit, or press [Enter] to execute the command. Please go to the console to see the output.</span>
      </div>
    <div class="cli-list">
      </div>
      </div>
      `
      document.body.appendChild(this.main);
      this.list = this.main.querySelector('.cli-list');
      this.input = this.main.querySelector('.cli-input');
    }

    initEvent () {
      this.input.addEventListener('input', () => {
        const value = this.input.value;
        const list = this.matchCmds(value);
        if (list.length === 1) {
          this.matchCmd = list[0];
        }
        this.clearMatchList();
        this.addItems(list);
      });
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.matchCmd = this.matchCmds(this.input.value)[0] || null;
          if (!this.matchCmd) {
            this.clearMatchList();
            this.addItems([{ orgCmd: '没有匹配到命令', info: '暂无该命令' }]);
            return;
          }
          const cmdStr = this.input.value.substr(1);
          const matchCmdStr = this.matchCmd.cmd.join(' ');
          this.matchCmd.callback(cmdStr.replace(matchCmdStr + ' ', '').split(/ +/igm));
          this.input.value = '>';
        }
      });
      document.addEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
          this.hide();
        } else if (e.key === 'Tab') {
          if (this.matchCmd)
            this.input.value = '>' + this.matchCmd.orgCmd;
        }
      });
      this.input.focus();
      this.input.setSelectionRange(1, 1);
    }

    matchCmds (ucmd) {
      if (!ucmd.match(/>/igm)) {
        return false;
      }
      if (!ucmd.match(/\w/igm)) {
        return false;
      }
      ucmd = ucmd.substr(1);
      const { cmd } = this.parser(ucmd);
      const str = cmd.join('');
      return this.cmds.filter(item => {
        const str2 = item.cmd.join('');
        if (str.length > str2.length) {
          return str.match(new RegExp(str2, 'igm'))
        } else {
          return str2.match(new RegExp(str, 'igm'))
        }
      })
    }

    parser (orgCmd) {
      const tokens = orgCmd.split(/ +/igm);
      const args = tokens.filter(item => item.match(/^\$\w+/igm));
      const cmd = tokens.filter(item => item.match(/^\w+/igm));
      return { tokens, args, cmd };
    }

    on (orgCmd, info, callback) {
      const { cmd, args } = this.parser(orgCmd);
      const ret = {
        orgCmd,
        cmd,
        args,
        info,
        callback
      };
      this.cmds.push(ret);
      if (ret) this.addItems([ret]);
    }

    createItem (orgCmd, info) {
      const div = document.createElement('DIV');
      div.className = 'cli-item';
      div.innerHTML = `<div>
            <span>${orgCmd}</span>
          </div>
          <div class="cli-info">
            <span>${info}
            </span>
          </div>`;
      div.addEventListener('click', () => {
        this.input.value = '>' + orgCmd;
        this.input.focus()
      });
      return div;
    }

    addItems (items = []) {
      items && items.forEach(item => {
        this.list.appendChild(this.createItem(item.orgCmd, item.info));
      });
    }

    clearMatchList () {
      for (let i = this.list.childNodes.length - 1; i >= 0; i--) {
        const node = this.list.childNodes[i];
        node.remove();
      }
    }

    show () {
      this.main.style.display = 'block';
    }

    hide () {
      this.main.style.display = 'none';
    }
  }


  /**
   * 入口
   */
  async function main () {
    initData();
    initStyle();
    initMenu();
    initView();
    initEvent();
    maxTextCount = config.transEngine == 'yd' ? 100 : 1000;
    
    if (config.isAuto && isFanyi()) {
      let next = true;
      while (next) {
        next = await exec();
        await new Promise(resolve => {
          setTimeout(resolve, 300);
        })
      }

    }
    console.log(config)
  }
  main();
  //---------------------
  // Your code here...
})();
