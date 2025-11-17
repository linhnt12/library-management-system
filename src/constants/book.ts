import { getConditionOptions, getStatusOptions } from '@/lib/utils/enum-utils';
import { Condition, ItemStatus } from '@prisma/client';

// Custom labels for condition
export const CONDITION_LABELS: Partial<Record<Condition, string>> = {
  NEW: 'New',
  GOOD: 'Good',
  WORN: 'Worn',
  DAMAGED: 'Damaged',
  LOST: 'Lost',
};

// Custom labels for status
export const STATUS_LABELS: Partial<Record<ItemStatus, string>> = {
  AVAILABLE: 'Available',
  ON_BORROW: 'On Borrow',
  RESERVED: 'Reserved',
  MAINTENANCE: 'Maintenance',
  RETIRED: 'Retired',
  LOST: 'Lost',
};

// Book item options
export const BOOK_ITEM_CONDITION_OPTIONS = getConditionOptions(CONDITION_LABELS);
export const BOOK_ITEM_STATUS_OPTIONS = getStatusOptions(STATUS_LABELS);

// Mock data for book status
export const BOOK_STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'LOST', label: 'Lost' },
  { value: 'DAMAGED', label: 'Damaged' },
];

// Book sort options for user search
export const BOOK_SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Title A-Z', value: 'title-asc' },
  { label: 'Title Z-A', value: 'title-desc' },
  { label: 'Year Newest', value: 'year-newest' },
  { label: 'Year Oldest', value: 'year-oldest' },
];

// Book Edition Format options
export const EDITION_FORMAT_OPTIONS = [
  { label: 'E-Book', value: 'EBOOK' },
  { label: 'Audio Book', value: 'AUDIO' },
];

// Book Edition File Format options
export const FILE_FORMAT_OPTIONS = [
  { label: 'EPUB', value: 'EPUB' },
  { label: 'PDF', value: 'PDF' },
  { label: 'MOBI', value: 'MOBI' },
  { label: 'MP3 Audio', value: 'AUDIO_MP3' },
  { label: 'M4B Audio', value: 'AUDIO_M4B' },
  { label: 'Other', value: 'OTHER' },
];

// DRM Type options
export const DRM_TYPE_OPTIONS = [
  { label: 'None', value: 'NONE' },
  { label: 'Watermark', value: 'WATERMARK' },
  { label: 'Adobe DRM', value: 'ADOBE_DRM' },
  { label: 'LCP (Licensed Content Protection)', value: 'LCP' },
  { label: 'Custom', value: 'CUSTOM' },
];
