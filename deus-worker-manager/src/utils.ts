type AnyFunc = (...args: any[]) => void;

export function stdCallback(resolve: AnyFunc, reject: AnyFunc) {
    return (err: any, data: any) => {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    };
}
