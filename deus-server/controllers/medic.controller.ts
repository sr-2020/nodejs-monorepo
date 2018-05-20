import * as express from 'express';
import { JsonController, CurrentUser, Param, Post, Body, Res } from "routing-controllers";
import { canonicalId, currentTimestamp, returnCharacterNotFoundOrRethrow, checkAccess } from "../utils";
import { DatabasesContainerToken, Account } from "../services/db-container";
import { Container } from "typedi";
import { Event, EventsProcessor } from "../events.processor";

interface RunLabTestsRequest {
  patientId: string;
  tests: string[];
}

interface AddCommentRequest {
  patientId: string;
  text: string;
}

@JsonController()
export class MedicController {
  @Post("/medic/run_lab_tests/:id")
  async runLabTests( @CurrentUser() user: Account, @Param("id") id: string, @Body() req: RunLabTestsRequest,
    @Res() res: express.Response) {
    id = await canonicalId(id);
    await checkAccess(user, id);
    const dbContainer = Container.get(DatabasesContainerToken);
    const model = await dbContainer.modelsDb().get(req.patientId);

    let timestamp = currentTimestamp();

    let events: Event[] = req.tests.map((test: string) => {
      return {
        eventType: 'medic-run-lab-test',
        timestamp: timestamp++,
        data: {
          test,
          model,
        },
      }
    })
    events.push({
      eventType: '_RefreshModel',
      timestamp: timestamp++,
    });;

    const s = await new EventsProcessor().process(id, events);
    res.status(s.status);
    return s.body;
  }

  @Post("/medic/add_comment/:id")
  async addComment( @CurrentUser() user: Account, @Param("id") id: string, @Body() req: AddCommentRequest,
    @Res() res: express.Response) {
    id = await canonicalId(id);
    await checkAccess(user, id);

    const dbContainer = Container.get(DatabasesContainerToken);
    const model = await dbContainer.modelsDb().get(req.patientId);

    let timestamp = currentTimestamp();
    let events: Event[] = [{
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
  }
}