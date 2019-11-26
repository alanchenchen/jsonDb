import { extname } from "path";
import { accessSync, constants, createReadStream } from "fs";
import { DB_PATH_EXT } from "./constant";
import { mapFlag, readDbReturnedValue } from "./type";
import {
    print,
    getTempDbPath,
    writeAllChunkOnce,
    writeChunkByStep,
    replaceDbPath
} from "./util";

/**
 * judge whether db path is valid
 * 
 * @param path
 */
export const isDbExist = (path: string): (boolean | string) => {
    const isDbJson: boolean = extname(path).toLocaleLowerCase() === DB_PATH_EXT;
    try {
        if (isDbJson) {
            accessSync(path, constants.F_OK | constants.R_OK | constants.W_OK);
            return true;
        } else {
            print.error(`db expect ${DB_PATH_EXT} file`);
            process.exit();
        }
    } catch (error) {
        if (error.code) {
            return error.code;
        }
        print.error(error);
    }
}

/**
 * write buffer to db file
 * 
 * @param path
 * @param buf
 * @param targetMapFlag if undefined, write all byte
 * @param dbMap
 */
export const createDbFile = async (
    path: string,
    buf: string,
    targetMapFlag: mapFlag,
    dbMap: mapFlag[]
) => {
    try {
        if (targetMapFlag === undefined) {
            await writeAllChunkOnce(path, buf);
        } else {
            /**
             * in order to write chunk steps by steps, it should create a temporary file.
             */
            const tempPath = getTempDbPath(path);
            for (let i = 0; i < dbMap.length; i++) {
                let writeBufString: string;
                if (targetMapFlag.s === dbMap[i].s) {
                    writeBufString = buf.substring(1, buf.length - 1);
                } else {
                    const { rawBufString } = await readDb(path, dbMap[i], false);
                    writeBufString = rawBufString;
                }
                if (i === 0) {
                    writeBufString = `{${writeBufString},`;
                } else if (i === dbMap.length - 1) {
                    writeBufString = `${writeBufString}}`;
                } else {
                    writeBufString = `${writeBufString},`;
                }
                await writeChunkByStep(tempPath, writeBufString);
            }
            await replaceDbPath(tempPath, path);
        }
        print.info("db has been written");
    } catch (error) {
        print.error(error);
    }
}

/**
 * read specific structure from db by filtering db map, not the entire db, just a few bytes, avoid js stack booming!
 * 
 * @param path
 * @param targetMapFlag if undefined, read all byte
 * @param log whether show read info log, default true
 */
export const readDb = (
    path: string,
    targetMapFlag: mapFlag,
    log: boolean = true
): Promise<readDbReturnedValue> => {
    return new Promise((done: any, reject: any) => {
        const startT = new Date().valueOf();
        const startNo = targetMapFlag === undefined ? 0 : targetMapFlag.s;
        const endNo = targetMapFlag === undefined ? Infinity : targetMapFlag.e;
        const readStrem = createReadStream(path, { start: startNo, end: endNo });
        readStrem.setEncoding('utf8');
        let buf = null;
        let rawBufString = "";
        readStrem.on("data", (chunk: any) => {
            rawBufString += chunk;
        });
        readStrem.on("end", () => {
            buf = targetMapFlag === undefined
                ? JSON.parse(rawBufString)
                : JSON.parse(`{${rawBufString}}`);

            const endT = new Date().valueOf();
            if (log) {
                print.info(`read db byte: ${readStrem.bytesRead} b`);
                print.info(`read db time: ${(endT - startT) / 1000} s`);
                print.info(`current db namespace: ${targetMapFlag && targetMapFlag.f || 'global'} `);
            }
            done({
                buf,
                rawBufString
            });
        });
        readStrem.on("error", (error: Error) => {
            reject(error);
        });
    });
}