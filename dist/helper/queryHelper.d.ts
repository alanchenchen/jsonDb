import { condition, callbackHandler, resolvedQueryData } from "./type";
/**
 * resolve condition to handle data recursivly
 *
 * @param obj
 * @param condition
 * @param cb
 */
export declare const resolveQueryKey: (obj: any, condition: condition, cb: callbackHandler) => void;
/**
 * obtain the light clone (memory point clone) of target object and last key, support empty object initialization
 *
 * @param obj
 * @param keyChain
 * @param needCreateLostKey
 * @returns
 */
export declare const resolveQueryChainKey: (obj: any, keyChain: any, needCreateLostKey?: boolean) => resolvedQueryData;
