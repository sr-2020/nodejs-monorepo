import { QrType } from "./qr.type";
export declare class QrData {
    type: QrType;
    kind: number;
    validUntil: number;
    payload: string;
}
export declare class FormatError implements Error {
    message: string;
    name: string;
    constructor(message: string);
}
export declare class ValidationError implements Error {
    message: string;
    name: string;
    constructor(message: string);
}
export declare function decode(content: string): QrData;
export declare function encode(data: QrData): string;
