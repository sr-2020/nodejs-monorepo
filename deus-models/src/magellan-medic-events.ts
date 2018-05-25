import { ModelApiInterface, Event } from "deus-engine-manager-api";
import { hasMedicViewModel } from "../helpers/view-model-helper";


interface RunLabTestData {
  test: string;
  model: any;
}

interface TestResult {
  type: string;
  message: string;
}

const tests = {
  sum: (model): TestResult => {
    const r = (model.systems as number[]).reduce((acc, val) => acc + val);
    return {type:'Cумма', message: `Сумма значений состояний систем равна ${r}`};
  },
  max: (model): TestResult=> {
    const r = (model.systems as number[]).reduce((acc, val) => Math.max(acc, val));
    return {type:'Максимум', message: `Максимум значений состояний систем равна ${r}`};
  },
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

  const testResult: TestResult = testFunction(data.model);

  const historyEntry = {
    timestamp: event.timestamp,
    patientId: data.model._id,
    patientFullName: data.model.firstName + ' ' + data.model.lastName,
    type: testResult.type,
    text: testResult.message,
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
    type: 'Комментарий',
  }

  api.model.patientHistory.push(historyEntry);
}

module.exports = () => {
  return {
    medicRunLabTest,
    medicAddComment,
  };
};

