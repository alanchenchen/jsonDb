"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const constant_1 = require("./constant");
/**
 * print colorful info to stdout
 */
exports.print = {
    info(msg) {
        console.log(`\u001b[1;34m[info]\u001b[0m ${msg}`);
    },
    warn(msg) {
        console.log(`\u001b[1;33m[warn]\u001b[0m ${msg}`);
    },
    error(msg) {
        console.log(`\u001b[1;31m[error]\u001b[0m ${msg}`);
    }
};
/**
 * get the relative temporary path of db file
 *
 * @param path
 */
exports.getTempDbPath = (path) => {
    const baseName = path_1.basename(path, constant_1.DB_PATH_EXT);
    const dbMapPath = path_1.resolve(path, `../${baseName}${constant_1.DB_TEMP_PATH}${constant_1.DB_PATH_EXT}`);
    return dbMapPath;
};
/**
 * get the relative map path of db file
 *
 * @param path
 */
exports.getDbMapPath = (path) => {
    const baseName = path_1.basename(path, constant_1.DB_PATH_EXT);
    const dbMapPath = path_1.resolve(path, `../${baseName}${constant_1.DB_MAP_PATH_EXT}`);
    return dbMapPath;
};
/**
 * write all chunks to file path at once
 *
 * @param path
 * @param buf
 */
exports.writeAllChunkOnce = (path, buf) => {
    return new Promise((done, reject) => {
        fs_1.writeFile(path, buf, (err) => {
            if (err) {
                reject(err);
            }
            done();
        });
    });
};
/**
 * append chunks to file path by steps
 *
 * @param path
 * @param buf
 */
exports.writeChunkByStep = (path, buf) => {
    return new Promise((done, reject) => {
        fs_1.appendFile(path, buf, (err) => {
            if (err) {
                reject(err);
            }
            done();
        });
    });
};
/**
 * rename the temporary path to standard path
 *
 * @param path
 */
exports.replaceDbPath = (oldPath, newPath) => {
    return new Promise((done, reject) => {
        fs_1.rename(oldPath, newPath, (err) => {
            if (err) {
                reject(err);
            }
            done();
        });
    });
};
