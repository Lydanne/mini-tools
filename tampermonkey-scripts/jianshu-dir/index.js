// ==UserScript==
// @name         jianshu-dir
// @name:zh      简书目录
// @name:en      jianshu-dir
// @namespace    https://github.com/holleworldabc/mini-tools.git
// @homepageURL  https://github.com/holleworldabc/mini-tools.git
// @version      0.1
// @description  简书的目录
// @author       wm
// @match        https://www.jianshu.com/p/*
// @grant        none
// ==/UserScript==

(function () {
  function parserTag (el) {
    return {
      hx: el.tagName.substr(1) * 1,
      name: el.innerText,
      top: el.offsetTop - 80
    }
  }
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
        text-decoration: underline;
        color:inherit;
      }
      .jianshu-a:hover{
        color:inherit;
        text-decoration: underline;
      }
      .jianshu-scroll{
        overflow-y: auto;
        height: 85vh;
      }
      .jianshu-scroll::-webkit-scrollbar{
        background:#fff;
        width:0px;
        transintion:all 0.36s;
      }
      .jianshu-scroll::-webkit-scrollbar-thumb{
        background:#ec7259;
      }
      .jianshu:hover > .jianshu-scroll::-webkit-scrollbar{
        width:6px;
      }
    `;
    document.body.appendChild(style);
  }
  function initEvent () {
    window.addEventListener('scroll', (e) => {
      window.scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    });
  }
  // function 
  function toScroll (top) {
    let current = window.scrollTop;
    let step = current > top ? 1 : -1;
    const timer = setInterval(() => {
      if (step == 1 && current < top) {
        clearInterval(timer);
      }
      if (step == -1 && current > top) {
        clearInterval(timer);
      }
      current += step;
      scrollTo(0, current);
    }, 1);
  }
  function createDirView (hxTags) {
    const listElement = document.querySelector("[role=main] > aside > div > div > section")
    const titleElement = listElement.firstChild.cloneNode();
    const itemElement = listElement.lastChild.cloneNode();
    let minHx = 10;
    listElement.innerHTML = "";
    listElement.parentNode.classList.add('jianshu');
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
      listItem.addEventListener('click', () => toScroll(item.top));
      if (item.hx != minHx) {
        listItem.style.marginLeft = `10px`;
      }
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
    console.log("jianshu-dir load ok");
    console.log("github: https://github.com/holleworldabc/mini-tools/#mini-tools 获取更多脚本");

  }
  function main () {
    setTimeout(() => {
      const hxTags = getHxTags().map(item => parserTag(item));
      createDirView(hxTags);
    }, 1500);
  }

  initEvent();
  initStyle();
  main();
  // Your code here...
})();