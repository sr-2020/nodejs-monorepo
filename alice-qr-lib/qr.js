"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var md5 = require("md5");
var QrData = (function () {
    function QrData() {
    }
    return QrData;
}());
exports.QrData = QrData;
var FormatError = (function () {
    function FormatError(message) {
        this.message = message;
        this.name = 'FormatError';
    }
    ;
    return FormatError;
}());
exports.FormatError = FormatError;
var ValidationError = (function () {
    function ValidationError(message) {
        this.message = message;
        this.name = 'ValidationError';
    }
    ;
    return ValidationError;
}());
exports.ValidationError = ValidationError;
function uint16LESignature(data) {
    //TODO: get salt from config
    var salt = 'do you like ponies?';
    var md5buffer = Buffer.from(md5(data + salt), 'hex');
    return md5buffer.readUInt16LE(0);
}
function decode(content) {
    if (content.length < 12)
        throw new FormatError('Format Error: QR code content should contain 12 character header');
    try {
        var signatureBuffer = Buffer.from(content.slice(0, 4), 'hex');
        var contentBuffer = Buffer.from(content.slice(4, 12), 'base64');
        var type = contentBuffer.readUInt8(0);
        var kind = contentBuffer.readUInt8(1);
        var validUntil = contentBuffer.readUInt32LE(2);
        var signature = signatureBuffer.readUInt16LE(0);
        var expectedSignature = uint16LESignature(contentBuffer + content.slice(12));
        if (signature != expectedSignature)
            throw new ValidationError('Validation Error: Invalid signature');
        return { type: type, kind: kind, validUntil: validUntil, payload: content.slice(12) };
    }
    catch (e) {
        if (e instanceof RangeError) {
            throw new FormatError('Format Error: Cannot process content: index out of range');
        }
        throw e;
    }
}
exports.decode = decode;
function encode(data) {
    var contentBuffer = Buffer.alloc(6);
    contentBuffer.writeUInt8(data.type, 0);
    contentBuffer.writeUInt8(data.kind, 1);
    contentBuffer.writeUInt32LE(data.validUntil, 2);
    var signatureBuffer = Buffer.alloc(2);
    signatureBuffer.writeUInt16LE(uint16LESignature(contentBuffer + data.payload), 0);
    return signatureBuffer.toString('hex') + contentBuffer.toString('base64') + data.payload;
}
exports.encode = encode;
