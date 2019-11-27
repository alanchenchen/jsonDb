### 初始化
包导出只有一个函数,无参数，导入函数直接调用即可：
```js
import dbCreator  from "./dist/index";

/**
 * 已经对构造函数做了单例限制，无论你调用多少次，只存在一个实例，为了避免io操作冲突 
 */
dbCreator();
```

### 实例方法

#### read (读取db到内存)
两个参数，参数一是db文件绝对路径，必选。参数二是一个字符串，可选，读取指定顶层key的数据到内存里。返回一个promise，所有对db数据的操作都必须在then里执行
```js
import dbCreator  from "./dist/index";
import { resolve } from "path";

const dbPath = resolve(__dirname, "./db.jsonx");
dbCreator()
    // 如果path存在，读取已有文件，否则会在write的时候新建一个db文件
    // filter如果不传，或者filter在db的顶层key里找不到，则会读取db的所有字节
    .read(dbPath， "user")
    .then(db => {

    });
```

#### write (写入内存数据到db)
无参数。返回一个promise
```js
import dbCreator  from "./dist/index";
import { resolve } from "path";

const dbPath = resolve(__dirname, "./db.jsonx");
dbCreator()
    .read(dbPath， "user")
    .then(db => {
        // write必须在read调用之后，
        db.write();
    });
```

#### has (是否存在key)
一个参数，支持链式写法，`user.alan.name`。返回一个boolean
```js
import dbCreator  from "./dist/index";
import { resolve } from "path";

const dbPath = resolve(__dirname, "./db.jsonx");
dbCreator()
    .read(dbPath， "user")
    .then(db => {
        db.has("user.name");
    });
```

#### getAll (获取当前内存空间里所有数据,数据只读)
无参数。返回一个object
```js
import dbCreator  from "./dist/index";
import { resolve } from "path";

const dbPath = resolve(__dirname, "./db.jsonx");
dbCreator()
    .read(dbPath， "user")
    .then(db => {
        db.getAll();
    });
```

#### get (获取指定key的数据,数据只读)
一个参数，支持链式写法，`user.alan.name`。如果匹配不到，会返回undefined
```js
import dbCreator  from "./dist/index";
import { resolve } from "path";

const dbPath = resolve(__dirname, "./db.jsonx");
dbCreator()
    .read(dbPath， "user")
    .then(db => {
        db.get("user.alan.name");
    });
```

#### update (更新指定key的数据)
三个参数，参数一是key，支持链式写法，`user.alan.name`。参数二是更新的数据，参数三是个对象，目前仅支持`insert`一个key，可选，默认为false，当为true时，如果key不存在，会自动新建。返回db实例本身，支持链式调用。
```js
import dbCreator  from "./dist/index";
import { resolve } from "path";

const dbPath = resolve(__dirname, "./db.jsonx");
dbCreator()
    .read(dbPath， "user")
    .then(db => {
        // 如果db中不存在user.alan.name，则会给出警告，不做任何处理
        db.update("user.alan.name", "alan");
        // 如果db中不存在user.alan.name，会直接新建数据，相当于insert方法，但是insert方法多做了一层判断
        db.update("user.alan.name", "lucy", { insert: true });
    });
```

#### insert (新增指定key的数据)
两个参数，参数一是key，支持链式写法，`user.alan.name`。参数二是新增的数据。返回db实例本身，支持链式调用。
```js
import dbCreator  from "./dist/index";
import { resolve } from "path";

const dbPath = resolve(__dirname, "./db.jsonx");
dbCreator()
    .read(dbPath， "user")
    .then(db => {
        // 如果db中已经存在user.alan.name，则会给出警告，不做任何处理，此时你需要使用的是update
        db.insert("user.alan.name", "alan");
    });
```

#### delete (删除指定key的数据)
一个参数，参数一是key，支持链式写法，`user.alan.name`。返回db实例本身，支持链式调用。
```js
import dbCreator  from "./dist/index";
import { resolve } from "path";

const dbPath = resolve(__dirname, "./db.jsonx");
dbCreator()
    .read(dbPath， "user")
    .then(db => {
        // 如果db中不存在user.alan.name，则会给出警告，不做任何处理
        db.delete("user.alan.name", "alan");
    });
```

#### query (根据查询条件查询指定key的数据)
一个参数，参数一可以是string也可以是function，当是string时，会查询到所有匹配key的数据，当是function时，会查询所有函数返回值为true的数据。返回查询到的数据列表。
```js
import dbCreator  from "./dist/index";
import { resolve } from "path";

const dbPath = resolve(__dirname, "./db.jsonx");
dbCreator()
    .read(dbPath， "user")
    .then(db => {
        /**
         * string类型
         * 会找出当前内存中符合所有key是name的数据，支持对象嵌套，也就是说，不管是深入多少层对象的key，都会匹配到，不建议嵌套太多，递归可能会造成内存栈溢出
         * 
         */
        db.query("name");

        /**
         * function类型
         * 会找出所有值类型为数组的数据，支持对象嵌套
         * 回调函数支持3个参数
         * key：对象的key
         * val：对象的value
         * parent：当前对象的父级对象，可以用来过滤，主要是拿来赋值
         */
        db.query((key, val, parent) => {
            return Array.isArray(val);
        })
        /**
         * 处理查询到的数据
         * 当拿到数据后，被查询到的所有数据会被缓存起来，只有当再次调用query方法才会被重置，如果需要对查询后的数据增删查改，则需要for循环，直接使用parent和key就能实现增删查改，因为* parent是db数据的浅拷贝，拥有指针* 地址
         */
        .forEach((key, val, parent) => {
            // 修改
            parent[key] = 2333;
            // 新增
            parent["status"] = "on";
            // 查询
            console.log(val);
            // 删除
            delete parent.key
        });
    });
```

#### getQueryCache (查询上次query后保存的数据)
无参数。
```js
import dbCreator  from "./dist/index";
import { resolve } from "path";

const dbPath = resolve(__dirname, "./db.jsonx");
dbCreator()
    .read(dbPath， "user")
    .then(db => {
        // 主要用于，query之后处理过后，需要再次处理数据，则不需要query第二次
        db.getQueryCache();
    });
```

### 小tips
1. 尽可能多用链式写法，比如`user.name.age`这种。
2. 如果需要增删查改数组类型的数据，还是使用`user.list`属性写法，已经对数组操作做了兼容处理。
3. 目前只支持读取一个顶层key的内存空间，如果你需要操作`user`的数据后再操作`list`的数据，一定要保证先write再read读取另外的内存空间。
4. 目前不支持并发操作，很有可能会造成io读写异常，必须要保证内存被写入后再读取。