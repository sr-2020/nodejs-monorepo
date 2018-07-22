export interface HistoryEntry {
  timestamp: number;

  patientId: string;
  patientFullName: string;

  type: string;
  text: string;
}

export interface LabTest {
  displayableName: string;
  name: string;
}

export interface ViewModel {
  profileType: string;

  patientHistory: HistoryEntry[];

  numTests: number;
  availableTests: LabTest[];
}
