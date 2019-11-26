import { mapFlag } from "./type";
/**
 * judge whether dbMap is existed
 *
 * @param path
 */
export declare const isDbMapExist: (path: string) => boolean;
/**
 * generate dbMap
 *
 * @param path
 * @param buf
 * @param targetMapFlag if undefined, create a new map, otherwise update existed map.
 * @param dbMap
 */
export declare const createDbMap: (path: string, buf: string, targetMapFlag: mapFlag, dbMap: mapFlag[]) => Promise<void>;
/**
 * read db map
 *
 * @param path
 */
export declare const readDbMap: (path: string) => mapFlag[];
