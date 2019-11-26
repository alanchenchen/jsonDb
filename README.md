# jsonDb


![](https://img.shields.io/npm/v/@alanchenchen/jsonDb.svg)
![](https://img.shields.io/npm/dt/@alanchenchen/jsonDb.svg)
[![LICENSE](https://img.shields.io/badge/license-Anti%20996-blue.svg)](https://github.com/996icu/996.ICU/blob/master/LICENSE)

a small db controller saving with json file
> Author：Alan Chen

> Version: 0.0.1

> Date: 2019/11/26

## purpose

1. lowdb适用的场景，jsonDb都适用，我个人认为，这种以本地文件存储数据的插件，比较适合electron本地应用和非常轻量的server。
2. lowdb本身没对数据读写做什么处理，它更像是一个通用的api插件，支持adapter来实现读写数据的接口。虽然兼容了browser端，但是我个人认为localstorage本身就是阻塞操作，还不如localforage集成的indexdb和websql来的高效。
3. lowdb自带的adapter对node端处理的太过于[暴力](https://github.com/typicode/lowdb/blob/master/src/adapters/FileAsync.js)，导致在读写体积稍微大一点的json文件（[作者说是200m左右](https://github.com/typicode/lowdb#usage)）时，就会导致卡顿，甚至内存崩溃。
4. jsonDb在对读取文件时，做了分片读取，通过jsonDb生成的`.jsonx`文件都会附带一个索引映射`.map`文件。开发者可以指定读取部分字节大小的数据到内存中，而且索引文件会同步更新，这样就避免了内存崩溃和io读取耗时太长。

> 其实jsonDb也可以写成lowdb的一个adapter，但是在下不太喜欢依赖太多，加上一些api可能也不好实现，因此写了一个单独的插件

## disadvantage

1. 虽然jsonDb在一定程度上解决了读取大文件的耗时和内存崩溃问题，但是随着`.jsonx`文件越来越大，`.map`文件也势必越来越大，尤其当`.jsonx`文件的key超级庞大，这样就gg了。。。
2. 原本最理想的情况是，读写都实现分片，但是在写入文件时遇到[坑](./doc/mistakes.md)了。。。
3. lowdb由于集成了lodash，所以在处理数据上会非常好用，jsonDb没有，但是提供了一个query方法自定义查询，如果你觉得还是不够的话。自己用lodash再次处理吧.

## usage
1. `git clone https://github.com/alanchenchen/jsonDb.git`
2. `cd jsonDb`然后`yarn`安装好依赖
3. 接着使用下面的脚本命令即可，目前入口文件是example.ts

## api
[传送门](./doc/api.md)

## scripts

1. `npm start`等同于`npm run serve`,通过ts-node启动example.ts.
2. `npm build`编译ts文件到dist目录.

## license
* Anti 996(996.ICU)