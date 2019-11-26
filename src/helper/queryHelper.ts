import { condition, callbackHandler, resolvedQueryData } from "./type";

/**
 * resolve condition to handle data recursivly
 * 
 * @param obj 
 * @param condition 
 * @param cb 
 */
export const resolveQueryKey = (obj: any, condition: condition, cb: callbackHandler) => {
    for (const key of Object.keys(obj)) {
        if (condition(key, obj[key], obj)) {
            cb(key, obj[key], obj);
        }
        if (Object.prototype.toString.call(obj[key]) === "[object Object]") {
            resolveQueryKey(obj[key], condition, cb);
        }
    }
}

/**
 * obtain the light clone (memory point clone) of target object and last key, support empty object initialization
 * 
 * @param obj 
 * @param keyChain
 * @param needCreateLostKey
 * @returns 
 */
export const resolveQueryChainKey = (obj: any, keyChain: any, needCreateLostKey = false): resolvedQueryData => {
    const keysList = keyChain.split(".");
    let formerKeys = [];
    let lastKey = "";
    let isKeyLost = false;
    if (keysList.length >= 1) {
        formerKeys = keysList.slice(0, keysList.length - 1);
        lastKey = keysList[keysList.length - 1];
    }
    
    if (obj[keysList[0]] === undefined) {
        isKeyLost = true;
    }
    const targetVal = formerKeys.reduce((total: any, item: any) => {
        if (total[item] === undefined) {
            isKeyLost = true;
            if (needCreateLostKey) {
                total[item] = {};
            }
        }
        return total.hasOwnProperty(item) ? total[item] : total;
    }, obj);
    return { 
        obj: targetVal,
        key: lastKey,
        isKeyLost
    };
}