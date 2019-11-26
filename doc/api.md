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
两个参数，参数一是db文件绝对路径，必选。参数二是一个字符串，读取指定顶层key的数据到内存里。返回一个promise，所有对db数据的操作都必须在then里执行
```js
import dbCreator  from "./dist/index";
import { resolve } from "path";

const dbPath = resolve(__dirname, "./db.jsonx");
dbCreator()
    // 如果path存在，读取已有文件，否则会在write的时候新建一个db文件
    // filter如果不传，或者filter在db里找不到，则会读取db的所有字节
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

#### getAll (获取当前内存空间里所有数据)
无参数，支持链式写法，`user.alan.name`。返回一个object
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