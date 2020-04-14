## DeepL深度翻译器

> DeepL一个程序员的翻译神器，可能有人要问，市面上这么多的翻译插件这么多，我为毛要用你的。
>
> 首先这个翻译神器可以实现多个翻译引擎的翻译，目前支持有道和google，下一步我会把最近特别流行的翻译软件DeepL加入（其实最开始就想要加，奈何DeepL的反扒太牛逼了）。

### 开始

- **[GitHub]( https://github.com/WumaCoder/mini-tools.git)**
- **[作者码云](https://gitee.com/wuma/mini-tools)**
- **[作者简书](https://www.jianshu.com/u/c5090bf9d2f3)**
- **[安装脚本](https://greasyfork.org/zh-CN/scripts/400334-deepl)**

### 特征

- *多引擎*
- *页面翻译*
- *自动翻译（这里包括自动翻译页面，自动翻译ajax更新的信息）*
- *忽略单词（这里的忽略表示跳过，下同）*
- *忽略元素*
- *忽略域名*
- *替换指定的单词*
- *命令窗口*
- *可配置*
- *无服务器*

### 使用

#### 页面翻译

安装好后打开一个英文的网站，具体安装点击上方的安装脚本

![image-20200414101306521](https://user-gold-cdn.xitu.io/2020/4/14/171768b7a650d8d9?w=1896&h=903&f=png&s=235291)

然后点击翻译页面

![image-20200414101341671](https://user-gold-cdn.xitu.io/2020/4/14/171768b8e6793aed?w=403&h=858&f=png&s=75261)

ok翻译完成

![image-20200414101423124](https://user-gold-cdn.xitu.io/2020/4/14/171768c1d292a139?w=1904&h=899&f=png&s=188791)

#### 显示原文

如果我们想显示原文，只需要点击`切换原文/翻译`按钮

![image-20200414101648590](https://user-gold-cdn.xitu.io/2020/4/14/171768c29e25c020?w=400&h=823&f=png&s=65749)

效果如下

![image-20200414101659748](https://user-gold-cdn.xitu.io/2020/4/14/171768c37fdd0f69?w=1920&h=908&f=png&s=228775)

#### 使用命令

点击打开命令的功能即可。

具体命令如下：

- 'conf set isAuto', '配置是否自动翻译,格式: conf set isAuto <0|1> ,0是关闭 1是开启'
- 'conf set transEngine', '配置翻译引擎,格式: conf set transEngine <ge> ,ge是谷歌'
- 'conf set transOrigLang', '配置翻译源语言,格式: conf set transOrigLang <自动>'
- 'conf set transTargetLang', '配置目标语言,格式: conf set transTargetLang <中文简体>'
- 'conf set ignoreWork add', '添加忽略的单词,格式: conf set ignoreWork add <单词>'
- 'conf set ignoreWork del', '删除忽略的单词,格式: conf set ignoreWork del <单词>'
- 'conf set ignoreElement add', '添加忽略的元素（这里填的是定位这个元素的CSS选择器的格式）,格式: conf set ignoreElement add <元素选择器>
- 'conf set ignoreElement del', '删除忽略的元素（这里填的是定位这个元素的CSS选择器的格式）,格式: conf set ignoreElement del <元素选择器>'
- 'conf set ignoreUrl add', '添加忽略的翻译的域名,格式: conf set ignoreUrl add <url>'
- 'conf set ignoreUrl del', '删除忽略翻译的域名,格式: conf set ignoreUrl del <url>'
- 'conf set replaceWork add', '添加翻译之前替换的单词,格式: conf set replaceWork add <匹配单词/替换单词>'
- 'conf set replaceWork del', '删除翻译之前替换的单词,格式: conf set replaceWork del <匹配单词>'
- 'conf get all', '获取所有的配置'
- 'conf init', '复位配置'

> 注意：参数位置的`<>`这对尖括号表示必须要填的，正在在写的时候不需要加尖括号，并且参数中不能存在空格。输入命令后按击Enter执行
>
> 如： conf set isAuto 1 表示开启自动翻译









