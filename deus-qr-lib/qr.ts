import * as md5 from 'md5'

export class QrData {
  // TODO: switch to enums
  public type: number;
  public kind: number;
  public validUntil: number;
  public payload: string;
}

export class FormatError implements Error {
  public name: string = 'FormatError';
  constructor(public message: string) { };
}

export class ValidationError implements Error {
  public name: string = 'ValidationError';
  constructor(public message: string) { };
}

function uint16LESignature(data: string): number {
  //TODO: get salt from config
  const salt = 'do you like ponies?';
  const md5buffer = Buffer.from(md5(data + salt), 'hex');
  return md5buffer.readUInt16LE(0);
}

export function decode(content: string): QrData {
  if (content.length < 12)
    throw new FormatError('Format Error: QR code content should contain 12 character header');

  try {
    const signatureBuffer = Buffer.from(content.slice(0, 4), 'hex');
    const contentBuffer = Buffer.from(content.slice(4, 12), 'base64');
    const type = contentBuffer.readUInt8(0);
    const kind = contentBuffer.readUInt8(1);
    const validUntil = contentBuffer.readUInt32LE(2);
    const signature = signatureBuffer.readUInt16LE(0);
    const expectedSignature = uint16LESignature(contentBuffer + content.slice(12));
    if (signature != expectedSignature)
      throw new ValidationError('Validation Error: Invalid signature');
    return { type: type, kind: kind, validUntil: validUntil, payload: content.slice(12) };
  }
  catch (e) {
    if(e instanceof RangeError){
      throw new FormatError('Format Error: Cannot process content: index out of range');
    }
    throw e; 
  }
}

export function encode(data: QrData): string {
  let contentBuffer = Buffer.alloc(6);
  contentBuffer.writeUInt8(data.type, 0);
  contentBuffer.writeUInt8(data.kind, 1);
  contentBuffer.writeUInt32LE(data.validUntil, 2);
  let signatureBuffer = Buffer.alloc(2);
  signatureBuffer.writeUInt16LE(uint16LESignature(contentBuffer + data.payload), 0);
  return signatureBuffer.toString('hex') + contentBuffer.toString('base64') + data.payload;
}

