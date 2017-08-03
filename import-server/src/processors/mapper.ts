export interface MapperInterface {
    filter(doc: any): boolean
    map(doc: any): Promise<any>
}
