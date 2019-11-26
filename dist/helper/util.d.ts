/**
 * print colorful info to stdout
 */
export declare const print: {
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
};
/**
 * get the relative temporary path of db file
 *
 * @param path
 */
export declare const getTempDbPath: (path: string) => string;
/**
 * get the relative map path of db file
 *
 * @param path
 */
export declare const getDbMapPath: (path: string) => string;
/**
 * write all chunks to file path at once
 *
 * @param path
 * @param buf
 */
export declare const writeAllChunkOnce: (path: string, buf: string) => Promise<any>;
/**
 * append chunks to file path by steps
 *
 * @param path
 * @param buf
 */
export declare const writeChunkByStep: (path: string, buf: string) => Promise<any>;
/**
 * rename the temporary path to standard path
 *
 * @param path
 */
export declare const replaceDbPath: (oldPath: string, newPath: string) => Promise<any>;
