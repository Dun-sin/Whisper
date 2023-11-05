import { createContext, useContext, useState } from 'react';
import { DialogType } from '@/types/contextTypes';

import { ProviderType } from '@/types/propstypes';

const initialState: DialogType = {
  isOpen: false,
  text: '',
  handler: () => {},
  noBtnText: '',
  yesBtnText: '',
};

const DialogContext = createContext<{
  dialog: DialogType;
  setDialog: React.Dispatch<React.SetStateAction<DialogType>>;
}>({
  dialog: initialState,
  setDialog: () => undefined,
});

export const useDialog = () => useContext(DialogContext);

export function DialogProvider({ children, ...props }: ProviderType) {
  const [dialog, setDialog] = useState(initialState);

  return (
    <DialogContext.Provider value={{ dialog, setDialog }} {...props}>
      {children}
    </DialogContext.Provider>
  );
}
