declare module 'nano' {
    import { EventEmitter } from 'events';

    function nano(connectionUrl: string): nano.Nano;
    export = nano;

    namespace nano {
        type NodeCallback = (error: any, result: any) => void;

        export interface Follow extends EventEmitter {
            follow(): void
            filter?(doc: any, req: any): boolean
        }

        export type Change<T> = {
            id: string,
            seq: string,
            changes: any[],
            doc?: T
        }

        export interface Nano {
            db: NanoDatabase,
            use(databaseName: string): NanoDocument;
        }

        export interface NanoDatabase {
            create(databaseName: string, callback: NodeCallback): void;

            get(databaseName: string, callback: NodeCallback): void;

            destroy(databaseName: string, callback?: NodeCallback): void;

            list(callback: NodeCallback): void;

            compact(databaseName: string, designDocName?: string, callback?: NodeCallback): void;

            replicate(sourceDatabaseName: string, targetDatabaseUrl: string, params?: Object, callback?: NodeCallback): void;

            changes(databaseName: string, params: Object, callback: NodeCallback): void;

            follow(databaseName: string | object, params?: Object, callback?: NodeCallback): Follow;

            info(callback: NodeCallback): void;

            scope(databaseName: string): NanoDocument;
        }

        interface NanoDocument {
            insert(doc: Object, params: string | Object, callback: NodeCallback): void;

            destroy(id: string, rev: string, callback: NodeCallback): void;

            get(id: string, params: Object, callback: NodeCallback): void;

            head(id: string, callback: (error: any, meta: any, headers: any) => void): void;

            copy(sourceDocId: string, destinationDocId: string, params: Object, callback: (error: any, meta: any, headers: any) => void): void;

            bulk(documents: Object[], params: Object, callback: NodeCallback): void;

            list(params: Object, callback: NodeCallback): void;

            fetch(documentIds: string[], params: Object, callback: NodeCallback): void;

            fetchRevs(documentIds: string[], params: Object, callback: NodeCallback): void;

            multipart: NanoMultipart;

            attachment: NanoAttachment;

            /** VIEWS */

            view(designDocumentId: string, viewName: string, params: Object, callback: NodeCallback): void;

            viewWithList(designDocumentId: string, viewName: string, params: Object, callback: NodeCallback): void;

            show(designDocumentId: string, showDocumentName: string, documentId: string, params: Object, callback: NodeCallback): void;

            atomic(designDocumentId: string, updateName: string, documentId: string, updateBody: Object, callback: NodeCallback): void;

            search(designDocumentId: string, searchName: string, params: Object, callback: NodeCallback): void;
        }

        interface NanoMultipart {
            insert(document: Object, attachments: Object[], params: Object, callback: NodeCallback): void;

            get(documentId: string, params: Object, callback: NodeCallback): void;
        }

        interface NanoAttachment {
            insert(documentId: string, attachmentName: string, attachmentData: any, contentType: string, params: Object, callback: NodeCallback): void;

            get(documentId: string, attachmentName: string, params: Object, callback: NodeCallback): void;
        }
    }
}

