export interface FirmwareData {
    _id: string
    name: string
    effect: string
}

export function parseFirmware(data): FirmwareData {
    return {
        _id: data[0].toLowerCase(),
        name: data[1],
        effect: data[2]
    };
}
