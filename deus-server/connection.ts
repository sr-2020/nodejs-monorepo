import { EventEmitter } from "events";

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
  private viewModelUpdated = new EventEmitter();

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

  public onViewModelUpdate(viewModel: any) {
    delete viewModel._id;
    delete viewModel._rev;
    this.viewModelUpdated.emit('update', viewModel);
  }

  refreshModelUpdatedResponse(id: string, lastEventTimestamp: number): Promise<StatusAndBody> {
    return new Promise((resolve, reject) => {
      this.viewModelUpdated.addListener('update', viewModel => {
        if (viewModel.timestamp == lastEventTimestamp)
          resolve({ status: 200, body: { viewModel: viewModel, id: id, serverTime: this.currentTimestamp() } });
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
