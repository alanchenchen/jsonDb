import { basename, resolve } from "path";
import { writeFile, appendFile, rename } from "fs";
import { DB_PATH_EXT, DB_TEMP_PATH, DB_MAP_PATH_EXT } from "./constant";

/**
 * print colorful info to stdout
 */
export const print = {
    info(msg: string) {
        console.log(`\u001b[1;34m[info]\u001b[0m ${msg}`);
    },
    warn(msg: string) {
        console.log(`\u001b[1;33m[warn]\u001b[0m ${msg}`);
    },
    error(msg: string) {
        console.log(`\u001b[1;31m[error]\u001b[0m ${msg}`);
    }
}

/**
 * get the relative temporary path of db file
 * 
 * @param path
 */
export const getTempDbPath = (path: string): string => {
    const baseName: string = basename(path, DB_PATH_EXT);
    const dbMapPath: string = resolve(path, `../${baseName}${DB_TEMP_PATH}${DB_PATH_EXT}`);
    return dbMapPath;
}

/**
 * get the relative map path of db file
 * 
 * @param path
 */
export const getDbMapPath = (path: string): string => {
    const baseName: string = basename(path, DB_PATH_EXT);
    const dbMapPath: string = resolve(path, `../${baseName}${DB_MAP_PATH_EXT}`);
    return dbMapPath;
}

/**
 * write all chunks to file path at once
 * 
 * @param path
 * @param buf
 */
export const writeAllChunkOnce = (path: string, buf: string): Promise<any> => {
    return new Promise((done: any, reject: any) => {
        writeFile(path, buf, (err: Error) => {
            if (err) {
                reject(err);
            }
            done();
        });
    });
}

/**
 * append chunks to file path by steps
 * 
 * @param path
 * @param buf
 */
export const writeChunkByStep = (path: string, buf: string): Promise<any> => {
    return new Promise((done: any, reject: any) => {
        appendFile(path, buf, (err: Error) => {
            if (err) {
                reject(err);
            }
            done();
        });
    });
}

/**
 * rename the temporary path to standard path
 * 
 * @param path
 */
export const replaceDbPath = (oldPath: string, newPath: string): Promise<any> => {
    return new Promise((done: any, reject: any) => {
        rename(oldPath, newPath, (err: Error) => {
            if (err) {
                reject(err);
            }
            done();
        });
    });
}