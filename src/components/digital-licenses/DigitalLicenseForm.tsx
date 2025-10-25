'use client';

import { Dialog, FormField, FormInput, FormSelect, FormTextarea } from '@/components';
import { DIGITAL_LICENSE_MODEL_OPTIONS } from '@/constants';
import { useDigitalLicenseForm } from '@/lib/hooks';
import { Box, Stack } from '@chakra-ui/react';
import { DigitalLicenseModel } from '@prisma/client';

interface DigitalLicenseFormProps {
  bookId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DigitalLicenseForm({
  bookId,
  isOpen,
  onClose,
  onSuccess,
}: DigitalLicenseFormProps) {
  const { form, errors, isSubmitting, setField, handleSubmit, handleCancel } =
    useDigitalLicenseForm(bookId, () => {
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    });

  const handleFormSubmit = async () => {
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    await handleSubmit(fakeEvent);
  };

  const handleDialogClose = () => {
    handleCancel();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleDialogClose}
      title="Add Digital License"
      content={
        <Box>
          <Stack gap={4}>
            {/* License Model */}
            <FormField label="License Model *" error={errors.licenseModel}>
              <FormSelect
                items={DIGITAL_LICENSE_MODEL_OPTIONS}
                value={form.licenseModel}
                onChange={value => setField('licenseModel', value as DigitalLicenseModel)}
                placeholder="Select license model"
                height="50px"
              />
            </FormField>

            {/* Total Copies */}
            <FormField label="Total Copies" error={errors.totalCopies}>
              <FormInput
                type="number"
                value={form.totalCopies}
                onChange={e => setField('totalCopies', e.target.value)}
                placeholder="Leave empty for unlimited (optional)"
                min="1"
              />
            </FormField>

            {/* Notes */}
            <FormField label="Notes" error={errors.notes}>
              <FormTextarea
                value={form.notes}
                onChange={e => setField('notes', e.target.value)}
                placeholder="Additional information about this license (optional)"
                rows={4}
                maxLength={1000}
              />
            </FormField>
          </Stack>
        </Box>
      }
      buttons={[
        {
          label: 'Cancel',
          variant: 'secondary',
          onClick: handleDialogClose,
        },
        {
          label: isSubmitting ? 'Creating...' : 'Create License',
          variant: 'primary',
          onClick: handleFormSubmit,
        },
      ]}
    />
  );
}
