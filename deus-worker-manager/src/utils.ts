export function stdCallback(resolve: Function, reject: Function) {
    return (err: any, data: any) => {
        if (err) {
            reject(err);
        } else {
            resolve(data);
        }
    }
}
