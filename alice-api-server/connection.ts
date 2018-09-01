import * as PouchDB from 'pouchdb';

import { CharacterlessEvent, Event, ModelMetadata } from 'alice-model-engine-api';
import { EventEmitter } from 'events';

export interface StatusAndBody {
  status: number;
  body: any;
}

export interface ProcessRequest {
  events: CharacterlessEvent[];
  scheduledUpdateTimestamp?: number;
}

function race<T>(promises: Array<Promise<T>>): Promise<T> {
  return new Promise((res, rej) => {
    promises.forEach((p) => p.then((v) => res(v)).catch((err) => rej(err)));
  });
}

export class Connection {
  private viewModelUpdated = new EventEmitter();

  constructor(
    private eventsDb: PouchDB.Database<Event>,
    private metadataDb: PouchDB.Database<ModelMetadata>,
    private timeout: number) { }

  public async processEvents(id: string, request: ProcessRequest): Promise<StatusAndBody> {
    let latestSavedEventTimestamp = 0;
    const scheduledUpdateTimestamp = request.scheduledUpdateTimestamp;
    try {
      for (const event of request.events) {
        const eventsWithCharId: Event = { characterId: id, ...event };
        await this.eventsDb.post(eventsWithCharId);
        latestSavedEventTimestamp = event.timestamp;
      }
      if (scheduledUpdateTimestamp) {
        latestSavedEventTimestamp = scheduledUpdateTimestamp;
        await this.metadataDb.upsert(id, (doc) => {
          return {...doc, _id: id, scheduledUpdateTimestamp};
        });
      }
    } catch (e) {
      console.warn(e);
      // TODO: Should we actually return error if only part of events were saved to DB?
      return { status: 202, body: { id: id, serverTime: this.currentTimestamp(),
        timestamp: latestSavedEventTimestamp } };
    }

    // If scheduledUpdateTimestamp is not set, no model update will happens, so there is
    // no need to wait for it.
    if (scheduledUpdateTimestamp) {
      return race([
        this.refreshModelUpdatedResponse(id, latestSavedEventTimestamp),
        this.refreshModelTimeoutResponse(id, latestSavedEventTimestamp),
      ]);
    } else {
      return { status: 202, body: { id, timestamp: latestSavedEventTimestamp,
        serverTime: this.currentTimestamp() } };
    }
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
