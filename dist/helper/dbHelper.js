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
const path_1 = require("path");
const fs_1 = require("fs");
const constant_1 = require("./constant");
const util_1 = require("./util");
/**
 * judge whether db path is valid
 *
 * @param path
 */
exports.isDbExist = (path) => {
    const isDbJson = path_1.extname(path).toLocaleLowerCase() === constant_1.DB_PATH_EXT;
    try {
        if (isDbJson) {
            fs_1.accessSync(path, fs_1.constants.F_OK | fs_1.constants.R_OK | fs_1.constants.W_OK);
            return true;
        }
        else {
            util_1.print.error(`db expect ${constant_1.DB_PATH_EXT} file`);
            process.exit();
        }
    }
    catch (error) {
        if (error.code) {
            return error.code;
        }
        util_1.print.error(error);
    }
};
/**
 * write buffer to db file
 *
 * @param path
 * @param buf
 * @param targetMapFlag if undefined, write all byte
 * @param dbMap
 */
exports.createDbFile = (path, buf, targetMapFlag, dbMap) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (targetMapFlag === undefined) {
            yield util_1.writeAllChunkOnce(path, buf);
        }
        else {
            /**
             * in order to write chunk steps by steps, it should create a temporary file.
             */
            const tempPath = util_1.getTempDbPath(path);
            for (let i = 0; i < dbMap.length; i++) {
                let writeBufString;
                if (targetMapFlag.s === dbMap[i].s) {
                    writeBufString = buf.substring(1, buf.length - 1);
                }
                else {
                    const { rawBufString } = yield exports.readDb(path, dbMap[i], false);
                    writeBufString = rawBufString;
                }
                if (i === 0) {
                    writeBufString = `{${writeBufString},`;
                }
                else if (i === dbMap.length - 1) {
                    writeBufString = `${writeBufString}}`;
                }
                else {
                    writeBufString = `${writeBufString},`;
                }
                yield util_1.writeChunkByStep(tempPath, writeBufString);
            }
            yield util_1.replaceDbPath(tempPath, path);
        }
        util_1.print.info("db has been written");
    }
    catch (error) {
        util_1.print.error(error);
    }
});
/**
 * read specific structure from db by filtering db map, not the entire db, just a few bytes, avoid js stack booming!
 *
 * @param path
 * @param targetMapFlag if undefined, read all byte
 * @param log whether show read info log, default true
 */
exports.readDb = (path, targetMapFlag, log = true) => {
    return new Promise((done, reject) => {
        const startT = new Date().valueOf();
        const startNo = targetMapFlag === undefined ? 0 : targetMapFlag.s;
        const endNo = targetMapFlag === undefined ? Infinity : targetMapFlag.e;
        const readStrem = fs_1.createReadStream(path, { start: startNo, end: endNo });
        readStrem.setEncoding('utf8');
        let buf = null;
        let rawBufString = "";
        readStrem.on("data", (chunk) => {
            rawBufString += chunk;
        });
        readStrem.on("end", () => {
            buf = targetMapFlag === undefined
                ? JSON.parse(rawBufString)
                : JSON.parse(`{${rawBufString}}`);
            const endT = new Date().valueOf();
            if (log) {
                util_1.print.info(`read db byte: ${readStrem.bytesRead} b`);
                util_1.print.info(`read db time: ${(endT - startT) / 1000} s`);
                util_1.print.info(`current db namespace: ${targetMapFlag && targetMapFlag.f || 'global'} `);
            }
            done({
                buf,
                rawBufString
            });
        });
        readStrem.on("error", (error) => {
            reject(error);
        });
    });
};
