import { useState } from 'react';

export interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const initialState: DialogState = {
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  onConfirm: () => {},
  onCancel: () => {},
};

export function useDialog() {
  const [dialog, setDialog] = useState<DialogState>(initialState);

  const openDialog = (config: Omit<DialogState, 'isOpen'>) => {
    setDialog({
      ...config,
      isOpen: true,
    });
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    dialog.onConfirm();
    closeDialog();
  };

  const handleCancel = () => {
    if (dialog.onCancel) {
      dialog.onCancel();
    }
    closeDialog();
  };

  return {
    dialog,
    openDialog,
    closeDialog,
    handleConfirm,
    handleCancel,
  };
}
