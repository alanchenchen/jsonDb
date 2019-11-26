"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../helper/util");
const queryHelper_1 = require("../helper/queryHelper");
const dbHelper_1 = require("../helper/dbHelper");
const mapHelper_1 = require("../helper/mapHelper");
class DB {
    constructor() {
        return this._init();
    }
    /**
     * limit single instance
     */
    _init() {
        if (this.ExistedInstance !== null) {
            util_1.print.info("you could create and use only one db instance at the same time");
            return this.ExistedInstance;
        }
        else if (this.ExistedInstance === null) {
            DB.prototype.ExistedInstance = this;
            return this;
        }
    }
    /**
     * load or pre-create db file
     *
     * @param path required
     */
    load(path) {
        if (typeof path !== "string") {
            util_1.print.error("path must be a path string");
            process.exit();
        }
        const hasExistDbStatus = dbHelper_1.isDbExist(path);
        if (hasExistDbStatus === true) {
            this.needCreateDb = false;
        }
        else if (hasExistDbStatus === "ENOENT") {
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
    read(path, filter = "") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.load(path);
                if (!this.needCreateDb) {
                    if (filter.trim() !== "") {
                        this.dbMap = mapHelper_1.readDbMap(this.preCreatedDbFilePath);
                        this.currentMapFlag = this.dbMap.find((item) => item.f === filter);
                    }
                    const { buf } = yield dbHelper_1.readDb(this.preCreatedDbFilePath, this.currentMapFlag);
                    this.bufferData = buf;
                }
                return this;
            }
            catch (error) {
                util_1.print.error(error);
            }
        });
    }
    /**
     * write buffer to db file
     */
    write() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.bufferData && this.preCreatedDbFilePath) {
                    yield dbHelper_1.createDbFile(this.preCreatedDbFilePath, JSON.stringify(this.bufferData), this.currentMapFlag, this.dbMap);
                    yield mapHelper_1.createDbMap(this.preCreatedDbFilePath, JSON.stringify(this.bufferData), this.currentMapFlag, this.dbMap);
                }
                else {
                    util_1.print.warn("you need call read firstly");
                }
            }
            catch (error) {
                util_1.print.error(error);
            }
        });
    }
    /**
     * judge whether has key
     *
     * @param keyChain
     */
    has(keyChain) {
        const { obj, key, isKeyLost } = queryHelper_1.resolveQueryChainKey(this.bufferData, keyChain);
        return !isKeyLost && obj.hasOwnProperty(key);
    }
    /**
     * get all buffer data deep clone, the data is readonly.
     */
    getAll() {
        return JSON.parse(JSON.stringify(this.bufferData));
    }
    /**
     * get target value deep clone, the data is readonly.
     *
     * @param keyChain
     */
    get(keyChain) {
        const { obj, key, isKeyLost } = queryHelper_1.resolveQueryChainKey(this.bufferData, keyChain);
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
    update(keyChain, value, { insert } = { insert: false }) {
        const haskey = this.has(keyChain);
        const { obj, key, isKeyLost } = queryHelper_1.resolveQueryChainKey(this.bufferData, keyChain, insert);
        const isTypeSuitable = Object.prototype.toString.call(obj) === "[object Object]" || Array.isArray(obj);
        if ((insert || haskey) &&
            isTypeSuitable) {
            obj[key] = value;
        }
        else if (!haskey && !insert) {
            util_1.print.warn(`you need insert a new data first since property ${key} can not be found`);
        }
        else if (!isTypeSuitable) {
            util_1.print.warn(`property ${key} can not be set to no-object type`);
        }
        return this;
    }
    /**
     * insert a new data
     *
     * @param keyChain
     * @param value
     */
    insert(keyChain, value) {
        const haskey = this.has(keyChain);
        if (!haskey) {
            this.update(keyChain, value, { insert: true });
        }
        else {
            util_1.print.warn(`there is already target key ${keyChain}, you may need to update data`);
        }
        return this;
    }
    /**
     * delete a data
     *
     * @param keyChain
     */
    delete(keyChain) {
        const { obj, key, isKeyLost } = queryHelper_1.resolveQueryChainKey(this.bufferData, keyChain);
        if (!isKeyLost && obj.hasOwnProperty(key)) {
            if (Array.isArray(obj)) {
                obj.splice(Number.parseInt(key), 1);
            }
            else {
                delete obj[key];
            }
        }
        else {
            util_1.print.warn(`property ${keyChain} is not existed`);
        }
        return this;
    }
    /**
     * query data by condition callback
     *
     * @param condition
     */
    query(condition) {
        let targetNode = [];
        const callback = (key, val, parent) => {
            targetNode.push({
                parent,
                key,
                val
            });
        };
        if (typeof condition === "string") {
            queryHelper_1.resolveQueryKey(this.bufferData, (key) => {
                return key === condition;
            }, callback);
        }
        else if (typeof condition === "function") {
            queryHelper_1.resolveQueryKey(this.bufferData, condition, callback);
        }
        this.queryStrutures = targetNode;
        return this.queryStrutures;
    }
    /**
     * get filter data after querying
     */
    getQueryCache() {
        return this.queryStrutures;
    }
}
DB.prototype.ExistedInstance = null;
exports.default = DB;
