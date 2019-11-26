import { condition, queryStructure } from "../helper/type";
declare class DB {
    private needCreateDb;
    private preCreatedDbFilePath;
    private bufferData;
    private dbMap;
    /**
     * if undefined, means reading all bytes at once
     */
    private currentMapFlag;
    private queryStrutures;
    constructor();
    /**
     * limit single instance
     */
    private _init;
    /**
     * load or pre-create db file
     *
     * @param path required
     */
    private load;
    /**
     * read db to memory cache
     *
     * @param path required
     * @param filter top key also means namespace, if undefined or not suit, will read all bytes
     */
    read(path: string, filter?: string): Promise<DB>;
    /**
     * write buffer to db file
     */
    write(): Promise<void>;
    /**
     * judge whether has key
     *
     * @param keyChain
     */
    has(keyChain: string): boolean;
    /**
     * get all buffer data deep clone, the data is readonly.
     */
    getAll(): any;
    /**
     * get target value deep clone, the data is readonly.
     *
     * @param keyChain
     */
    get(keyChain: string): any;
    /**
     * update target value
     *
     * @param keyChain
     * @param value
     * @param insert
     */
    update(keyChain: string, value: any, { insert }?: {
        insert: boolean;
    }): DB;
    /**
     * insert a new data
     *
     * @param keyChain
     * @param value
     */
    insert(keyChain: string, value: any): DB;
    /**
     * delete a data
     *
     * @param keyChain
     */
    delete(keyChain: string): DB;
    /**
     * query data by condition callback
     *
     * @param condition
     */
    query(condition: condition): queryStructure[];
    /**
     * get filter data after querying
     */
    getQueryCache(): queryStructure[];
}
export default DB;
