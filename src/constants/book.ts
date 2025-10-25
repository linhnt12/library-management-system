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

// Digital License Model options
export const DIGITAL_LICENSE_MODEL_OPTIONS = [
  { label: 'One Copy One User', value: 'ONE_COPY_ONE_USER' },
  { label: 'Metered', value: 'METERED' },
  { label: 'Simultaneous', value: 'SIMULTANEOUS' },
  { label: 'Owned', value: 'OWNED' },
  { label: 'Subscription', value: 'SUBSCRIPTION' },
];
