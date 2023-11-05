export type DialogType = {
  isOpen: boolean;
  text: string;
  handler: (() => void) | null;
  noBtnText?: string;
  yesBtnText?: string;
};
