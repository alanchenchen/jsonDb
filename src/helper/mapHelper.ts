import { accessSync, constants, readFileSync } from "fs";
import { mapFlag } from "./type";
import { print, getDbMapPath, writeAllChunkOnce } from "./util";

/**
 * judge whether dbMap is existed
 * 
 * @param path
 */
export const isDbMapExist = (path: string): boolean => {
    const dbMapPath: string = getDbMapPath(path);
    try {
        accessSync(dbMapPath, constants.F_OK | constants.R_OK | constants.W_OK);
        return true;
    } catch (error) {
        if (error) {
            return false;
        }
    }
}

/**
 * generate dbMap
 * 
 * @param path
 * @param buf
 * @param targetMapFlag if undefined, create a new map, otherwise update existed map.
 * @param dbMap
 */
export const createDbMap = async (
    path: string,
    buf: string,
    targetMapFlag: mapFlag,
    dbMap: mapFlag[]
) => {
    try {
        const dbMapPath = getDbMapPath(path);
        let map: mapFlag[] = [];
        const shouldCreate = !isDbMapExist(path) || isDbMapExist(path) && targetMapFlag === undefined;
        const shoudlUpdate = isDbMapExist(path) && targetMapFlag !== undefined;
        // create a map file
        if (shouldCreate) {
            const objData: any = JSON.parse(buf);
            for (const key of Object.keys(objData)) {
                const startNo: number = buf.indexOf(`"${key}":`);
                const endNo: number = startNo + 2 + key.length + JSON.stringify(objData[key]).length;
                map.push({
                    f: key,
                    s: startNo,
                    e: endNo
                });
            }
        } else if (shoudlUpdate) {
            // update existed map file
            map = JSON.parse(JSON.stringify(dbMap));
            const writeBufStringLen = buf.length - 2;
            const byteOffset = writeBufStringLen - (targetMapFlag.e - targetMapFlag.s + 1);
                            
            map.forEach((item: mapFlag) => {
                if (item.s === targetMapFlag.s) {
                    item.e = targetMapFlag.e + byteOffset;
                } else if (item.s > targetMapFlag.s) {
                    item.s += byteOffset;
                    item.e += byteOffset;
                }
            });
        }
        
        await writeAllChunkOnce(dbMapPath, JSON.stringify(map));
        print.info("db map has been generated");
    } catch (error) {
        print.error(error);
    }
}

/**
 * read db map
 * 
 * @param path
 */
export const readDbMap = (path: string): mapFlag[] => {
    const dbMapPath = getDbMapPath(path);
    try {
        const buf = readFileSync(dbMapPath, "utf8");
        return JSON.parse(buf);
    } catch (error) {
        print.error(error);
    }
}