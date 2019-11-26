export declare type condition = (key: string, value: any, obj: any) => boolean
export declare type callbackHandler = (key: string, value: any, obj: any) => void
export declare type queryStructure = {
    parent: any,
    key: string,
    val: any
}
export declare type resolvedQueryData = {
    obj: any,
    key: string,
    isKeyLost: boolean
}
export declare type readDbReturnedValue = {
    buf: any,
    rawBufString: string
}
export declare type mapFlag = {
    f: string,
    s: number,
    e: number
}