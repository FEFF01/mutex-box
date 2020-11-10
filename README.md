## mutex-box

> * WEB拖放网格控制器，支持原生JS或任意MVC MVVM框架
> * 支持 上 下 左 右 四个方向排挤元素
> * 支持动态增删改元素，动态配置网格列数等等
> * [测试链接-原生JS](https://feff01.github.io/mutex-box/dist/test.html)
> * [测试链接-VUE](https://feff01.github.io/mutex-box/dist/test_vue.html)
> * [网址导航编辑器-VUE](http://www.holdhot.com/#/editor)

![image](https://feff01.github.io/static/img/holdhot_1.gif)
![image](https://feff01.github.io/static/img/mutex_box_1.gif)


## 安装

```
    npm install mutex-box
```
> * 免安装可直接保存 `https://feff01.github.io/mutex-box/dist/js/mutex_box.js` 文件，本地 script 引入后通过 `window.MutexBox` 使用


## 应用

> * 浏览器环境
[方法文档](https://github.com/FEFF01/mutex-box/blob/master/dist/mutex_box.d.ts)
[数据文档](https://github.com/FEFF01/mutex-box/blob/master/dist/interfaces.d.ts)
```javascript

    /**
     * @description 与父容器DOM相关的交互控制器
     */
    import MutexBox from 'mutex-box';
    //const MutexBox = require('mutex-box').default;
    //const MutexBox = window.MutexBox;
    
```

> * 各种JS环境
[方法文档](https://github.com/FEFF01/mutex-box/blob/master/dist/js/mutex_model.d.ts)
[数据文档](https://github.com/FEFF01/mutex-box/blob/master/dist/js/interfaces.d.ts)
```javascript
    /**
     * @description 和使用场景无关的交互控制器，输入当前状态可获得各种需要输出的交互
     */
    import {MutexModel} from 'mutex-box';
    //const {MutexModel} = require('mutex-box');
    //const {MutexModel} = window.MutexBox;
```

