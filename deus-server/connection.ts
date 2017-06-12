export class StatusAndBody {
  public status: number;
  public body: any;
}

function race<T>(promises: Array<Promise<T>>): Promise<T> {
  return new Promise((res, rej) => {
    promises.forEach(p => p.then(v => res(v)).catch(err => rej(err)));
  });
}

export class Connection {
  private latestSavedEventTimestamp = 0;

  constructor(
    private eventsDb: PouchDB.Database<{}>,
    private viewmodelDb: PouchDB.Database<{ timestamp: number }>,
    private timeout: number,
    private latestExisingTimestamp: number) { }

  async processEvents(id: string, events: any[]): Promise<StatusAndBody> {
    try {
      await this.viewmodelDb.get(id);
    } catch (e) {
      if (e.status && e.status == 404 && e.reason && e.reason == "missing")
        return {status: 404, body: "Character with such id is not found"};
      else
        throw e;
    }

    events = events.filter((value: any) => value.timestamp > this.latestExisingTimestamp);

    try {
      for (const event of events) {
        let eventsWithCharId = event;
        eventsWithCharId.characterId = id;
        await this.eventsDb.post(eventsWithCharId);
        this.latestSavedEventTimestamp = event.timestamp;
      }
    } catch (e) {
      console.warn(e);
      // TODO: Should we actually return error if only part of events were saved to DB?
      return { status: 202, body: { id: id, serverTime: this.currentTimestamp(), timestamp: this.latestSavedEventTimestamp } };
    }

    return race([this.refreshModelUpdatedResponse(id, this.latestSavedEventTimestamp),
                 this.refreshModelTimeoutResponse(id)]);
  }

  private currentTimestamp(): number {
    return new Date().valueOf();
  }

  refreshModelUpdatedResponse(id: string, lastEventTimestamp: number): Promise<StatusAndBody> {
    return new Promise((resolve, reject) => {
      this.viewmodelDb.changes({ since: 'now', live: true, include_docs: true, doc_ids: [id] }).on('change', change => {
        if (change.doc && change.doc.timestamp == lastEventTimestamp) {
          delete change.doc._id;
          delete change.doc._rev;
          resolve({ status: 200, body: { viewModel: change.doc, id: id, serverTime: this.currentTimestamp() } });
        }
      });
    });
  }

  refreshModelTimeoutResponse(id: string): Promise<StatusAndBody> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ status: 202, body: { id: id, timestamp: this.latestSavedEventTimestamp, serverTime: this.currentTimestamp() } });
      }, this.timeout);
    });
  }  
}
