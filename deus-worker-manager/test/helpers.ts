export function delay(t: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), t);
    });
}
