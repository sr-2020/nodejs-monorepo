type EthicScale = 'violence' | 'control' | 'individualism' | 'mind';
type EthicTriggerKind = 'action' | 'crysis' | 'principle';

interface EthicStateShift {
  scale: EthicScale;
  change: number;
  conditionMin: number;
  conditionMax: number;
}

interface EthicTrigger {
  kind: EthicTriggerKind;
  description: string;
  shifts: EthicStateShift[];
  crysises: number[]; // Indices in the kAllCrysises array
}
