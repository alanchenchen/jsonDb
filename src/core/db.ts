import { print } from "../helper/util";
import { condition, queryStructure, mapFlag } from "../helper/type";
import { resolveQueryKey, resolveQueryChainKey} from "../helper/queryHelper";
import {
    isDbExist,
    createDbFile,
    readDb
} from "../helper/dbHelper";
import {
    createDbMap,
    readDbMap
} from "../helper/mapHelper";

class DB {
    private needCreateDb: boolean;
    private preCreatedDbFilePath: string;
    private bufferData: any;
    private dbMap: mapFlag[];
    /**
     * if undefined, means reading all bytes at once
     */
    private currentMapFlag: mapFlag;
    private queryStrutures: queryStructure[];

    constructor() {
        return this._init();
    }

    /**
     * limit single instance
     */
    private _init() {
        if ((this as any).ExistedInstance !== null) {
            print.info("you could create and use only one db instance at the same time");
            return (this as any).ExistedInstance;
        } else if ((this as any).ExistedInstance === null) {
            (DB.prototype as any).ExistedInstance = this;
            return this;
        }
    }

    /**
     * load or pre-create db file
     * 
     * @param path required
     */
    private load(path: string): void {
        if (typeof path !== "string") {
            print.error("path must be a path string");
            process.exit();
        }
        const hasExistDbStatus = isDbExist(path);
        if (hasExistDbStatus === true) {
            this.needCreateDb = false;
        } else if (hasExistDbStatus === "ENOENT") {
            this.needCreateDb = true;
            this.bufferData = {};
        }
        this.preCreatedDbFilePath = path;
    }

    /**
     * read db to memory cache
     * 
     * @param path required
     * @param filter top key also means namespace, if undefined or not suit, will read all bytes
     */
    async read(path: string, filter: string = ""): Promise<DB> {
        try {
            this.load(path);
            if (!this.needCreateDb) {
                if (filter.trim() !== "") {
                    this.dbMap = readDbMap(this.preCreatedDbFilePath);
                    this.currentMapFlag = this.dbMap.find((item: any) => item.f === filter);
                }
                const { buf } = await readDb(this.preCreatedDbFilePath, this.currentMapFlag);
                this.bufferData = buf;
            }
            return this;
        } catch (error) {
            print.error(error);
        }
    }

    /**
     * write buffer to db file
     */
    async write(): Promise<void> {
        try {
            if (this.bufferData && this.preCreatedDbFilePath) {
                await createDbFile(
                    this.preCreatedDbFilePath,
                    JSON.stringify(this.bufferData),
                    this.currentMapFlag,
                    this.dbMap
                );
                await createDbMap(
                    this.preCreatedDbFilePath,
                    JSON.stringify(this.bufferData),
                    this.currentMapFlag,
                    this.dbMap
                );
            } else {
                print.warn("you need call read firstly");
            }
        } catch (error) {
            print.error(error);
        }
    }

    /**
     * judge whether has key
     * 
     * @param keyChain 
     */
    has(keyChain: string): boolean {
        const { obj, key, isKeyLost } = resolveQueryChainKey(this.bufferData, keyChain);
        return !isKeyLost && obj.hasOwnProperty(key);
    }

    /**
     * get all buffer data deep clone, the data is readonly.
     */
    getAll(): any {
        return JSON.parse(JSON.stringify(this.bufferData));
    }

    /**
     * get target value deep clone, the data is readonly.
     * 
     * @param keyChain 
     */
    get(keyChain: string): any {
        const { obj, key, isKeyLost } = resolveQueryChainKey(this.bufferData, keyChain);
        const res = !isKeyLost && obj[key]
                  ? JSON.parse(JSON.stringify(obj[key]))
                  : undefined;
        return res;
    }

    /**
     * update target value
     * 
     * @param keyChain 
     * @param value 
     * @param insert 
     */
    update(keyChain: string, value: any, { insert } = { insert: false }): DB {
        const haskey = this.has(keyChain);
        const { obj, key, isKeyLost } = resolveQueryChainKey(this.bufferData, keyChain, insert);
        const isTypeSuitable = Object.prototype.toString.call(obj) === "[object Object]" || Array.isArray(obj);
        if (
            (insert || haskey) &&
            isTypeSuitable
        ) {
            obj[key] = value;
        } else if (!haskey && !insert) {
            print.warn(`you need insert a new data first since property ${key} can not be found`);
        } else if (!isTypeSuitable) {
            print.warn(`property ${key} can not be set to no-object type`);
        }
        return this;
    }

    /**
     * insert a new data
     * 
     * @param keyChain 
     * @param value 
     */
    insert(keyChain: string, value: any): DB {
        const haskey = this.has(keyChain);
        if (!haskey) {
            this.update(keyChain, value, { insert: true });
        } else {
            print.warn(`there is already target key ${keyChain}, you may need to update data`);
        }
        return this;
    }

    /**
     * delete a data
     * 
     * @param keyChain 
     */
    delete(keyChain: string): DB {
        const { obj, key, isKeyLost } = resolveQueryChainKey(this.bufferData, keyChain);
        if (!isKeyLost && obj.hasOwnProperty(key)) {
            if (Array.isArray(obj)) {
                obj.splice(Number.parseInt(key), 1);
            } else {
                delete obj[key];
            }
        } else {
            print.warn(`property ${keyChain} is not existed`);
        }
        return this;
    }

    /**
     * query data by condition callback
     * 
     * @param condition 
     */
    query(condition: condition): queryStructure[] {
        let targetNode: queryStructure[] = [];
        const callback = (key: string, val: any, parent: any) => {
            targetNode.push({
                parent,
                key,
                val
            });
        }
        if (typeof condition === "string") {
            resolveQueryKey(this.bufferData, (key: string) => {
                return key === condition;
            }, callback)
        } else if (typeof condition === "function") {
            resolveQueryKey(this.bufferData, condition, callback)
        }
        this.queryStrutures = targetNode;
        return this.queryStrutures;
    }

    /**
     * get filter data after querying
     */
    getQueryCache(): queryStructure[] {
        return this.queryStrutures;
    }

}

(DB.prototype as any).ExistedInstance = null;

export default DB;