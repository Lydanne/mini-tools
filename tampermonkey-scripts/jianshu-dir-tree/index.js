// ==UserScript==
// @name         jianshu-dir-tree
// @name:zh      简书目录树
// @name:en      jianshu-dir-tree
// @namespace    https://github.com/holleworldabc/mini-tools.git
// @homepageURL  https://github.com/holleworldabc/mini-tools.git
// @version      1.0.0
// @description  简书的目录
// @author       wm
// @match        https://www.jianshu.com/p/*
// @match        http://www.jianshu.com/p/*
// @require      https://raw.githubusercontent.com/holleworldabc/mini-tools/master/tampermonkey-scripts/jianshu-dir-tree/anime.min.js
// @grant        none
// ==/UserScript==

(function () {
  /**
   * 提取主要信息
   * @param {Element} el 页面元素
   */
  function parserTag (el) {
    return {
      hx: el.tagName.substr(1) * 1,
      name: el.innerText,
      top: el.offsetTop - 80
    }
  }
  /**
   * 获取简书文章中的标题
   */
  function getHxTags () {
    const hxTags = [];
    const tags = document.querySelector("section:nth-child(1) > article").children;
    for (let i = 0; i < tags.length; i++) {
      const item = tags[i];
      if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(item.tagName)) {
        hxTags.push(item);
      }
    }
    return hxTags;
  }
  /**
   * 初始化自定义样式
   */
  function initStyle () {
    const style = document.createElement("style");
    style.innerText = `
      .jianshu-a{
        display: block;
        font-size: 14px;
        line-height: 22px;
        color: #2d2d2d;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      }
      .jianshu-active{
        color:#ec7259;
      }
      .jianshu-a:hover{
        color:inherit;
        text-decoration: underline;
      }
      .jianshu-scroll{
        overflow-y: auto;
        height: 85vh;
      }
      .jianshu-scroll::-webkit-scrollbar,html::-webkit-scrollbar{
        background:#fff;
        width:0px;
        transintion:all 0.36s;
      }
      html::-webkit-scrollbar{
        width:6px
      }
      .jianshu-scroll::-webkit-scrollbar-thumb,html::-webkit-scrollbar-thumb{
        background:#ec7259;
      }
      #jianshu-dir:hover > .jianshu-scroll::-webkit-scrollbar{
        width:6px;
      }

    `;
    document.body.appendChild(style);
  }
  /**
   * 初始化事件
   */
  function initEvent () {
    window.scrollTop = 0;
    const activeCall = throttle(active, 100);
    window.addEventListener('scroll', (e) => {
      window.scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      activeCall();
    });
  }
  /**
   * 节流函数
   * @param {Function} func 回调
   * @param {Number} wait 时间
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
  /**
   * 激活当前标题
   */
  function active () {
    const hxTags = window.hxTags;
    const scrollTop = window.scrollTop;
    const hxElements = document.getElementsByClassName('jianshu-a');
    const jianshuDir = document.getElementsByClassName('jianshu-scroll')[0];
    let j = 0;
    for (let i = 0; i < hxTags.length; i++) {
      const el = hxTags[i];
      if (el.top > scrollTop) {
        hxElements[i].classList.add('jianshu-active');
        j = i + 1;
        break;
      } else {
        hxElements[i].classList.remove('jianshu-active');
      }
    }
    if (j - 1 < 10)
      toScroll((x, y) => jianshuDir.scrollTop = y, jianshuDir.scrollTop, 0);
    else
      toScroll((x, y) => jianshuDir.scrollTop = y, jianshuDir.scrollTop, hxElements[j - 10 % hxTags.length].offsetTop);
    for (; j < hxTags.length; j++) {
      const el = hxElements[j];
      el.classList.remove('jianshu-active');
    }
  }
  /**
   * 设置滚动条位置
   * @param {number} top 滚动条跳转位置
   */
  function toScroll (scrollFun, start, end) {
    let scroll = {
      charged: '0%',
      cycles: start
    }
    anime({
      targets: scroll,
      charged: '100%',
      cycles: end,
      round: 1,
      easing: 'easeInOutQuint',
      update: function () {
        scrollFun(0, scroll.cycles);
      }
    });
  }
  /**
   * 创建目录面板
   * @param {Array} hxTags 标题标签
   */
  function createDirView (hxTags) {
    const listElement = document.querySelector("[role=main] > aside > div > div > section")
    const titleElement = listElement.firstChild.cloneNode();
    const itemElement = listElement.lastChild.cloneNode();
    let minHx = 10;
    listElement.innerHTML = "";
    listElement.parentNode.id = "jianshu-dir";
    listElement.classList.add('jianshu-scroll');
    titleElement.innerHTML = "目录";
    listElement.appendChild(titleElement);
    hxTags.forEach(item => {
      if (minHx > item.hx) {
        minHx = item.hx;
      }
    });
    hxTags.forEach(item => {
      const listItem = itemElement.cloneNode();
      listItem.addEventListener('click', () => toScroll(window.scrollTo, window.scrollTop, item.top));
      listItem.style.marginLeft = `${(item.hx - minHx) * 10}px`;
      const tag = `<a class="jianshu-a">${item.name}</a>`;
      listItem.innerHTML = tag;
      listElement.appendChild(listItem);
    })
    if (hxTags.length === 0) {
      const listItem = itemElement.cloneNode();
      listItem.id = "listItem";
      listItem.innerHTML = `<span style="font-size: 12px;color: #969696;">本篇文章暂无目录</span>`;
      listElement.appendChild(listItem);
    }
    console.log("jianshu-dir-tree load ok");
    console.log("github: https://github.com/holleworldabc/mini-tools/#mini-tools 获取更多脚本");

  }
  /**
   * 入口
   */
  function main () {
    setTimeout(() => {
      const hxTags = getHxTags().map(item => parserTag(item));
      window.hxTags = hxTags;
      createDirView(hxTags);
    }, 1500);
  }

  initEvent();
  initStyle();
  main();
  // Your code here...
})();