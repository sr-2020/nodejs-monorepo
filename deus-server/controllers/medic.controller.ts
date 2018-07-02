import * as express from 'express';
import { Body, CurrentUser, JsonController, Param, Post, Res } from 'routing-controllers';
import { Container } from 'typedi';
import { Event, EventsProcessor } from '../events.processor';
import { Account, DatabasesContainerToken } from '../services/db-container';
import { canonicalId, checkAccess, currentTimestamp, returnCharacterNotFoundOrRethrow } from '../utils';

interface RunLabTestsRequest {
  patientId: string;
  tests: string[];
}

interface AddCommentRequest {
  patientId: string;
  text: string;
}

interface ScanQrRequest {
  data: any;
}

@JsonController()
export class MedicController {
  @Post('/medic/run_lab_tests/:id')
  public async runLabTests( @CurrentUser() user: Account, @Param('id') id: string, @Body() req: RunLabTestsRequest,
                            @Res() res: express.Response) {
    try {
      id = await canonicalId(id);
      await checkAccess(user, id);
      const dbContainer = Container.get(DatabasesContainerToken);
      const model = await dbContainer.modelsDb().get(req.patientId);

      let timestamp = currentTimestamp();

      const events: Event[] = req.tests.map((test: string) => {
        return {
          eventType: 'medic-run-lab-test',
          timestamp: timestamp++,
          data: {
            test,
            model,
          },
        };
      });
      events.push({
        eventType: '_RefreshModel',
        timestamp: timestamp++,
      });

      const s = await new EventsProcessor().process(id, events);
      res.status(s.status);
      return s.body;
    } catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }

  @Post('/medic/add_comment/:id')
  public async addComment( @CurrentUser() user: Account, @Param('id') id: string, @Body() req: AddCommentRequest,
                           @Res() res: express.Response) {
    try {
      id = await canonicalId(id);
      await checkAccess(user, id);

      const dbContainer = Container.get(DatabasesContainerToken);
      const model = await dbContainer.modelsDb().get(req.patientId);

      let timestamp = currentTimestamp();
      const events: Event[] = [{
        eventType: 'medic-add-comment',
        timestamp: timestamp++,
        data: {
          text: req.text,
          model,
        },
      }, {
        eventType: '_RefreshModel',
        timestamp: timestamp++,
      }];

      const s = await new EventsProcessor().process(id, events);
      res.status(s.status);
      return s.body;
    } catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }

  @Post('/medic/scan_qr/:id')
  public async scanQr( @CurrentUser() user: Account, @Param('id') id: string, @Body() req: ScanQrRequest,
                       @Res() res: express.Response) {
    try {
      id = await canonicalId(id);
      await checkAccess(user, id);

      let timestamp = currentTimestamp();
      const events: Event[] = [{
        eventType: 'scanQr',
        timestamp: timestamp++,
        data: req.data,
      }, {
        eventType: '_RefreshModel',
        timestamp: timestamp++,
      }];

      const s = await new EventsProcessor().process(id, events);
      res.status(s.status);
      return s.body;
    } catch (e) {
      returnCharacterNotFoundOrRethrow(e);
    }
  }
}
