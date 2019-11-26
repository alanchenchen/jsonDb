import { mapFlag, readDbReturnedValue } from "./type";
/**
 * judge whether db path is valid
 *
 * @param path
 */
export declare const isDbExist: (path: string) => string | boolean;
/**
 * write buffer to db file
 *
 * @param path
 * @param buf
 * @param targetMapFlag if undefined, write all byte
 * @param dbMap
 */
export declare const createDbFile: (path: string, buf: string, targetMapFlag: mapFlag, dbMap: mapFlag[]) => Promise<void>;
/**
 * read specific structure from db by filtering db map, not the entire db, just a few bytes, avoid js stack booming!
 *
 * @param path
 * @param targetMapFlag if undefined, read all byte
 * @param log whether show read info log, default true
 */
export declare const readDb: (path: string, targetMapFlag: mapFlag, log?: boolean) => Promise<readDbReturnedValue>;
