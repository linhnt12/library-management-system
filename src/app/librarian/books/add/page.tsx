'use client';

import { Box, Stack, Grid, GridItem } from '@chakra-ui/react';
import {
  FormSelect,
  FormInput,
  FormField,
  FormTextarea,
  FormSection,
  FormDivider,
  FormButtons,
  Dialog,
} from '@/components';
import { BOOK_TYPE_OPTIONS } from '@/constants';
import { useBookForm } from '@/lib/hooks';

export default function AddBookPage() {
  const {
    form,
    errors,
    isSubmitting,
    setField,
    handleSubmit,
    handleCancel,
    dialog,
    handleConfirm,
    handleDialogCancel,
  } = useBookForm();

  return (
    <Box as="form" onSubmit={handleSubmit} px={4} py={2} paddingBottom={0}>
      <Stack gap={3}>
        {/* Section 1: Basic Information */}
        <FormSection title="Basic Information">
          {/* Title */}
          <FormField label="Title" error={errors.title}>
            <FormInput
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="Enter title"
            />
          </FormField>

          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem>
              {/* ISBN */}
              <FormField label="ISBN">
                <FormInput
                  value={form.isbn}
                  onChange={e => setField('isbn', e.target.value)}
                  placeholder="Enter ISBN"
                />
              </FormField>
            </GridItem>

            <GridItem>
              {/* Author ID */}
              <FormField label="Author ID" error={errors.authorId}>
                <FormInput
                  type="number"
                  value={form.authorId}
                  onChange={e => setField('authorId', e.target.value)}
                  placeholder="Enter author ID"
                />
              </FormField>
            </GridItem>
          </Grid>
        </FormSection>

        <FormDivider />

        {/* Section 2: Publication Information */}
        <FormSection title="Publication Information">
          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            <GridItem>
              {/* Publish year */}
              <FormField label="Publish year" error={errors.publishYear}>
                <FormInput
                  type="number"
                  value={form.publishYear}
                  onChange={e => setField('publishYear', e.target.value)}
                  placeholder="Enter publish year"
                />
              </FormField>
            </GridItem>

            <GridItem>
              {/* Publisher */}
              <FormField label="Publisher">
                <FormInput
                  value={form.publisher}
                  onChange={e => setField('publisher', e.target.value)}
                  placeholder="Enter publisher"
                />
              </FormField>
            </GridItem>

            <GridItem>
              {/* Edition */}
              <FormField label="Edition">
                <FormInput
                  value={form.edition}
                  onChange={e => setField('edition', e.target.value)}
                  placeholder="Enter edition"
                />
              </FormField>
            </GridItem>
          </Grid>
        </FormSection>

        <FormDivider />

        {/* Section 3: Physical & Pricing Information */}
        <FormSection title="Physical & Pricing Information">
          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            {/* Page count */}
            <GridItem>
              <FormField label="Page count" error={errors.pageCount}>
                <FormInput
                  type="number"
                  value={form.pageCount}
                  onChange={e => setField('pageCount', e.target.value)}
                  placeholder="Enter page count"
                />
              </FormField>
            </GridItem>

            <GridItem>
              {/* Price */}
              <FormField label="Price" error={errors.price}>
                <FormInput
                  type="number"
                  value={form.price}
                  onChange={e => setField('price', e.target.value)}
                  placeholder="Enter price"
                />
              </FormField>
            </GridItem>

            <GridItem>
              {/* Type */}
              <FormField label="Type">
                <FormSelect
                  items={BOOK_TYPE_OPTIONS}
                  value={form.type}
                  onChange={val => setField('type', val)}
                  placeholder="Select type"
                  height="50px"
                />
              </FormField>
            </GridItem>
          </Grid>
        </FormSection>

        <FormDivider />

        {/* Section 4: Additional Information */}
        <FormSection title="Additional Information">
          {/* Cover image (URL) */}
          <FormField label="Cover image (URL)">
            <FormInput
              value={form.coverImageUrl}
              onChange={e => setField('coverImageUrl', e.target.value)}
              placeholder="https://..."
            />
          </FormField>

          {/* Description */}
          <FormField label="Description">
            <FormTextarea
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              placeholder="Enter description"
            />
          </FormField>
        </FormSection>

        {/* Buttons */}
        <FormButtons
          submitLabel="Add Book"
          cancelLabel="Cancel"
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
        />
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={handleDialogCancel}
        title={dialog.title}
        content={dialog.message}
        buttons={[
          {
            label: dialog.cancelText,
            onClick: handleDialogCancel,
            variant: 'secondary',
          },
          {
            label: dialog.confirmText,
            onClick: handleConfirm,
            variant: 'primary',
          },
        ]}
        showCloseButton={false}
      />
    </Box>
  );
}
