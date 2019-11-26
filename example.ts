import dbCreator  from "./dist/index";
import { resolve } from "path";

const dbPath = resolve(__dirname, "./db.jsonx");

dbCreator()
    .read(dbPath)
    .then(db => {
        // db.query((key: string, val: any, parent: any) => {
        //     return Array.isArray(val);
        // });
        // const queryed = db.getQueryCache();
        // console.log(queryed);
        // db.update("user.name", "alan", { insert: true });
        // db.insert("user", {
        //     name: "alan",
        //     age: 26
        // });
        // db.insert("login", [
        //     { timeStamp: new Date(), user: "alan" },
        //     { timeStamp: new Date(), user: "lucy" },
        //     { timeStamp: new Date(), user: "eroc" },
        // ]);
        // db.update("user.name", "alan");
        console.log(db.getAll());
        // console.log(db);
        // db.write();
    })