import { EventEmitter } from 'events';

export class StatusAndBody {
  public status: number;
  public body: any;
}

function race<T>(promises: Array<Promise<T>>): Promise<T> {
  return new Promise((res, rej) => {
    promises.forEach((p) => p.then((v) => res(v)).catch((err) => rej(err)));
  });
}

export class Connection {
  private viewModelUpdated = new EventEmitter();

  constructor(
    private eventsDb: PouchDB.Database<{}>,
    private timeout: number) { }

  public async processEvents(id: string, events: any[]): Promise<StatusAndBody> {
    let latestSavedEventTimestamp = 0;
    try {
      for (const event of events) {
        const eventsWithCharId = event;
        eventsWithCharId.characterId = id;
        await this.eventsDb.post(eventsWithCharId);
        latestSavedEventTimestamp = event.timestamp;
      }
    } catch (e) {
      console.warn(e);
      // TODO: Should we actually return error if only part of events were saved to DB?
      return { status: 202, body: { id: id, serverTime: this.currentTimestamp(),
        timestamp: latestSavedEventTimestamp } };
    }

    return race([this.refreshModelUpdatedResponse(id, latestSavedEventTimestamp),
    this.refreshModelTimeoutResponse(id, latestSavedEventTimestamp)]);
  }

  public onViewModelUpdate(viewModel: any) {
    delete viewModel._id;
    delete viewModel._rev;
    this.viewModelUpdated.emit('update', viewModel);
  }

  private currentTimestamp(): number {
    return new Date().valueOf();
  }

  private refreshModelUpdatedResponse(id: string, latestSavedEventTimestamp: number): Promise<StatusAndBody> {
    return new Promise((resolve, _reject) => {
      this.viewModelUpdated.addListener('update', (viewModel) => {
        if (viewModel.timestamp == latestSavedEventTimestamp)
          resolve({ status: 200, body: { viewModel: viewModel, id: id, serverTime: this.currentTimestamp() } });
      });
    });
  }

  private refreshModelTimeoutResponse(id: string, latestSavedEventTimestamp: number): Promise<StatusAndBody> {
    return new Promise((resolve, _reject) => {
      setTimeout(() => {
        resolve({ status: 202, body: { id: id, timestamp: latestSavedEventTimestamp,
          serverTime: this.currentTimestamp() } });
      }, this.timeout);
    });
  }
}
