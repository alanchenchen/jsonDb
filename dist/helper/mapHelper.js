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
const fs_1 = require("fs");
const util_1 = require("./util");
/**
 * judge whether dbMap is existed
 *
 * @param path
 */
exports.isDbMapExist = (path) => {
    const dbMapPath = util_1.getDbMapPath(path);
    try {
        fs_1.accessSync(dbMapPath, fs_1.constants.F_OK | fs_1.constants.R_OK | fs_1.constants.W_OK);
        return true;
    }
    catch (error) {
        if (error) {
            return false;
        }
    }
};
/**
 * generate dbMap
 *
 * @param path
 * @param buf
 * @param targetMapFlag if undefined, create a new map, otherwise update existed map.
 * @param dbMap
 */
exports.createDbMap = (path, buf, targetMapFlag, dbMap) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbMapPath = util_1.getDbMapPath(path);
        let map = [];
        const shouldCreate = !exports.isDbMapExist(path) || exports.isDbMapExist(path) && targetMapFlag === undefined;
        const shoudlUpdate = exports.isDbMapExist(path) && targetMapFlag !== undefined;
        // create a map file
        if (shouldCreate) {
            const objData = JSON.parse(buf);
            for (const key of Object.keys(objData)) {
                const startNo = buf.indexOf(`"${key}":`);
                const endNo = startNo + 2 + key.length + JSON.stringify(objData[key]).length;
                map.push({
                    f: key,
                    s: startNo,
                    e: endNo
                });
            }
        }
        else if (shoudlUpdate) {
            // update existed map file
            map = JSON.parse(JSON.stringify(dbMap));
            const writeBufStringLen = buf.length - 2;
            const byteOffset = writeBufStringLen - (targetMapFlag.e - targetMapFlag.s + 1);
            map.forEach((item) => {
                if (item.s === targetMapFlag.s) {
                    item.e = targetMapFlag.e + byteOffset;
                }
                else if (item.s > targetMapFlag.s) {
                    item.s += byteOffset;
                    item.e += byteOffset;
                }
            });
        }
        yield util_1.writeAllChunkOnce(dbMapPath, JSON.stringify(map));
        util_1.print.info("db map has been generated");
    }
    catch (error) {
        util_1.print.error(error);
    }
});
/**
 * read db map
 *
 * @param path
 */
exports.readDbMap = (path) => {
    const dbMapPath = util_1.getDbMapPath(path);
    try {
        const buf = fs_1.readFileSync(dbMapPath, "utf8");
        return JSON.parse(buf);
    }
    catch (error) {
        util_1.print.error(error);
    }
};
