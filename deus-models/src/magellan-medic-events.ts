import { ModelApiInterface, Event } from "deus-engine-manager-api";
import { hasMedicViewModel } from "../helpers/view-model-helper";


interface RunLabTestData {
  test: string;
  model: any;
}

const tests = {
  sum: (model) => {},
  max: (model) => {},
}


function medicRunLabTest(api: ModelApiInterface, data: RunLabTestData, event: Event) {
  if (!hasMedicViewModel(api.model)) {
    api.error("medic-run-lab-test event sent to non-medic account");
    return;
  }

  const testFunction = tests[data.test];
  if (testFunction == undefined) {
    api.error(`medic-run-lab-test: unknown test "${data.test}"`);
    return;
  }

  const historyEntry = {
    timestamp: event.timestamp,
    patientId: data.model._id,
    patientFullName: data.model.firstName + ' ' + data.model.lastName,
    text: testFunction(data.model),
  }

  api.model.patientHistory.push(historyEntry);
}


interface AddCommentData {
  text: string;
  model: any;
}

function medicAddComment(api: ModelApiInterface, data: AddCommentData, event: Event) {
  if (!hasMedicViewModel(api.model)) {
    api.error("medic-add-comment event sent to non-medic account");
    return;
  }

  const historyEntry = {
    timestamp: event.timestamp,
    patientId: data.model._id,
    patientFullName: data.model.firstName + ' ' + data.model.lastName,
    text: data.text,
  }

  api.model.patientHistory.push(historyEntry);
}

