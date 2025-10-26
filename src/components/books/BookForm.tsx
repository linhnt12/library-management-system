'use client';

import {
  Dialog,
  FormButtons,
  FormDivider,
  FormField,
  FormInput,
  FormSection,
  FormSelect,
  FormSelectSearch,
  FormTextarea,
  SelectOption,
} from '@/components';
import { useAuthorOptions, useBookForm, useCategoryOptions } from '@/lib/hooks';
import { Box, Flex, Grid, GridItem, Image, Input, Stack, Text } from '@chakra-ui/react';
import { FiUpload, FiX } from 'react-icons/fi';

interface BookFormProps {
  bookId?: number;
  submitLabel?: string;
  cancelLabel?: string;
}

export function BookForm({
  bookId,
  submitLabel = 'Save Book',
  cancelLabel = 'Cancel',
}: BookFormProps) {
  const authorOptions = useAuthorOptions();
  const categoryOptions = useCategoryOptions();
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
    coverImagePreview,
    fileInputRef,
    handleCoverImageChange,
    handleRemoveCoverImage,
    handleCoverImageClick,
  } = useBookForm(bookId);

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

          {/* Author */}
          <FormField label="Author" error={errors.authorId}>
            <FormSelectSearch
              value={
                form.authorId ? authorOptions.find(opt => opt.value === form.authorId) : undefined
              }
              onChange={val => setField('authorId', String((val as SelectOption)?.value || ''))}
              options={authorOptions}
              placeholder="Select author"
              fontSize="md"
            />
          </FormField>

          <Grid templateColumns={{ base: '1fr', md: '3fr 1fr' }} gap={4}>
            <GridItem>
              {/* ISBN */}
              <FormField label="ISBN" error={errors.isbn}>
                <FormInput
                  value={form.isbn}
                  onChange={e => setField('isbn', e.target.value)}
                  placeholder="Enter ISBN"
                />
              </FormField>
            </GridItem>

            <GridItem>
              {/* Status */}
              <FormField label="Status">
                <FormSelect
                  items={[
                    { label: 'Active', value: 'false' },
                    { label: 'Inactive', value: 'true' },
                  ]}
                  value={form.isDeleted ? 'true' : 'false'}
                  onChange={value => setField('isDeleted', value === 'true')}
                  placeholder="Select status"
                  height="50px"
                />
              </FormField>
            </GridItem>
          </Grid>

          {/* Categories */}
          <FormField label="Categories" error={errors.categories}>
            <FormSelectSearch
              value={form.categories || []}
              onChange={val => setField('categories', val as SelectOption[])}
              options={categoryOptions}
              placeholder="Select categories"
              multi
            />
          </FormField>
        </FormSection>

        <FormDivider />

        {/* Section 2: Book Cover & Description */}
        <FormSection title="Book Cover & Description">
          {/* Cover image upload */}
          <FormField label="Cover Image">
            <Stack gap={3}>
              {/* Image Preview */}
              {(coverImagePreview || form.coverImageUrl) && (
                <Box position="relative" w="150px" h="200px">
                  <Image
                    src={coverImagePreview || form.coverImageUrl || ''}
                    alt="Cover preview"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    borderRadius="md"
                    border="2px solid"
                    borderColor="gray.200"
                  />
                  <Box
                    position="absolute"
                    top="-8px"
                    right="-8px"
                    bg="secondary.500"
                    color="white"
                    borderRadius="full"
                    border="2px solid"
                    borderColor="white"
                    w="24px"
                    h="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    onClick={handleRemoveCoverImage}
                    _hover={{ bg: 'secondary.600' }}
                    transition="background 0.2s"
                  >
                    <FiX size={14} />
                  </Box>
                </Box>
              )}

              {/* Upload Button */}
              {!coverImagePreview && !form.coverImageUrl && (
                <Box
                  onClick={handleCoverImageClick}
                  p={6}
                  border="2px dashed"
                  borderColor="gray.300"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ borderColor: 'secondary.500', bg: 'gray.50' }}
                  transition="all 0.2s"
                >
                  <Flex direction="column" align="center" gap={2}>
                    <FiUpload size={32} color="gray.400" />
                    <Text color="gray.500" fontSize="sm">
                      Click to upload cover image
                    </Text>
                    <Text color="gray.400" fontSize="xs">
                      JPG, PNG, GIF or WebP (max 5MB)
                    </Text>
                  </Flex>
                </Box>
              )}

              {/* Hidden file input */}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleCoverImageChange}
                display="none"
              />
            </Stack>
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

        <FormDivider />

        {/* Section 3: Publication Information */}
        <FormSection title="Publication Information">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
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

        {/* Section 4: Physical & Pricing Information */}
        <FormSection title="Physical & Pricing Information">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
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
          </Grid>
        </FormSection>

        {/* Buttons */}
        <FormButtons
          submitLabel={submitLabel}
          cancelLabel={cancelLabel}
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
